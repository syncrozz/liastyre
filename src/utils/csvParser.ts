import { Tire, CategoryType } from "../types/tyre";

export const KNOWN_BRANDS = [
  "MICHELIN", "GOODYEAR", "HANKOOK", "CONTINENTAL", "NEXEN", "TOYO",
  "AUTOGREEN", "DURATURN", "KINGBOSS", "DURUN", "GEPORMAX", "BRIDGESTONE",
  "LINGLONG", "NEOLIN", "AEROFORCE", "LEAO", "LAUFENN", "YOKOHAMA",
  "ATLANDER", "WESTLAKE", "LANVIGATOR", "ROADX", "GRIPMAX"
];

// Helper to extract brand and model cleanly from strings like "GOODYEAR ADP2 2026", "LING LONG 2025"
export const extractBrandAndModel = (rawStr: string): { brand: string; model: string } => {
  let s = (rawStr || "").trim().replace(/\s+/g, " ");
  s = s.replace(/^GOOD\s+YEAR/i, "GOODYEAR");
  s = s.replace(/^LING\s+LONG/i, "LINGLONG");
  s = s.replace(/^WEST\s+LAKE/i, "WESTLAKE");
  s = s.replace(/^(LION\s+SPORT\s+A\/T\s+LEAO|LION\s+LEAO\s+SPORT|LEO\s+LION\s+SPORT|LEAO\s+LION\s+TYRE)/i, "LEAO");
  s = s.replace(/^SMART\s+CHASER/i, "AUTOGREEN SMART CHASER");
  s = s.replace(/^VANPLUS\s+ATLANDER/i, "ATLANDER");
  s = s.replace(/^CATCHFORS\s+AT\s+LANVIGATOR/i, "LANVIGATOR");

  const parts = s.split(" ");
  let matchedBrand = parts[0] ? parts[0].toUpperCase() : "GENERIC";
  let modelParts = parts.slice(1);

  for (const b of KNOWN_BRANDS) {
    if (s.toUpperCase().startsWith(b)) {
      matchedBrand = b;
      const rest = s.slice(b.length).trim();
      modelParts = rest ? rest.split(" ") : [modelParts.join(" ")];
      break;
    }
  }

  const modelName = modelParts.join(" ") || "Standard Series";
  return { brand: matchedBrand, model: modelName };
};

// Normalize Size Format (e.g., "155.70.12" -> "155/70R12", "175.R.13C" -> "175R13C", "215.75.17.5" -> "215/75R17.5")
export const normalizeSize = (rawSize: string): string => {
  if (!rawSize) return "205/55R16";
  let s = rawSize.trim();
  if (s.includes("/") && s.includes("R")) return s.toUpperCase();

  // Commercial R format: 175.R.13C, 185.R.14C, 195.R.15C, 165.R.14C
  if (/^\d+\.R\.\d+/i.test(s)) {
    return s.replace(/^(\d+)\.R\.(\d+.*)$/i, "$1R$2").toUpperCase();
  }
  // Commercial R format: 185.R14C, 195.R15C, 195.R.15
  if (/^\d+\.R\d+/i.test(s)) {
    return s.replace(/^(\d+)\.R(\d+.*)$/i, "$1R$2").toUpperCase();
  }
  // Decimal rim format: 215.75.17.5 -> 215/75R17.5
  if (/^\d+\.\d+\.\d+\.\d+/.test(s)) {
    const parts = s.split(".");
    return `${parts[0]}/${parts[1]}R${parts[2]}.${parts[3]}`.toUpperCase();
  }
  // Standard format: 155.70.12 -> 155/70R12 or 215.70.16C -> 215/70R16C
  if (/^\d+\.\d+\.\d+/.test(s)) {
    const parts = s.split(".");
    const width = parts[0];
    const aspect = parts[1];
    const rest = parts.slice(2).join("");
    return `${width}/${aspect}R${rest}`.toUpperCase();
  }

  s = s.replace(/^(\d+)\.(R\d+.*)$/i, "$1R$2");
  s = s.replace(/^(\d+)\.(\d+)\.(\d+)(.*)$/, "$1/$2R$3$4");
  return s.toUpperCase();
};

// Helper to parse line with CSV quotes
export const parseCsvRow = (line: string): string[] => {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
};

