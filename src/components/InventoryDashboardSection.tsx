import React, { useState, useMemo } from "react";
import {
  BarChart3,
  Warehouse,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Plus,
  PackageCheck,
  Layers,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  FolderSync,
  ShieldCheck,
  HelpCircle,
  FileSpreadsheet,
  UploadCloud,
  FileText,
  Download,
  Search,
  Building2,
  Boxes
} from "lucide-react";
import { Tire, UserPersona, TireStatus, CategoryType } from "../types/tyre";
import { LIAS_TYRE_CSV_SAMPLE_RAW } from "../data/csvSampleData";
import { parseCSVTextToTyres, extractBrandAndModel, normalizeSize } from "../utils/csvParser";

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

  // Table Search & Filtering State
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");

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
  const [nexenStock, setNexenStock] = useState(0);
  const [goodyearStock, setGoodyearStock] = useState(0);

  // Business Analytics Calculations
  const totalAllStockUnits = useMemo(() => {
    return tyres.reduce((sum, t) => {
      const allForTire = t.totalStock !== undefined ? t.totalStock : (t.storeStock + (t.supplierStockNexen || 0) + (t.supplierStockGoodyear || 0));
      return sum + allForTire;
    }, 0);
  }, [tyres]);

  const totalStoreStockUnits = useMemo(() => {
    return tyres.reduce((sum, t) => sum + (t.storeStock || 0), 0);
  }, [tyres]);

  const totalSupplierNexen = useMemo(() => {
    return tyres.reduce((sum, t) => sum + (t.supplierStockNexen || 0), 0);
  }, [tyres]);

  const totalSupplierGoodyear = useMemo(() => {
    return tyres.reduce((sum, t) => sum + (t.supplierStockGoodyear || 0), 0);
  }, [tyres]);

  const totalSupplierStockUnits = totalSupplierNexen + totalSupplierGoodyear;

  // Financial Value calculations (TMD Store vs ALL Stock)
  const totalStoreStockValue = useMemo(() => {
    return tyres.reduce((sum, t) => sum + (t.costPrice * (t.storeStock || 0)), 0);
  }, [tyres]);

  const totalStoreMarketValue = useMemo(() => {
    return tyres.reduce((sum, t) => sum + (t.marketPrice * (t.storeStock || 0)), 0);
  }, [tyres]);

  const totalStoreProfit = totalStoreMarketValue - totalStoreStockValue;

  const totalAllStockValue = useMemo(() => {
    return tyres.reduce((sum, t) => {
      const qty = t.totalStock !== undefined ? t.totalStock : (t.storeStock + (t.supplierStockNexen || 0) + (t.supplierStockGoodyear || 0));
      return sum + (t.costPrice * qty);
    }, 0);
  }, [tyres]);

  const totalAllMarketValue = useMemo(() => {
    return tyres.reduce((sum, t) => {
      const qty = t.totalStock !== undefined ? t.totalStock : (t.storeStock + (t.supplierStockNexen || 0) + (t.supplierStockGoodyear || 0));
      return sum + (t.marketPrice * qty);
    }, 0);
  }, [tyres]);

  const totalAllPotentialProfit = totalAllMarketValue - totalAllStockValue;

  const lowStockItems = useMemo(() => {
    return tyres.filter((t) => (t.totalStock !== undefined ? t.totalStock : t.storeStock) <= 2);
  }, [tyres]);

  const brandsCount = useMemo(() => new Set(tyres.map((t) => t.brand)).size, [tyres]);
  const modelsCount = useMemo(() => new Set(tyres.map((t) => t.model)).size, [tyres]);

  // Filtered Table Tyres
  const filteredTyres = useMemo(() => {
    return tyres.filter((t) => {
      const matchesSearch =
        searchFilter === "" ||
        t.size.toLowerCase().includes(searchFilter.toLowerCase()) ||
        t.brand.toLowerCase().includes(searchFilter.toLowerCase()) ||
        t.model.toLowerCase().includes(searchFilter.toLowerCase());
      
      const matchesCat =
        selectedCategoryFilter === "ALL" ||
        t.category === selectedCategoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [tyres, searchFilter, selectedCategoryFilter]);

  const handleExecuteSync = (mode: "standard" | "popular" | "reset" | "custom") => {
    if (onSyncMasterStock) {
      onSyncMasterStock(mode, customQtyInput);
      let textNotice = "";
      if (mode === "standard") {
        textNotice = `Master Data Berjaya Diselaraskan! Semua ${tyres.length} SKU tayar kini disetkan kepada stok standard (12 unit).`;
      } else if (mode === "popular") {
        textNotice = `Penyelarasan Saiz Laris Berjaya! Saiz popular disetkan ke 24 unit dan saiz biasa ke 8 unit.`;
      } else if (mode === "reset") {
        textNotice = `Baki Stok Berjaya Di-Reset mengikut Katalog Master Kilang asal (Total Stok: 1,052 Unit)!`;
      } else if (mode === "custom") {
        textNotice = `Master Data Berjaya Diselaraskan! Kesemua SKU kini mempunyai ${customQtyInput} unit stok sekata.`;
      }
      setSyncNotice(textNotice);
    }
    setShowSyncModal(false);
  };

  const handleSubmitNewTire = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedSize = normalizeSize(size);
    const parts = formattedSize.split("/");
    const width = parseInt(parts[0]) || 205;
    const rim = parseInt(formattedSize.split("R")[1]) || 16;
    const aspect = parseInt(parts[1]?.split("R")[0]) || 55;

    const totalQty = storeStock + nexenStock + goodyearStock;

    const newTire: Tire = {
      id: "NEW-" + Date.now(),
      brandId: brand.toLowerCase().replace(/[^a-z0-9]/g, ""),
      brand: brand.toUpperCase(),
      size: formattedSize,
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
      supplierStockNexen: nexenStock,
      supplierStockGoodyear: goodyearStock,
      totalStock: totalQty,
      status: totalQty <= 0 ? "Out of Stock" : storeStock <= 2 ? "Low Stock" : "In Stock",
      year: 2026,
      wetGripRating: "A",
      noiseLevelDb: 68,
      fuelSavingRating: "B",
      treadLifeKm: 55000,
      description: `Tayar ${brand} ${model} saiz ${formattedSize} rasmi TMD.`,
      keyTechnologies: ["Manual Entry"],
      imageId: imageId || undefined,
    };

    onAddTyre(newTire);
    setShowAddModal(false);
  };

  // Preview CSV Text
  const handlePreviewCsv = (text: string) => {
    setCsvText(text);
    const parsed = parseCSVTextToTyres(text);
    setParsedPreview(parsed);
  };

  // Load Built-in Master Sample CSV Data
  const handleLoadSampleCsv = () => {
    handlePreviewCsv(LIAS_TYRE_CSV_SAMPLE_RAW);
  };

  // Commit Import
  const handleExecuteImport = () => {
    if (parsedPreview.length === 0) return;
    if (onImportBulkTyres) {
      onImportBulkTyres(parsedPreview);
    }
    setShowCsvModal(false);
    setCsvText("");
    setParsedPreview([]);
    setSyncNotice(`Berjaya import ${parsedPreview.length} SKU tayar ke pangkalan data TMD!`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-red-600" />
              Papan Kawalan Inventori & Baki Stok
            </h2>
            <span className="bg-red-50 text-red-600 text-xs font-black uppercase px-2.5 py-0.5 rounded-full border border-red-200">
              Admin TMD
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pantau baki fizikal stor TMD, pembekal Nexen & Goodyear, nilai kos stok, dan potensi untung.
          </p>
        </div>

        {persona === "Kedai Tayar" && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setShowCsvModal(true);
                if (!csvText) handleLoadSampleCsv();
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" /> Import Master CSV ({tyres.length} SKU)
            </button>

            <button
              onClick={() => setShowSyncModal(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FolderSync className="w-4 h-4 text-yellow-400" /> Selaras Master Data
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" /> Tambah Tayar Baru
            </button>
          </div>
        )}
      </div>

      {/* Sync Success Feedback Notice Banner */}
      {syncNotice && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-center justify-between gap-3 text-emerald-900 text-xs animate-fadeIn shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold">{syncNotice}</span>
          </div>
          <button
            onClick={() => setSyncNotice("")}
            className="text-emerald-700 hover:text-emerald-900 font-extrabold text-xs underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Quick Sync Onboarding Banner if stock is empty or user wants one-click master sync */}
      {persona === "Kedai Tayar" && totalAllStockUnits === 0 && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 border border-slate-700 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                Stok Kosong Dikesan — Muat Turun Master Data Kilang
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Klik butang di sebelah untuk memuatkan kesemua {tyres.length} SKU katalog tayar dengan baki stok rasmi (1,052 Unit).
              </p>
            </div>
          </div>
          <button
            onClick={() => handleExecuteSync("reset")}
            className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs rounded-lg shadow transition-all shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <FolderSync className="w-4 h-4 text-slate-950" /> Muatkan Master Stok Asal (1,052 Unit)
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Total Stock ALL (Matched to CSS Selector) */}
        <div
          id="kpi-total-stock-all"
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2 hover:border-red-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <Warehouse className="w-4 h-4 text-red-600" /> Jumlah Stok ALL
            </span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
              Total Stock
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {totalAllStockUnits.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-slate-500 font-mono">Unit</span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200" title="Stok fizikal dalam stor TMD">
              🏢 TMD: <strong className="text-slate-900 font-mono">{totalStoreStockUnits.toLocaleString()}</strong>
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200" title="Stok pembekal Nexen & Goodyear">
              📦 Nexen/GY: <strong className="text-indigo-950 font-mono">{totalSupplierStockUnits.toLocaleString()}</strong>
            </span>
          </div>

          <p className="text-[10px] text-slate-400 font-medium pt-0.5">
            {tyres.length} SKU Berdaftar (NEXEN: {totalSupplierNexen} | GOODYEAR: {totalSupplierGoodyear})
          </p>
        </div>

        {/* KPI 2: Inventory Cost Value */}
        <div
          id="kpi-inventory-value"
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2 hover:border-red-300 transition-all"
        >
          <span className="text-xs text-slate-600 font-extrabold uppercase tracking-wider block flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-red-600" /> Nilai Kos Inventori (ALL)
          </span>
          <div className="text-3xl font-extrabold text-red-600 font-mono tracking-tight">
            RM{totalAllStockValue.toLocaleString()}
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Kos TMD Sahaja:</span>
            <strong className="font-mono text-slate-800">RM{totalStoreStockValue.toLocaleString()}</strong>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Modal Terikat Termasuk Tempahan</p>
        </div>

        {/* KPI 3: Potential Profit */}
        <div
          id="kpi-potential-profit"
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2 hover:border-emerald-300 transition-all"
        >
          <span className="text-xs text-slate-600 font-extrabold uppercase tracking-wider block flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Potensi Untung Kasar
          </span>
          <div className="text-3xl font-extrabold text-emerald-600 font-mono tracking-tight">
            +RM{totalAllPotentialProfit.toLocaleString()}
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Untung TMD:</span>
            <strong className="font-mono text-emerald-700">+RM{totalStoreProfit.toLocaleString()}</strong>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Hasil Apabila Keseluruhan Dijual</p>
        </div>

        {/* KPI 4: Low Stock Alert */}
        <div
          id="kpi-low-stock"
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2 hover:border-rose-300 transition-all"
        >
          <span className="text-xs text-slate-600 font-extrabold uppercase tracking-wider block flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" /> Amaran Stok Rendah
          </span>
          <div className="text-3xl font-extrabold text-rose-600 font-mono tracking-tight">
            {lowStockItems.length} <span className="text-sm font-semibold text-slate-500">SKU</span>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-rose-700 font-semibold flex items-center gap-1">
            <span>Baki Total Stok ≤ 2 Unit</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Perlu Buat Pesanan Pembekal</p>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Senarai Inventori & Kemaskini Baki Stok</h3>
            <span className="text-xs text-slate-500 font-mono">
              Memaparkan {filteredTyres.length} daripada {tyres.length} SKU | Jumlah Jenama: {brandsCount} | Model: {modelsCount}
            </span>
          </div>

          {/* Quick Search & Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari saiz / jenama / model..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-56 text-slate-800 outline-none focus:bg-white focus:border-red-500"
              />
            </div>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:bg-white focus:border-red-500"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="Passenger">Passenger</option>
              <option value="SUV / Crossover">SUV / Crossover</option>
              <option value="4x4 / Offroad">4x4 / Offroad</option>
              <option value="Commercial / Van">Commercial / Van</option>
              <option value="Performance / UHP">Performance / UHP</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[600px] border border-slate-100 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-100 shadow-xs">
              <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase">
                <th className="p-3">Jenama & Model</th>
                <th className="p-3 font-mono">Kod Saiz</th>
                <th className="p-3">Kategori</th>
                <th className="p-3 text-right">Harga Kos</th>
                <th className="p-3 text-right">Harga Jual</th>
                <th className="p-3 text-right">Untung</th>
                <th className="p-3 text-center">Stok TMD (Kedai)</th>
                <th className="p-3 text-center font-mono">NEXEN</th>
                <th className="p-3 text-center font-mono">GOODYEAR</th>
                <th className="p-3 text-center font-mono bg-red-50/80 text-red-700">TOTAL STOK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTyres.map((tire) => {
                const totalForThisTire = tire.totalStock !== undefined
                  ? tire.totalStock
                  : (tire.storeStock + (tire.supplierStockNexen || 0) + (tire.supplierStockGoodyear || 0));

                return (
                  <tr key={tire.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <strong className="text-red-600 uppercase block">{tire.brand}</strong>
                      <span className="text-slate-800 font-bold">{tire.model}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-900 text-sm">{tire.size}</td>
                    <td className="p-3 text-slate-500">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-medium text-slate-600">
                        {tire.category}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-500">RM{tire.costPrice}</td>
                    <td className="p-3 text-right font-mono font-bold text-red-600">RM{tire.marketPrice}</td>
                    <td className="p-3 text-right font-mono text-emerald-600 font-bold">+RM{tire.profit}</td>
                    
                    {/* Store TMD Quick Increment / Decrement */}
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 p-0.5 rounded-lg">
                        <button
                          type="button"
                          onClick={() => onUpdateStock(tire.id, Math.max(0, tire.storeStock - 1))}
                          className="w-5 h-5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-slate-800 font-extrabold text-xs flex items-center justify-center transition-colors cursor-pointer"
                          title="Kurangkan Stok (-1)"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={tire.storeStock}
                          onChange={(e) => onUpdateStock(tire.id, Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-10 text-center font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded py-0.5 text-xs outline-none focus:border-red-500"
                          title="Taip jumlah stok langsung"
                        />
                        <button
                          type="button"
                          onClick={() => onUpdateStock(tire.id, tire.storeStock + 1)}
                          className="w-5 h-5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-slate-800 font-extrabold text-xs flex items-center justify-center transition-colors cursor-pointer"
                          title="Tambah Stok (+1)"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Nexen Stock */}
                    <td className="p-3 text-center font-mono text-slate-700">
                      {tire.supplierStockNexen || 0}
                    </td>

                    {/* Goodyear Stock */}
                    <td className="p-3 text-center font-mono text-slate-700">
                      {tire.supplierStockGoodyear || 0}
                    </td>

                    {/* Total Stock */}
                    <td className="p-3 text-center font-mono font-black bg-red-50/50">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-xs ${
                          totalForThisTire === 0
                            ? "bg-slate-200 text-slate-500"
                            : totalForThisTire <= 2
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                      >
                        {totalForThisTire} Unit
                      </span>
                    </td>
                  </tr>
                );
              })}
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
                <label className="block text-slate-600 font-bold mb-1">Saiz (cth: 205/55R16 atau 175.65.14)</label>
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
                  Boleh masukkan link penuh GitHub atau ID aset (cth: TY001). Biarkan kosong jika tiada.
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono font-bold focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Harga Jual (RM)</label>
                  <input
                    type="number"
                    required
                    value={marketPrice}
                    onChange={(e) => setMarketPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono font-bold focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Stok TMD (Kedai)</label>
                  <input
                    type="number"
                    required
                    value={storeStock}
                    onChange={(e) => setStoreStock(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono font-bold focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Stok Nexen</label>
                  <input
                    type="number"
                    value={nexenStock}
                    onChange={(e) => setNexenStock(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono font-bold focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Stok Goodyear</label>
                  <input
                    type="number"
                    value={goodyearStock}
                    onChange={(e) => setGoodyearStock(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono font-bold focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow cursor-pointer"
                >
                  Simpan Tayar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Bulk Import Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                Import Master Data CSV / Excel (15-Kolum TMD)
              </h3>
              <button
                onClick={() => setShowCsvModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Tampal (paste) teks CSV atau gunakan data master rasmi yang telah dipetakan mengikut struktur fail inventory Lias Tyre.
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSampleCsv}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4" /> Muat Master Data TMD Rasmi (317 SKU / 1,052 Stok)
                </button>
              </div>

              <textarea
                rows={8}
                value={csvText}
                onChange={(e) => handlePreviewCsv(e.target.value)}
                placeholder="Tampal data CSV anda di sini..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[11px] text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
              />

              {parsedPreview.length > 0 && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between text-emerald-900 font-bold">
                    <span>Hasil Pengecaman: {parsedPreview.length} SKU Berjaya Diproses</span>
                    <span className="font-mono text-xs">
                      Total Stok: {parsedPreview.reduce((sum, t) => sum + (t.totalStock || 0), 0)} Unit (Kedai: {parsedPreview.reduce((sum, t) => sum + t.storeStock, 0)} Unit)
                    </span>
                  </div>
                  <div className="max-h-32 overflow-y-auto bg-white rounded border border-emerald-100 p-2 text-[10px] font-mono divide-y divide-slate-100">
                    {parsedPreview.slice(0, 10).map((t, idx) => (
                      <div key={idx} className="py-1 flex justify-between">
                        <span>{t.size} {t.brand} {t.model}</span>
                        <span className="text-slate-500">Kedai: {t.storeStock} | Total: {t.totalStock} | RM{t.marketPrice}</span>
                      </div>
                    ))}
                    {parsedPreview.length > 10 && (
                      <div className="text-center text-slate-400 pt-1 italic">
                        ... dan {parsedPreview.length - 10} SKU lagi
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCsvModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={parsedPreview.length === 0}
                  onClick={handleExecuteImport}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" /> Sahkan & Import {parsedPreview.length} SKU
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync Master Data Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FolderSync className="w-5 h-5 text-yellow-500" />
                Penyelarasan Master Data Stok
              </h3>
              <button
                onClick={() => setShowSyncModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Pilih kaedah penyelarasan stok pukal untuk mengemaskini kesemua {tyres.length} SKU dalam pangkalan data TMD secara serentak:
              </p>

              <div className="space-y-2">
                <label
                  className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    selectedSyncMode === "reset" ? "bg-red-50 border-red-400 ring-1 ring-red-400" : "border-slate-200 hover:bg-slate-50"
                  }`}
                  onClick={() => setSelectedSyncMode("reset")}
                >
                  <input
                    type="radio"
                    name="syncMode"
                    checked={selectedSyncMode === "reset"}
                    onChange={() => setSelectedSyncMode("reset")}
                    className="mt-0.5 text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <strong className="text-slate-900 block font-bold">1. Muatkan Stok Asal Master CSV (1,052 Unit)</strong>
                    <span className="text-slate-500 text-[11px]">
                      Mengembalikan baki stok mengikut rekod rasmi: Kedai TMD (733 unit), Nexen TDU (163 unit), Goodyear (156 unit).
                    </span>
                  </div>
                </label>

                <label
                  className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    selectedSyncMode === "popular" ? "bg-red-50 border-red-400 ring-1 ring-red-400" : "border-slate-200 hover:bg-slate-50"
                  }`}
                  onClick={() => setSelectedSyncMode("popular")}
                >
                  <input
                    type="radio"
                    name="syncMode"
                    checked={selectedSyncMode === "popular"}
                    onChange={() => setSelectedSyncMode("popular")}
                    className="mt-0.5 text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <strong className="text-slate-900 block font-bold">2. Penyelarasan Pintar (Saiz Laris Tinggi)</strong>
                    <span className="text-slate-500 text-[11px]">
                      Setkan 24 unit bagi saiz popular (175/65R14, 185/55R15, 205/55R16, 215/60R17) dan 8 unit bagi saiz lain.
                    </span>
                  </div>
                </label>

                <label
                  className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    selectedSyncMode === "standard" ? "bg-red-50 border-red-400 ring-1 ring-red-400" : "border-slate-200 hover:bg-slate-50"
                  }`}
                  onClick={() => setSelectedSyncMode("standard")}
                >
                  <input
                    type="radio"
                    name="syncMode"
                    checked={selectedSyncMode === "standard"}
                    onChange={() => setSelectedSyncMode("standard")}
                    className="mt-0.5 text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <strong className="text-slate-900 block font-bold">3. Stok Standard Sekata (12 Unit Setiap SKU)</strong>
                    <span className="text-slate-500 text-[11px]">
                      Menetapkan baki stok kepada 12 unit untuk setiap model bagi simulasi operasi penuh kedai.
                    </span>
                  </div>
                </label>

                <label
                  className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    selectedSyncMode === "custom" ? "bg-red-50 border-red-400 ring-1 ring-red-400" : "border-slate-200 hover:bg-slate-50"
                  }`}
                  onClick={() => setSelectedSyncMode("custom")}
                >
                  <input
                    type="radio"
                    name="syncMode"
                    checked={selectedSyncMode === "custom"}
                    onChange={() => setSelectedSyncMode("custom")}
                    className="mt-0.5 text-red-600 focus:ring-red-500"
                  />
                  <div className="w-full">
                    <strong className="text-slate-900 block font-bold">4. Kuantiti Tersuai (Custom Qty)</strong>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-slate-500 text-[11px]">Tetapkan baki kepada:</span>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={customQtyInput}
                        onChange={(e) => setCustomQtyInput(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-center text-xs"
                      />
                      <span className="text-slate-500 text-[11px]">unit / SKU</span>
                    </div>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSyncModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleExecuteSync(selectedSyncMode)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <FolderSync className="w-4 h-4" /> Laksanakan Penyelarasan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
