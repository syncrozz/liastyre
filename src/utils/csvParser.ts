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

// Helper to clean and parse float value
const parseCleanNum = (val: string | undefined, defaultVal = 0): number => {
  if (!val) return defaultVal;
  const cleaned = val.replace(/,/g, "").replace(/"/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? defaultVal : num;
};

interface ColumnMap {
  bil: number;
  size: number;
  brand: number;
  madeIn: number;
  nexen: number;
  goodyear: number;
  storeTmd: number;
  totalStock: number;
  memberPrice: number;
  newCustomerPrice: number;
  supplierCost: number;
  profit: number;
  totalStockValue: number;
  totalIfSold: number;
  treadDepth: number;
}

// Dynamically analyze CSV Header row to extract column indexes
export const detectColumnMapping = (headers: string[]): ColumnMap => {
  const map: ColumnMap = {
    bil: -1,
    size: -1,
    brand: -1,
    madeIn: -1,
    nexen: -1,
    goodyear: -1,
    storeTmd: -1,
    totalStock: -1,
    memberPrice: -1,
    newCustomerPrice: -1,
    supplierCost: -1,
    profit: -1,
    totalStockValue: -1,
    totalIfSold: -1,
    treadDepth: -1,
  };

  headers.forEach((rawH, idx) => {
    const h = rawH.toUpperCase().trim();
    if (!h) return;

    if (h === "BIL" || h === "NO" || h === "NO." || h === "ID") {
      if (map.bil === -1) map.bil = idx;
    } else if (h.includes("SIZE") || h.includes("SAIZ")) {
      if (map.size === -1) map.size = idx;
    } else if (h === "MADE IN" || h === "MADE" || h === "ORIGIN" || h.includes("BUATAN") || h === "NEGARA") {
      if (map.madeIn === -1) map.madeIn = idx;
    } else if (h.includes("NEXEN")) {
      if (map.nexen === -1) map.nexen = idx;
    } else if (h.includes("GOODYEAR")) {
      if (map.goodyear === -1) map.goodyear = idx;
    } else if (h.includes("STORE") || h.includes("TMD") || h.includes("KEDAI")) {
      if (map.storeTmd === -1) map.storeTmd = idx;
    } else if (h.includes("TOTAL STOK") || h.includes("TOTAL STOCK") || h.includes("JUMLAH STOK")) {
      if (map.totalStock === -1) map.totalStock = idx;
    } else if (h.includes("MEMBER") || h.includes("AHLI") || h.includes("REGULAR 1")) {
      if (map.memberPrice === -1) map.memberPrice = idx;
    } else if (h.includes("NEW CUSTOMER") || h.includes("NEW 2") || (h.includes("HARGA MARKET") && !h.includes("MEMBER"))) {
      if (map.newCustomerPrice === -1) map.newCustomerPrice = idx;
    } else if (h.includes("SUPPLIER") || h.includes("HARGA STOK") || h.includes("HARGA KOS") || h === "KOS" || h === "COST") {
      if (map.supplierCost === -1) map.supplierCost = idx;
    } else if (h.includes("PROFIT") || h.includes("UNTUNG")) {
      if (map.profit === -1) map.profit = idx;
    } else if (h.includes("TOTAL STOK VALUE") || h.includes("STOK VALUE") || h.includes("STOCK VALUE")) {
      if (map.totalStockValue === -1) map.totalStockValue = idx;
    } else if (h.includes("IF SOLD") || h.includes("SOLD VALUE") || h.includes("JUALAN")) {
      if (map.totalIfSold === -1) map.totalIfSold = idx;
    } else if (h.includes("TEBAL") || h.includes("TREAD") || h.includes("MM")) {
      if (map.treadDepth === -1) map.treadDepth = idx;
    } else if (h === "BRAND" || h.includes("JENAMA") || h.includes("MODEL") || h.includes("PATTERN")) {
      if (map.brand === -1) map.brand = idx;
    }
  });

  // Default fallbacks for the 14-column official template if some headers weren't named identically:
  // Bil, SIZE TAYAR, BRAND, MADE IN, NEXEN TDU, GOODYEAR, STORE TMD, TOTAL STOK, HARGA MARKET FOR MEMBERS, HARGA MARKET (NEW CUSTOMER), HARGA SUPPLIER , PROFIT, TOTAL STOK VALUE, TOTAL IF SOLD
  if (map.size === -1) map.size = 1;
  if (map.brand === -1) map.brand = 2;
  if (map.madeIn === -1 && headers.length >= 4) map.madeIn = 3;
  if (map.nexen === -1) map.nexen = 4;
  if (map.goodyear === -1) map.goodyear = 5;
  if (map.storeTmd === -1) map.storeTmd = 6;
  if (map.totalStock === -1) map.totalStock = 7;
  if (map.memberPrice === -1) map.memberPrice = 8;
  if (map.newCustomerPrice === -1) map.newCustomerPrice = 9;
  if (map.supplierCost === -1) map.supplierCost = 10;
  if (map.profit === -1) map.profit = 11;
  if (map.totalStockValue === -1) map.totalStockValue = 12;
  if (map.totalIfSold === -1) map.totalIfSold = 13;

  return map;
};

// Parse CSV text to Tire array dynamically synced via header elements
export const parseCSVTextToTyres = (raw: string): Tire[] => {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) return [];

  let startIdx = 0;
  const firstLine = lines[0];
  const firstCols = parseCsvRow(firstLine);
  const firstLineUpper = firstLine.toUpperCase();

  const isHeader =
    firstLineUpper.includes("SIZE") ||
    firstLineUpper.includes("BRAND") ||
    firstLineUpper.includes("HARGA") ||
    firstLineUpper.includes("TEBAL") ||
    firstLineUpper.includes("MADE IN") ||
    firstLineUpper.includes("BIL") ||
    firstLineUpper.includes("MARKET");

  let colMap: ColumnMap;

  if (isHeader) {
    colMap = detectColumnMapping(firstCols);
    startIdx = 1;
  } else {
    // If no header found, default to 14-col index structure
    colMap = detectColumnMapping([
      "Bil", "SIZE TAYAR", "BRAND", "MADE IN", "NEXEN TDU", "GOODYEAR", "STORE TMD",
      "TOTAL STOK", "HARGA MARKET FOR MEMBERS", "HARGA MARKET (NEW CUSTOMER)",
      "HARGA SUPPLIER", "PROFIT", "TOTAL STOK VALUE", "TOTAL IF SOLD"
    ]);
  }

  const tyresList: Tire[] = [];

  for (let i = startIdx; i < lines.length; i++) {
    const cols = parseCsvRow(lines[i]);
    if (cols.length < 3) continue;

    const rowSeq = colMap.bil !== -1 && cols[colMap.bil] ? parseInt(cols[colMap.bil], 10) || i : i;
    const rawSize = (colMap.size !== -1 ? cols[colMap.size] : cols[1]) || "205/55R16";
    const rawBrandFull = (colMap.brand !== -1 ? cols[colMap.brand] : cols[2]) || "GOODYEAR Standard Series";
    const rawMadeIn = colMap.madeIn !== -1 && cols[colMap.madeIn] ? cols[colMap.madeIn].trim().toUpperCase() : undefined;
    const treadDepth = colMap.treadDepth !== -1 && cols[colMap.treadDepth] ? parseCleanNum(cols[colMap.treadDepth], 7.5) : 7.5;
    
    const nexenStock = colMap.nexen !== -1 ? parseCleanNum(cols[colMap.nexen], 0) : 0;
    const goodyearStock = colMap.goodyear !== -1 ? parseCleanNum(cols[colMap.goodyear], 0) : 0;
    const storeStockVal = colMap.storeTmd !== -1 ? parseCleanNum(cols[colMap.storeTmd], 0) : 0;
    
    let totalStockVal = colMap.totalStock !== -1 ? parseCleanNum(cols[colMap.totalStock], 0) : 0;
    if (totalStockVal === 0 && (storeStockVal > 0 || nexenStock > 0 || goodyearStock > 0)) {
      totalStockVal = storeStockVal + nexenStock + goodyearStock;
    }

    const memberPriceVal = colMap.memberPrice !== -1 ? parseCleanNum(cols[colMap.memberPrice], 0) : 0;
    const newCustPriceVal = colMap.newCustomerPrice !== -1 ? parseCleanNum(cols[colMap.newCustomerPrice], 0) : 0;
    
    // Determine market price: prefer member or new customer price
    let mktPriceVal = newCustPriceVal > 0 ? newCustPriceVal : memberPriceVal > 0 ? memberPriceVal : 180;
    if (mktPriceVal === 0) mktPriceVal = 180;

    let costPriceVal = colMap.supplierCost !== -1 ? parseCleanNum(cols[colMap.supplierCost], 0) : 0;
    if (costPriceVal === 0 && mktPriceVal > 0) {
      costPriceVal = Math.round(mktPriceVal * 0.75);
    }

    let profitVal = colMap.profit !== -1 ? parseCleanNum(cols[colMap.profit], mktPriceVal - costPriceVal) : mktPriceVal - costPriceVal;
    const totalStkVal = colMap.totalStockValue !== -1 ? parseCleanNum(cols[colMap.totalStockValue], costPriceVal * storeStockVal) : costPriceVal * storeStockVal;
    const totalSoldVal = colMap.totalIfSold !== -1 ? parseCleanNum(cols[colMap.totalIfSold], mktPriceVal * storeStockVal) : mktPriceVal * storeStockVal;

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
    const tireYear = yearMatch ? parseInt(yearMatch[1], 10) : 2026;

    const baseId = `SKU-${rowSeq}-${i}-${brandName.slice(0, 3)}-${formattedSize.replace(/[^A-Za-z0-9]/g, "")}-${tireYear}`;

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
      memberPrice: memberPriceVal > 0 ? memberPriceVal : mktPriceVal,
      newCustomerPrice: newCustPriceVal > 0 ? newCustPriceVal : mktPriceVal,
      costPrice: costPriceVal,
      profit: profitVal,
      totalStockValue: totalStkVal,
      totalIfSold: totalSoldVal,
      storeStock: storeStockVal,
      supplierStockNexen: nexenStock,
      supplierStockGoodyear: goodyearStock,
      totalStock: totalStockVal,
      status: totalStockVal <= 0 ? "Out of Stock" : storeStockVal <= 2 ? "Low Stock" : "In Stock",
      year: tireYear,
      madeIn: rawMadeIn,
      countryOfOrigin: rawMadeIn,
      wetGripRating: mktPriceVal >= 300 ? "A" : "B",
      noiseLevelDb: aspect <= 45 ? 71 : 68,
      fuelSavingRating: "B",
      treadLifeKm: cat === "Commercial / Van" ? 65000 : 50000,
      description: `Tayar ${brandName} ${modelName} saiz ${formattedSize} spesifikasi rasmi Lias Tyre (${rawMadeIn || "Import"}).`,
      keyTechnologies: ["Sync Auto-Mapped", "TMD Inventory Certified"]
    });
  }

  return tyresList;
};
