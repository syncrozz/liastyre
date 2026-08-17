import React, { useState } from "react";
import { BarChart3, Warehouse, DollarSign, TrendingUp, AlertTriangle, Plus, PackageCheck, Layers, RefreshCw, CheckCircle2, Sparkles, FolderSync, ShieldCheck, HelpCircle, FileSpreadsheet, UploadCloud, FileText, Download } from "lucide-react";
import { Tire, UserPersona, TireStatus, CategoryType } from "../types/tyre";
import { LIAS_TYRE_CSV_SAMPLE_RAW } from "../data/csvSampleData";

interface InventoryDashboardSectionProps {
  tyres: Tire[];
  persona: UserPersona;
  onAddTyre: (newTire: Tire) => void;
  onUpdateStock: (tireId: string, newStock: number) => void;
  onSyncMasterStock?: (mode: "standard" | "popular" | "reset" | "custom", customQty?: number) => void;
  onImportBulkTyres?: (importedTyres: Tire[]) => void;
}

const KNOWN_BRANDS = [
  "MICHELIN", "GOODYEAR", "HANKOOK", "CONTINENTAL", "NEXEN", "TOYO",
  "AUTOGREEN", "DURATURN", "KINGBOSS", "DURUN", "GEPORMAX", "BRIDGESTONE",
  "LINGLONG", "NEOLIN", "AEROFORCE", "LEAO", "LAUFENN", "YOKOHAMA",
  "ATLANDER", "WESTLAKE", "LANVIGATOR", "ROADX", "GRIPMAX"
];

