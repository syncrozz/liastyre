import React, { useState } from "react";
import { BarChart3, Warehouse, DollarSign, TrendingUp, AlertTriangle, Plus, PackageCheck, Layers, RefreshCw, CheckCircle2, Sparkles, FolderSync, ShieldCheck, HelpCircle, FileSpreadsheet, UploadCloud, FileText } from "lucide-react";
import { Tire, UserPersona, TireStatus, CategoryType } from "../types/tyre";

interface InventoryDashboardSectionProps {
  tyres: Tire[];
  persona: UserPersona;
  onAddTyre: (newTire: Tire) => void;
  onUpdateStock: (tireId: string, newStock: number) => void;
  onSyncMasterStock?: (mode: "standard" | "popular" | "reset" | "custom", customQty?: number) => void;
  onImportBulkTyres?: (importedTyres: Tire[]) => void;
}

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

  // Normalize Size Format (e.g., "175.65.14" -> "175/65R14", "175.R.13C" -> "175/R13C")
  const normalizeSize = (rawSize: string): string => {
    if (!rawSize) return "205/55R16";
    let s = rawSize.trim();
    if (s.includes("/") && s.includes("R")) return s;

    // e.g. 175.65.14 -> 175/65R14
    if (/^\d+\.\d+\.\d+/.test(s)) {
      const parts = s.split(".");
      const width = parts[0];
      const aspect = parts[1];
      const rest = parts.slice(2).join("");
      return `${width}/${aspect}R${rest}`;
    }
    // e.g. 175.R.13C -> 175/R13C
    if (/^\d+\.R\.\d+/.test(s)) {
      const parts = s.split(".R.");
      return `${parts[0]}/R${parts[1]}`;
    }
    // e.g. 185.R.14C or 185.R14C
    s = s.replace(/^(\d+)\.(R\d+.*)$/i, "$1/$2");
    s = s.replace(/^(\d+)\.(\d+)\.(\d+)(.*)$/, "$1/$2R$3$4");
    return s;
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

  // Parse CSV text to Tire array
  const parseCSVTextToTyres = (raw: string): Tire[] => {
    const lines = raw
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length === 0) return [];

    let startIdx = 0;
    const firstLine = lines[0].toUpperCase();
    if (firstLine.includes("SIZE") || firstLine.includes("BRAND") || firstLine.includes("MARKET_PRICE")) {
      startIdx = 1; // Header row
    }

    const tyresList: Tire[] = [];

    for (let i = startIdx; i < lines.length; i++) {
      const cols = parseCsvRow(lines[i]);
      if (cols.length < 3) continue;

      // Expecting columns matching user format:
      // ID, BRAND_ID, SIZE, BRAND, TREAD_DEPTH_MM, PATTERN, CATEGORY, DISPLAY_ORDER, STOCK_NEXEN_TDU, STOCK_GOODYEAR, STOCK_STORE_TMD, TOTAL_STOCK, MARKET_PRICE, COST_PRICE, PROFIT, TOTAL_STOCK_VALUE, X_VALUE, STATUS
      const rawSize = cols[2] || cols[1] || "";
      const rawBrandFull = cols[3] || cols[2] || "BRAND";
      const treadDepth = parseFloat(cols[4]) || 7.5;
      const patternName = cols[5] || "All Season";
      const categoryRaw = cols[6] || "Passenger";

      // Stock
      const totalStockVal = parseInt(cols[11] || cols[10] || "10") || 10;
      const mktPriceVal = parseFloat((cols[12] || "0").replace(/,/g, "").replace(/"/g, "")) || 180;
      const costPriceVal = parseFloat((cols[13] || "0").replace(/,/g, "").replace(/"/g, "")) || 140;

      // Extract Brand name & Model name from full string e.g. "AEROFORCE P02 2025" or "CONTINENTAL CC7 2026"
      const brandParts = rawBrandFull.trim().split(" ");
      const brandName = brandParts[0] ? brandParts[0].toUpperCase() : "GENERIC";
      const modelName = brandParts.slice(1).join(" ") || "Standard Series";

      const formattedSize = normalizeSize(rawSize);
      const sizeParts = formattedSize.split("/");
      const width = parseInt(sizeParts[0]) || 205;
      let aspect = 55;
      let rim = 16;

      if (sizeParts[1]) {
        const sub = sizeParts[1].split("R");
        aspect = parseInt(sub[0]) || 55;
        rim = parseInt(sub[1]) || 16;
      }

      const cat: CategoryType =
        categoryRaw.toLowerCase().includes("suv") ? "SUV / Crossover" :
        categoryRaw.toLowerCase().includes("van") || categoryRaw.toLowerCase().includes("comm") ? "Commercial / Van" :
        categoryRaw.toLowerCase().includes("driver") || categoryRaw.toLowerCase().includes("passenger") ? "Passenger" : "Passenger";

      tyresList.push({
        id: `CSV-${i}-${Date.now()}`,
        brandId: cols[1]?.toLowerCase() || brandName.toLowerCase(),
        brand: brandName,
        size: formattedSize,
        width,
        aspectRatio: aspect,
        rimSize: rim,
        model: modelName,
        pattern: patternName || "High Performance",
        category: cat,
        treadDepthMm: treadDepth,
        speedRating: "V",
        loadIndex: 91,
        marketPrice: mktPriceVal,
        costPrice: costPriceVal,
        profit: mktPriceVal - costPriceVal,
        storeStock: totalStockVal,
        supplierStockNexen: parseInt(cols[8]) || 0,
        supplierStockGoodyear: parseInt(cols[9]) || 0,
        totalStock: totalStockVal,
        status: totalStockVal <= 0 ? "Out of Stock" : totalStockVal <= 2 ? "Low Stock" : "In Stock",
        year: 2026,
        wetGripRating: "A",
        noiseLevelDb: 69,
        fuelSavingRating: "B",
        treadLifeKm: 50000,
        description: `Tayar ${brandName} ${modelName} saiz ${formattedSize}.`,
        keyTechnologies: ["Sync Auto-Mapped", "High Traction Compound"]
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
    const sampleCSV = `ID,BRAND_ID,SIZE,BRAND,TREAD_DEPTH_MM,PATTERN,CATEGORY,DISPLAY_ORDER,STOCK_NEXEN_TDU,STOCK_GOODYEAR,STOCK_STORE_TMD,TOTAL_STOCK,MARKET_PRICE,COST_PRICE,PROFIT,TOTAL_STOCK_VALUE,X_VALUE,STATUS
,BR001,175.65.14,AEROFORCE P02 2025,7.4,NGreen HD,Driver,test3,,,600,600,125,96,29,96.00,125.00,On Order
,BR002,215.70.16,ATLANDER ROVERSTAR 2024,7.2,,,,,,,0,343,278,65,0.00,0.00,
,BR003,205.55.16,AUTOGREEN SMART CHASER SC1 2026,6.7,,,,1,,14,15,195,123,72,"1,845.00","2,925.00",
,BR003,195.50.15,AUTOGREEN SMART CHASER 2026,7,,,,,,11,11,140,110,30,"1,210.00","1,540.00",
,BR004,265.60.18,BRIDGESTONE AT002 2025,9.1,,,,,,5,5,630,559,71,0.00,0.00,
,BR006,195.55.15,CONTINENTAL CC7 2026,6.7,,,,,,6,6,252,215,37,"1,290.00","1,512.00",
,BR010,175.65.14,GOODYEAR ADP2 2026,7.2,,,,,4,16,20,190,156,34,"3,120.00","3,800.00",
,BR012,185.60.15,HANKOOK K435 2026,7.3,,,,,,5,5,212,165,47,825.00,"1,060.00",
,BR018,235.50.18,MICHELIN PRIMACY 5 2026,7.8,,,,,,6,6,626,566,60,"3,396.00","3,756.00",
,BR020,195.55.15,NEXEN N FERA SU4 2026,7.2,,,,2,5,25,32,190,149,41,"4,768.00","6,080.00",
,BR022,205.55.16,TOYO CR1 2026,7.2,,,,,,8,8,320,286,34,"2,288.00","2,560.00",`;
    handleCsvInputChange(sampleCSV);
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
                  placeholder="ID,BRAND_ID,SIZE,BRAND,TREAD_DEPTH_MM,PATTERN,CATEGORY,DISPLAY_ORDER,STOCK_NEXEN_TDU,STOCK_GOODYEAR,STOCK_STORE_TMD,TOTAL_STOCK,MARKET_PRICE,COST_PRICE..."
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