// Parse CSV text to Tire array matching latest 15-column format
export const parseCSVTextToTyres = (raw: string): Tire[] => {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) return [];

  let startIdx = 0;
  const firstLine = lines[0].toUpperCase();
  const isHeader =
    firstLine.includes("SIZE") ||
    firstLine.includes("BRAND") ||
    firstLine.includes("HARGA") ||
    firstLine.includes("TEBAL") ||
    firstLine.includes("MARKET_PRICE");

  if (isHeader) {
    startIdx = 1; // Header row
  }

  const tyresList: Tire[] = [];

  for (let i = startIdx; i < lines.length; i++) {
    const cols = parseCsvRow(lines[i]);
    if (cols.length < 3) continue;

    let rawBrandId = "";
    let rowSeq = i;
    let rawSize = "";
    let rawBrandFull = "";
    let treadDepth = 7.5;
    let nexenStock = 0;
    let goodyearStock = 0;
    let storeStockVal = 0;
    let totalStockVal = 0;
    let mktPriceVal = 180;
    let costPriceVal = 140;

    // Handle user's 15-column template structure:
    // Index 0: BRAND ID
    // Index 1: NO
    // Index 2: SIZE TAYAR
    // Index 3: BRAND
    // Index 4: TEBAL - MM
    // Index 5: NEXEN TDU
    // Index 6: GOODYEAR
    // Index 7: STORE TMD
    // Index 8: TOTAL STOK
    // Index 9: HARGA MARKET - REGULAR 1
    // Index 10: HARGA MARKET - NEW 2
    // Index 11: HARGA STOK (Cost)
    // Index 12: NEW PROFIT nov 25
    // Index 13: TOTAL STOK VALUE
    // Index 14: SOLD VALUE
    if (cols.length >= 10 && (cols[2].includes(".") || cols[2].includes("/") || cols[2].toUpperCase().includes("R"))) {
      rawBrandId = cols[0] || "";
      rowSeq = parseInt(cols[1]) || i;
      rawSize = cols[2] || "205/55R16";
      rawBrandFull = cols[3] || "GOODYEAR Standard Series";
      treadDepth = parseFloat(cols[4]) || 7.5;
      nexenStock = parseInt(cols[5]) || 0;
      goodyearStock = parseInt(cols[6]) || 0;
      storeStockVal = parseInt(cols[7]) || 0;
      totalStockVal = parseInt(cols[8]) || (storeStockVal + nexenStock + goodyearStock);
      mktPriceVal = parseFloat((cols[9] || "0").replace(/,/g, "").replace(/"/g, "")) || 0;
      if (mktPriceVal === 0 && cols[10]) {
        mktPriceVal = parseFloat((cols[10] || "0").replace(/,/g, "").replace(/"/g, "")) || 0;
      }
      costPriceVal = parseFloat((cols[11] || "0").replace(/,/g, "").replace(/"/g, "")) || (mktPriceVal > 0 ? Math.round(mktPriceVal * 0.75) : 100);
    } else {
      // Fallback / legacy format detection
      rawSize = cols[2] || cols[1] || "";
      rawBrandFull = cols[3] || cols[2] || "BRAND";
      treadDepth = parseFloat(cols[4]) || 7.5;
      totalStockVal = parseInt(cols[11] || cols[8] || cols[7] || "10") || 10;
      storeStockVal = parseInt(cols[10] || cols[7] || String(totalStockVal)) || totalStockVal;
      nexenStock = parseInt(cols[8] || cols[5]) || 0;
      goodyearStock = parseInt(cols[9] || cols[6]) || 0;
      mktPriceVal = parseFloat((cols[12] || cols[9] || "0").replace(/,/g, "").replace(/"/g, "")) || 180;
      costPriceVal = parseFloat((cols[13] || cols[11] || "0").replace(/,/g, "").replace(/"/g, "")) || 140;
    }

    const { brand: brandName, model: modelName } = extractBrandAndModel(rawBrandFull);
    const formattedSize = normalizeSize(rawSize);
    const sizeParts = formattedSize.split("/");
    const width = parseInt(sizeParts[0]) || 205;
    let aspect = 55;
    let rim = 16;

    if (sizeParts[1]) {
      const sub = sizeParts[1].split("R");
      aspect = parseInt(sub[0]) || 55;
      rim = parseFloat(sub[1]) || 16;
    } else if (formattedSize.includes("R")) {
      const rParts = formattedSize.split("R");
      rim = parseFloat(rParts[1]) || 14;
      aspect = 80;
    }

    // Determine category smartly based on size and model
    let cat: CategoryType = "Passenger";
    const fullText = (formattedSize + " " + rawBrandFull).toUpperCase();
    if (
      fullText.includes("17.5") ||
      fullText.includes("VAN") ||
      fullText.includes("CARGO") ||
      fullText.includes("RA18") ||
      fullText.includes("LT") ||
      fullText.includes("COMMERCIAL") ||
      fullText.includes("SUMTIRA") ||
      fullText.includes("CTX") ||
      formattedSize.toUpperCase().endsWith("C")
    ) {
      cat = "Commercial / Van";
    } else if (
      fullText.includes("SUV") ||
      fullText.includes("A/T") ||
      fullText.includes(" AT ") ||
      fullText.includes("AT002") ||
      fullText.includes("AT2") ||
      fullText.includes("M/T") ||
      fullText.includes("MT") ||
      fullText.includes("XTREME") ||
      fullText.includes("GEOLANDER") ||
      fullText.includes("D697") ||
      fullText.includes("DYNAPRO") ||
      fullText.includes("CROSSWIND A/T") ||
      fullText.includes("GRANDTOUR") ||
      fullText.includes("ENTERRA") ||
      fullText.includes("4X4") ||
      fullText.includes("OFFROAD") ||
      (width >= 225 && rim >= 17 && aspect >= 60)
    ) {
      cat = fullText.includes("M/T") || fullText.includes("XTREME") || fullText.includes("4X4")
        ? "4x4 / Offroad"
        : "SUV / Crossover";
    } else if (
      fullText.includes("UHP") ||
      fullText.includes("SPORT") ||
      fullText.includes("TR1") ||
      fullText.includes("EAGLE F1") ||
      fullText.includes("VENTUS PRIME") ||
      aspect <= 45
    ) {
      cat = "Performance / UHP";
    }

    // Extract Year if present e.g. 2026, 2025, 2024, 2023, 2021, 2019
    const yearMatch = rawBrandFull.match(/\b(201\d|202\d)\b/);
    const tireYear = yearMatch ? parseInt(yearMatch[1]) : 2026;

    let baseId =
      rawBrandId && rawBrandId.startsWith("BR")
        ? `${rawBrandId}-${i}`
        : `SKU-${rowSeq}-${i}-${brandName.slice(0, 3)}-${formattedSize.replace(/[^A-Za-z0-9]/g, "")}-${tireYear}`;

    // Ensure strict uniqueness in list
    let tireId = baseId;
    let dupSuffix = 1;
    while (tyresList.some((t) => t.id === tireId)) {
      tireId = `${baseId}-${dupSuffix}`;
      dupSuffix++;
    }

    tyresList.push({
      id: tireId,
      brandId: brandName.toLowerCase().replace(/[^a-z0-9]/g, ""),
      brand: brandName,
      size: formattedSize,
      width,
      aspectRatio: aspect,
      rimSize: Math.floor(rim),
      model: modelName,
      pattern: fullText.includes("ROTATION") ? "Directional / Rotation" : "All-Weather Dynamic",
      category: cat,
      treadDepthMm: treadDepth,
      speedRating: aspect <= 45 ? "W" : aspect <= 55 ? "V" : "H",
      loadIndex: cat === "Commercial / Van" ? 104 : width >= 225 ? 99 : 91,
      marketPrice: mktPriceVal,
      costPrice: costPriceVal,
      profit: mktPriceVal - costPriceVal,
      storeStock: storeStockVal,
      supplierStockNexen: nexenStock,
      supplierStockGoodyear: goodyearStock,
      totalStock: totalStockVal,
      status: totalStockVal <= 0 ? "Out of Stock" : storeStockVal <= 2 ? "Low Stock" : "In Stock",
      year: tireYear,
      wetGripRating: mktPriceVal >= 300 ? "A" : "B",
      noiseLevelDb: aspect <= 45 ? 71 : 68,
      fuelSavingRating: "B",
      treadLifeKm: cat === "Commercial / Van" ? 65000 : 50000,
      description: `Tayar ${brandName} ${modelName} saiz ${formattedSize} spesifikasi rasmi Lias Tyre.`,
      keyTechnologies: ["Sync Auto-Mapped", "TMD Inventory Certified"]
    });
  }

  return tyresList;
};