// Helper to extract brand and model cleanly from strings like "GOODYEAR ADP2 2026", "LING LONG 2025"
const extractBrandAndModel = (rawStr: string): { brand: string; model: string } => {
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

export const InventoryDashboardSection: React.FC<InventoryDashboardSectionProps> = ({
  tyres,
  persona,
  onAddTyre,
  onUpdateStock,
  onSyncMasterStock,
  onImportBulkTyres,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [syncNotice, setSyncNotice] = useState("");
  const [customQtyInput, setCustomQtyInput] = useState(15);
  const [selectedSyncMode, setSelectedSyncMode] = useState<"standard" | "popular" | "reset" | "custom">("standard");

  // CSV Import State
  const [csvText, setCsvText] = useState("");
  const [parsedPreview, setParsedPreview] = useState<Tire[]>([]);

  // New Tire Form State
  const [brand, setBrand] = useState("MICHELIN");
  const [size, setSize] = useState("205/55R16");
  const [model, setModel] = useState("Primacy 5");
  const [pattern, setPattern] = useState("Comfort & Silent");
  const [category, setCategory] = useState<CategoryType>("Passenger");
  const [imageId, setImageId] = useState("");
  const [marketPrice, setMarketPrice] = useState(350);
  const [costPrice, setCostPrice] = useState(280);
  const [storeStock, setStoreStock] = useState(10);

  // Normalize Size Format (e.g., "155.70.12" -> "155/70R12", "175.R.13C" -> "175R13C", "215.75.17.5" -> "215/75R17.5")
  const normalizeSize = (rawSize: string): string => {
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
  const parseCsvRow = (line: string): string[] => {
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
  const parseCSVTextToTyres = (raw: string): Tire[] => {
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
      // Index 0: BRAND ID (e.g. '', '1.00', 'BR001')
      // Index 1: NO (e.g. '1', '2', '3')
      // Index 2: SIZE TAYAR (e.g. '155.70.12', '175.65.14', '175.R.13C', '215.75.17.5')
      // Index 3: BRAND (e.g. 'GEPORMAX ECOPLUS HP 2026', 'GOODYEAR ADP2 2026')
      // Index 4: TEBAL - MM (e.g. '5.60')
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

      const tireId =
        rawBrandId && rawBrandId.startsWith("BR")
          ? rawBrandId
          : `SKU-${rowSeq}-${brandName.slice(0, 3)}-${formattedSize.replace(/[^A-Za-z0-9]/g, "")}`;

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
        totalStock: totalStockVal || storeStockVal,
        status: storeStockVal <= 0 ? "Out of Stock" : storeStockVal <= 2 ? "Low Stock" : "In Stock",
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

  const handleCsvInputChange = (text: string) => {
    setCsvText(text);
    const parsed = parseCSVTextToTyres(text);
    setParsedPreview(parsed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        handleCsvInputChange(content);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSampleCSV = () => {
    handleCsvInputChange(LIAS_TYRE_CSV_SAMPLE_RAW);
  };

  const handleDownloadCSVTemplate = () => {
    const csvHeader = "BRAND ID,NO,SIZE TAYAR,BRAND,TEBAL - MM,NEXEN TDU,GOODYEAR,STORE TMD,TOTAL STOK,HARGA MARKET - REGULAR 1,HARGA MARKET - NEW 2,HARGA STOK,NEW PROFIT nov 25,TOTAL STOK VALUE,SOLD VALUE\n";
    const sampleRows = [
      ",1,155.70.12,GEPORMAX ECOPLUS HP 2026,5.60,2.00,,6.00,8.00,124.00,134.00,85.00,39.00,680.00,992.00",
      ",2,175.65.14,GOODYEAR ADP2 2026,7.20,4.00,8.00,17.00,29.00,190.00,200.00,156.00,34.00,4524.00,5510.00",
      ",3,185.55.15,MICHELIN XM2+ 2026,7.80,,,4.00,4.00,319.00,334.00,273.00,46.00,1092.00,1276.00",
      ",4,195.55.15,NEXEN N FERA SU4 2026,7.20,4.00,5.00,17.00,26.00,190.00,205.00,149.00,16.00,3874.00,4940.00",
      ",5,205.55.16,TOYO CR1 2026,7.20,,,6.00,6.00,320.00,340.00,286.00,34.00,1716.00,1920.00",
      ",6,265.65.17,HANKOOK DYNAPRO AT2 XTREME 2026,9.00,,,4.00,4.00,470.00,500.00,400.00,70.00,1600.00,1880.00",
      ",7,185.R14C,GOODYEAR CARGO MARATHON2 2024,8.80,,,2.00,2.00,310.00,320.00,285.00,25.00,570.00,620.00"
    ].join("\n");

    const csvContent = csvHeader + sampleRows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_sync_lias_tyre.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCurrentInventoryCSV = () => {
    const csvHeader = "BRAND ID,NO,SIZE TAYAR,BRAND,TEBAL - MM,NEXEN TDU,GOODYEAR,STORE TMD,TOTAL STOK,HARGA MARKET - REGULAR 1,HARGA MARKET - NEW 2,HARGA STOK,NEW PROFIT nov 25,TOTAL STOK VALUE,SOLD VALUE\n";
    const rows = tyres.map((t, idx) => {
      const brandFull = `${t.brand} ${t.model}`;
      const totalCostVal = (t.costPrice * t.storeStock).toFixed(2);
      const soldVal = (t.marketPrice * t.storeStock).toFixed(2);
      const profitVal = (t.marketPrice - t.costPrice).toFixed(2);
      const sizeDot = t.size.replace(/\//g, ".").replace(/R/g, ".");
      const nexenStock = t.supplierStockNexen ? t.supplierStockNexen.toFixed(2) : "";
      const goodyearStock = t.supplierStockGoodyear ? t.supplierStockGoodyear.toFixed(2) : "";
      const storeStockStr = t.storeStock.toFixed(2);
      const totalStockStr = t.totalStock.toFixed(2);
      const marketPriceStr = t.marketPrice.toFixed(2);
      const promoPriceStr = (t.marketPrice + 10).toFixed(2);
      const costPriceStr = t.costPrice.toFixed(2);
      const treadStr = (t.treadDepthMm || 7.5).toFixed(2);

      return `"${t.brandId || ""}","${idx + 1}","${sizeDot}","${brandFull}",${treadStr},${nexenStock},${goodyearStock},${storeStockStr},${totalStockStr},${marketPriceStr},${promoPriceStr},${costPriceStr},${profitVal},${totalCostVal},${soldVal}`;
    }).join("\n");

    const csvContent = csvHeader + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventori_lias_tyre_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleConfirmImportCSV = () => {
    if (parsedPreview.length === 0) return;
    if (onImportBulkTyres) {
      onImportBulkTyres(parsedPreview);
    } else {
      parsedPreview.forEach((t) => onAddTyre(t));
    }
    setSyncNotice(`Penyelarasan Data Berjaya! ${parsedPreview.length} SKU tayar kini diselaraskan terus ke dalam sistem.`);
    setShowCsvModal(false);
    setCsvText("");
    setParsedPreview([]);
  };

  // Business Analytics Calculations
  const totalStockUnits = tyres.reduce((sum, t) => sum + t.storeStock, 0);
  const totalStockValue = tyres.reduce((sum, t) => sum + t.costPrice * t.storeStock, 0);
  const totalPotentialMarketValue = tyres.reduce((sum, t) => sum + t.marketPrice * t.storeStock, 0);
  const totalPotentialProfit = totalPotentialMarketValue - totalStockValue;

  const lowStockItems = tyres.filter((t) => t.storeStock <= 2);
  const brandsCount = new Set(tyres.map((t) => t.brand)).size;
  const modelsCount = new Set(tyres.map((t) => t.model)).size;

  const handleExecuteSync = (mode: "standard" | "popular" | "reset" | "custom") => {
    if (onSyncMasterStock) {
      onSyncMasterStock(mode, customQtyInput);
      let textNotice = "";
      if (mode === "standard") {
        textNotice = `Master Data Berjaya Diselaraskan! Semua ${tyres.length} SKU tayar kini disetkan kepada stok standard (12 unit).`;
      } else if (mode === "popular") {
        textNotice = `Penyelarasan Saiz Laris Berjaya! Saiz popular disetkan ke 24 unit dan saiz biasa ke 8 unit.`;
      } else if (mode === "reset") {
        textNotice = `Baki Stok Berjaya Di-Reset mengikut Katalog Master Kilang asal!`;
      } else if (mode === "custom") {
        textNotice = `Master Data Berjaya Diselaraskan! Kesemua SKU kini mempunyai ${customQtyInput} unit stok sekata.`;
      }
      setSyncNotice(textNotice);
    }
    setShowSyncModal(false);
  };

  const handleSubmitNewTire = (e: React.FormEvent) => {
    e.preventDefault();
    const parts = size.split("/");
    const width = parseInt(parts[0]) || 205;
    const rim = parseInt(size.split("R")[1]) || 16;
    const aspect = parseInt(parts[1]?.split("R")[0]) || 55;

    const newTire: Tire = {
      id: "NEW-" + Date.now(),
      brandId: brand.toLowerCase(),
      brand: brand.toUpperCase(),
      size: size,
      width,
      aspectRatio: aspect,
      rimSize: rim,
      model,
      pattern,
      category,
      treadDepthMm: 8.0,
      speedRating: "V",
      loadIndex: 91,
      marketPrice,
      costPrice,
      profit: marketPrice - costPrice,
      storeStock,
      totalStock: storeStock,
      status: storeStock > 2 ? "In Stock" : "Low Stock",
      year: 2026,
      wetGripRating: "A",
      noiseLevelDb: 68,
      fuelSavingRating: "B",
      treadLifeKm: 55000,
      description: `Tayar ${brand} ${model} saiz ${size} untuk kegunaan ${category}.`,
      keyTechnologies: ["Enhanced Compound", "Safety Grooves"],
      imageUrl: imageId.startsWith("http") ? imageId.trim() : undefined,
      imageId: imageId.startsWith("http") ? undefined : (imageId.trim() || undefined)
    };

    onAddTyre(newTire);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-red-600" /> Dashboard & Analitik Inventori
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Pusat Kawalan Stok & Prestasi Kedai Tayar
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Statistik inventori, penilaian nilai stok kewangan, amaran stok rendah, dan kemaskini stok secara realtime.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCsvModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" /> Import Fail CSV / Sync Bulk
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Tambah Rekod Tayar Baru
          </button>
        </div>
      </div>

      {/* Sync Success Feedback Toast */}
      {syncNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{syncNotice}</span>
          </div>
          <button
            onClick={() => setSyncNotice("")}
            className="text-emerald-700 hover:text-emerald-900 font-bold underline text-[11px]"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Admin Quick Sync Onboarding Banner */}
      {onSyncMasterStock && (
        <div className="bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 text-white rounded-xl p-5 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                Ganjaran Admin
              </span>
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" /> Penyelarasan Master Data Stok Permulaan (1-Klik Auto-Sync)
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pengguna Admin Baru tidak perlu mengemaskini baki stok satu per satu secara manual. Gunakan fungsi <strong>Auto-Sync Master Data</strong> untuk terus memasukkan kuantiti stok standard kedai bagi kesemua SKU serta-merta.
            </p>
          </div>

          <button
            onClick={() => setShowSyncModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs rounded-lg shadow transition-all shrink-0 flex items-center gap-2"
          >
            <FolderSync className="w-4 h-4 text-slate-950" /> Buka Menu Sync Master Data
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block flex items-center gap-1">
            <Warehouse className="w-4 h-4 text-red-600" /> Jumlah Stok Kedai
          </span>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">{totalStockUnits} Unit</div>
          <p className="text-[11px] text-slate-400">{tyres.length} SKU Tayar Berbeza</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-red-600" /> Nilai Kos Inventori
          </span>
          <div className="text-3xl font-extrabold text-red-600 font-mono">RM{totalStockValue.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400">Modal Terikat Dalam Stok</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Potensi Untung Kasar
          </span>
          <div className="text-3xl font-extrabold text-emerald-600 font-mono">+RM{totalPotentialProfit.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400">Hasil Apabila Semua Terjual</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-rose-600" /> Amaran Stok Rendah
          </span>
          <div className="text-3xl font-extrabold text-rose-600 font-mono">{lowStockItems.length} SKU</div>
          <p className="text-[11px] text-slate-400">Stok ≤ 2 Biji Dalam Kedai</p>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Senarai Inventori & Kemaskini Baki Stok</h3>
          <span className="text-xs text-slate-500 font-mono">Jumlah Jenama: {brandsCount} | Model: {modelsCount}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase bg-slate-50">
                <th className="p-3">Jenama & Model</th>
                <th className="p-3 font-mono">Kod Saiz</th>
                <th className="p-3">Kategori</th>
                <th className="p-3 text-right">Harga Kos</th>
                <th className="p-3 text-right">Harga Jual</th>
                <th className="p-3 text-right">Untung / Biji</th>
                <th className="p-3 text-center">Baki Stok Kedai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tyres.map((tire) => (
                <tr key={tire.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <strong className="text-red-600 uppercase block">{tire.brand}</strong>
                    <span className="text-slate-800 font-bold">{tire.model}</span>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-900 text-sm">{tire.size}</td>
                  <td className="p-3 text-slate-500">{tire.category}</td>
                  <td className="p-3 text-right font-mono text-slate-500">RM{tire.costPrice}</td>
                  <td className="p-3 text-right font-mono font-bold text-red-600">RM{tire.marketPrice}</td>
                  <td className="p-3 text-right font-mono text-emerald-600 font-bold">+RM{tire.profit}</td>
                  <td className="p-3 text-center">
                    <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-lg">
                      <button
                        onClick={() => onUpdateStock(tire.id, Math.max(0, tire.storeStock - 1))}
                        className="w-6 h-6 bg-white border border-slate-300 hover:bg-slate-100 rounded text-slate-800 font-extrabold text-xs flex items-center justify-center transition-colors"
                        title="Kurangkan Stok (-1)"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={tire.storeStock}
                        onChange={(e) => onUpdateStock(tire.id, Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-12 text-center font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded py-0.5 text-xs outline-none focus:border-red-500"
                        title="Taip jumlah stok langsung"
                      />
                      <button
                        onClick={() => onUpdateStock(tire.id, tire.storeStock + 1)}
                        className="w-6 h-6 bg-white border border-slate-300 hover:bg-slate-100 rounded text-slate-800 font-extrabold text-xs flex items-center justify-center transition-colors"
                        title="Tambah Stok (+1)"
                      >
                        +
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Tire Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Tambah Rekod Tayar Baru</h3>

            <form onSubmit={handleSubmitNewTire} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Jenama</label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Saiz (cth: 205/55R16)</label>
                <input
                  type="text"
                  required
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono font-bold focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Model & Corak Bunga</label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  Pautan Gambar (URL / Link GitHub / ID Aset)
                </label>
                <input
                  type="text"
                  placeholder="cth: https://github.com/.../TY004.webp ATAU TY004"
                  value={imageId}
                  onChange={(e) => setImageId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono text-xs focus:bg-white focus:border-red-500 outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Boleh masukkan link penuh GitHub (cth: https://github.com/syncrozz/syncrozz-assets/blob/main/Gambar%20Tayar/TY004.webp) atau ID aset sahaja. Biarkan kosong jika tiada gambar.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Harga Kos (RM)</label>
                  <input
                    type="number"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Harga Jual (RM)</label>
                  <input
                    type="number"
                    required
                    value={marketPrice}
                    onChange={(e) => setMarketPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono font-bold text-red-600 focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Kuantiti Stok Kedai</label>
                <input
                  type="number"
                  required
                  value={storeStock}
                  onChange={(e) => setStoreStock(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-sm"
                >
                  Simpan Tayar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sync Master Data Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold">
                  <RefreshCw className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Penyelarasan Master Data Stok</h3>
                  <p className="text-[11px] text-slate-500">Pilih kaedah auto-sync stok permulaan untuk Admin Baru</p>
                </div>
              </div>
              <button
                onClick={() => setShowSyncModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {/* Option 1: Standard Baseline */}
              <label
                onClick={() => setSelectedSyncMode("standard")}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 block ${
                  selectedSyncMode === "standard"
                    ? "border-red-600 bg-red-50/60 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="syncMode"
                  checked={selectedSyncMode === "standard"}
                  onChange={() => setSelectedSyncMode("standard")}
                  className="mt-1 accent-red-600"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-extrabold text-slate-900">🎯 Stok Baseline Standard (12 Unit / SKU)</strong>
                    <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded">Disyorkan</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Mengisi baki stok 12 unit bagi kesemua SKU tayar. Ideal untuk stok permulaan yang seimbang di kedai.
                  </p>
                </div>
              </label>

              {/* Option 2: High Demand Popular Sizes */}
              <label
                onClick={() => setSelectedSyncMode("popular")}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 block ${
                  selectedSyncMode === "popular"
                    ? "border-red-600 bg-red-50/60 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="syncMode"
                  checked={selectedSyncMode === "popular"}
                  onChange={() => setSelectedSyncMode("popular")}
                  className="mt-1 accent-red-600"
                />
                <div className="space-y-0.5">
                  <strong className="text-xs font-extrabold text-slate-900">🔥 Utamakan Saiz Popular & Laris (24 vs 8 Unit)</strong>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Memberikan stok tinggi (24 unit) untuk saiz carian tertinggi (205/55R16, 185/65R15, 215/55R17) dan 8 unit untuk saiz lain.
                  </p>
                </div>
              </label>

              {/* Option 3: Reset Factory Master Catalog */}
              <label
                onClick={() => setSelectedSyncMode("reset")}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 block ${
                  selectedSyncMode === "reset"
                    ? "border-red-600 bg-red-50/60 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="syncMode"
                  checked={selectedSyncMode === "reset"}
                  onChange={() => setSelectedSyncMode("reset")}
                  className="mt-1 accent-red-600"
                />
                <div className="space-y-0.5">
                  <strong className="text-xs font-extrabold text-slate-900">🏭 Reset ke Katalog Asal Master Pembekal</strong>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Mengembalikan baki stok mengikut rekod katalog kilang/pembekal asal platform.
                  </p>
                </div>
              </label>

              {/* Option 4: Custom Uniform Stock */}
              <label
                onClick={() => setSelectedSyncMode("custom")}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 block ${
                  selectedSyncMode === "custom"
                    ? "border-red-600 bg-red-50/60 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="syncMode"
                  checked={selectedSyncMode === "custom"}
                  onChange={() => setSelectedSyncMode("custom")}
                  className="mt-1 accent-red-600"
                />
                <div className="space-y-1.5 w-full">
                  <strong className="text-xs font-extrabold text-slate-900">🔢 Set Kuantiti Custom Sekata</strong>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Tetapkan jumlah unit stok yang sama untuk dikemaskini ke semua SKU sekali gus.
                  </p>
                  {selectedSyncMode === "custom" && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs font-bold text-slate-700">Jumlah Stok / SKU:</span>
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        value={customQtyInput}
                        onChange={(e) => setCustomQtyInput(parseInt(e.target.value) || 0)}
                        className="w-20 bg-white border border-red-300 rounded px-2.5 py-1 text-slate-900 font-mono font-bold text-xs outline-none focus:border-red-600"
                      />
                      <span className="text-xs text-slate-500 font-bold">unit</span>
                    </div>
                  )}
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSyncModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleExecuteSync(selectedSyncMode)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-950" /> Sahkan & Sync Stok
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV / Excel Bulk Sync Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1.5 mb-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Auto-Sync Bulk CSV / Excel (300+ SKU)
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Modul Import & Penyelarasan Data Inventori Tayar
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Muat naik fail CSV dari sistem POS / ERP (seperti AutoCount / SQL Accounting) atau tampal (paste) data terus untuk diselaraskan secara automatik.
                </p>
              </div>
              <button
                onClick={() => setShowCsvModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Template Download & Export Action Banner */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900">Template CSV Rasmi Lias Tyre</h4>
                    <p className="text-[11px] text-slate-600">Gunakan template standard ini untuk elak isu format atau konflik lajur data semasa sync.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleDownloadCSVTemplate}
                    className="flex-1 sm:flex-initial px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Muat Turun Template (.csv)
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCurrentInventoryCSV}
                    className="flex-1 sm:flex-initial px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Data Semasa
                  </button>
                </div>
              </div>

              {/* File Upload & Sample Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <UploadCloud className="w-4 h-4 text-emerald-600" /> Muat Naik Fail CSV (.csv):
                  </label>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5 flex flex-col justify-end">
                  <span className="text-[11px] text-slate-500">Ingin menguji format CSV yang anda kongsikan?</span>
                  <button
                    type="button"
                    onClick={handleLoadSampleCSV}
                    className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-700" /> Isi Contoh CSV 300 SKU Sekarang
                  </button>
                </div>
              </div>

              {/* CSV Text Input Area */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Atau Tampal (Paste) Kandungan Data CSV Di Sini:
                  </label>
                  {parsedPreview.length > 0 && (
                    <span className="text-xs font-bold text-emerald-700 font-mono">
                      ✓ {parsedPreview.length} SKU Tayar Dikesan
                    </span>
                  )}
                </div>
                <textarea
                  rows={5}
                  value={csvText}
                  onChange={(e) => handleCsvInputChange(e.target.value)}
                  placeholder="BRAND ID,NO,SIZE TAYAR,BRAND,TEBAL - MM,NEXEN TDU,GOODYEAR,STORE TMD,TOTAL STOK,HARGA MARKET - REGULAR 1,HARGA MARKET - NEW 2,HARGA STOK,NEW PROFIT nov 25,TOTAL STOK VALUE,SOLD VALUE..."
                  className="w-full bg-slate-900 text-emerald-400 font-mono text-[11px] p-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Parsed Live Preview Table */}
              {parsedPreview.length > 0 && (
                <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-white">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Pratonton Data Berjaya Diproses ({parsedPreview.length} SKU)
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Penukaran Saiz Format Auto-Mapped (cth: 175.65.14 ➔ 175/65R14)
                    </span>
                  </div>

                  <div className="overflow-x-auto max-h-48 rounded-lg border border-slate-100">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                        <tr>
                          <th className="p-2">Kod Saiz</th>
                          <th className="p-2">Jenama & Model</th>
                          <th className="p-2">Bunga (mm)</th>
                          <th className="p-2 text-right">Stok Kedai</th>
                          <th className="p-2 text-right">Harga Pasaran</th>
                          <th className="p-2 text-right">Kos</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {parsedPreview.slice(0, 10).map((t, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-bold text-red-600">{t.size}</td>
                            <td className="p-2 font-sans font-semibold text-slate-800">{t.brand} {t.model}</td>
                            <td className="p-2">{t.treadDepthMm}mm</td>
                            <td className="p-2 text-right font-bold text-slate-900">{t.storeStock} Biji</td>
                            <td className="p-2 text-right text-emerald-700 font-bold">RM{t.marketPrice}</td>
                            <td className="p-2 text-right text-slate-500">RM{t.costPrice}</td>
                            <td className="p-2">
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 font-bold text-slate-700 font-sans">
                                {t.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedPreview.length > 10 && (
                    <p className="text-[10px] text-slate-400 text-center pt-1 font-medium">
                      ...dan {parsedPreview.length - 10} SKU lagi sedia untuk diimport.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                Sistem akan memadankan rekod tayar sedia ada atau menambah SKU baru secara automatik.
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCsvModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={parsedPreview.length === 0}
                  onClick={handleConfirmImportCSV}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-white" /> Sahkan & Sync {parsedPreview.length} SKU Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
