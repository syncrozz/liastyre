import React, { useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  X, 
  Check, 
  GitCompare, 
  PlusCircle, 
  Info, 
  Layers, 
  Ruler, 
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Tag,
  Warehouse
} from "lucide-react";
import { Tire, UserPersona } from "../types/tyre";
import { TireCardShowcase } from "./TireCardShowcase";

interface SmartSearchSectionProps {
  tyres: Tire[];
  persona: UserPersona;
  comparisonList: Tire[];
  onToggleCompare: (tire: Tire) => void;
  onAddToQuotation: (tire: Tire) => void;
  onViewDetail: (tire: Tire) => void;
  onUpdateStock?: (tireId: string, newStock: number) => void;
}

export const SmartSearchSection: React.FC<SmartSearchSectionProps> = ({
  tyres,
  persona,
  comparisonList,
  onToggleCompare,
  onAddToQuotation,
  onViewDetail,
  onUpdateStock,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedRim, setSelectedRim] = useState<string>("ALL");
  const [maxPrice, setMaxPrice] = useState<number>(700);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [selectedPatternKeyword, setSelectedPatternKeyword] = useState<string>("ALL");

  // Dynamic filter lists
  const allBrands = useMemo(() => {
    const brands = Array.from(new Set(tyres.map((t) => t.brand)));
    return ["ALL", ...brands];
  }, [tyres]);

  const allCategories = useMemo(() => {
    const cats = Array.from(new Set(tyres.map((t) => t.category)));
    return ["ALL", ...cats];
  }, [tyres]);

  const allRims = useMemo(() => {
    const rims = Array.from(new Set(tyres.map((t) => t.rimSize))).sort((a: number, b: number) => a - b);
    return ["ALL", ...rims.map((r) => `R${r}`)];
  }, [tyres]);

  // Preset search shortcuts
  const PRESET_SEARCHES = [
    { label: "205/55R16", query: "205/55R16" },
    { label: "195/55R15", query: "195/55R15" },
    { label: "175/65R14", query: "175/65R14" },
    { label: "215/60R17", query: "215/60R17" },
    { label: "265/65R17 (4x4)", query: "265/65R17" },
    { label: "Michelin", query: "Michelin" },
    { label: "Goodyear", query: "Goodyear" },
    { label: "Hankook", query: "Hankook" },
    { label: "Cengkaman Basah / Wet Grip", query: "Wet" },
    { label: "Senyap & Selesa / Comfort", query: "Comfort" },
  ];

  // Smart Search logic
  const filteredTyres = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return tyres.filter((tire) => {
      // Free form smart search across size, brand, model, pattern, category, technologies
      if (term) {
        const fullString = `${tire.size} ${tire.brand} ${tire.model} ${tire.pattern} ${tire.category} ${tire.keyTechnologies.join(" ")} ${tire.description} ${tire.year}`.toLowerCase();
        
        // Handle search without slashes like 2055516 -> match 205/55R16
        const cleanTerm = term.replace(/[\/\s-]/g, "");
        const cleanSize = tire.size.toLowerCase().replace(/[\/\s-]/g, "");

        const matchesFreeText = fullString.includes(term);
        const matchesCleanSize = cleanSize.includes(cleanTerm);

        if (!matchesFreeText && !matchesCleanSize) return false;
      }

      // Brand Filter
      if (selectedBrand !== "ALL" && tire.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
        return false;
      }

      // Category Filter
      if (selectedCategory !== "ALL" && tire.category !== selectedCategory) {
        return false;
      }

      // Rim Size Filter
      if (selectedRim !== "ALL") {
        const rimNum = parseInt(selectedRim.replace("R", ""), 10);
        if (tire.rimSize !== rimNum) return false;
      }

      // Pattern Keyword Filter
      if (selectedPatternKeyword !== "ALL") {
        if (!tire.pattern.toLowerCase().includes(selectedPatternKeyword.toLowerCase())) {
          return false;
        }
      }

      // Max Price Filter
      if (tire.marketPrice > maxPrice) {
        return false;
      }

      // In Stock Filter
      if (onlyInStock && tire.totalStock <= 0) {
        return false;
      }

      return true;
    });
  }, [tyres, searchTerm, selectedBrand, selectedCategory, selectedRim, selectedPatternKeyword, maxPrice, onlyInStock]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedBrand("ALL");
    setSelectedCategory("ALL");
    setSelectedRim("ALL");
    setSelectedPatternKeyword("ALL");
    setMaxPrice(700);
    setOnlyInStock(false);
  };

  return (
    <div className="space-y-6">
      {/* Hero Smart Search Bar Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Search className="w-6 h-6 text-red-600" /> Smart Product Directory
            </h2>
            <p className="text-slate-500 text-sm">
              Taip sebarang saiz (cth: <span className="text-red-600 font-mono font-bold">205/55R16</span>), jenama (<span className="text-slate-800 font-bold">Michelin</span>), kategori (<span className="text-slate-800 font-bold">SUV</span>), atau ciri (<span className="text-slate-800 font-bold">Wet Grip</span>)
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200 font-medium">
              {filteredTyres.length} Tayar Ditemui
            </span>
          </div>
        </div>

        {/* Main Search Input Box */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5 text-red-600" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Taip carian cth: 205/55R16, Michelin, Primacy, Wet Grip, SUV..."
            className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 focus:border-red-600 focus:bg-white rounded-lg text-slate-900 placeholder-slate-400 text-base font-medium transition-all outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Preset Shortcuts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-500 font-semibold whitespace-nowrap flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-red-600" /> Carian Popular:
          </span>
          {PRESET_SEARCHES.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setSearchTerm(preset.query)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 whitespace-nowrap transition-colors text-xs font-medium"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Filter Bar Controls */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Brand Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Jenama</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:border-red-500 focus:bg-white outline-none"
            >
              {allBrands.map((b) => (
                <option key={b} value={b}>{b === "ALL" ? "Semua Jenama" : b}</option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Kategori</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:border-red-500 focus:bg-white outline-none"
            >
              {allCategories.map((c) => (
                <option key={c} value={c}>{c === "ALL" ? "Semua Kategori" : c}</option>
              ))}
            </select>
          </div>

          {/* Rim Size Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Saiz Rim</label>
            <select
              value={selectedRim}
              onChange={(e) => setSelectedRim(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:border-red-500 focus:bg-white outline-none"
            >
              {allRims.map((r) => (
                <option key={r} value={r}>{r === "ALL" ? "Semua Rim (13-20\")" : `Rim ${r}`}</option>
              ))}
            </select>
          </div>

          {/* Max Price Range Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Had Harga</label>
              <span className="text-xs font-bold text-red-600">≤ RM{maxPrice}</span>
            </div>
            <input
              type="range"
              min={100}
              max={700}
              step={25}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-red-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
          </div>

          {/* In Stock & Clear Toggle */}
          <div className="flex items-center justify-between gap-2 pt-4 md:pt-0">
            <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="rounded border-slate-300 bg-white text-red-600 focus:ring-red-500"
              />
              <span>Stok Sedia Ada</span>
            </label>

            {(searchTerm || selectedBrand !== "ALL" || selectedCategory !== "ALL" || selectedRim !== "ALL" || maxPrice < 700 || onlyInStock) && (
              <button
                onClick={clearFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline underline-offset-2 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Display Grid */}
      {filteredTyres.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Tiada Padanan Tayar Ditemui</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
              Sila cuba taipkan kata kunci saiz yang lebih umum seperti <span className="text-red-600 font-mono font-bold">205/55</span> atau turunkan tetapan carian.
            </p>
          </div>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            Reset Semua Penapis
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTyres.map((tire) => {
            const isCompared = comparisonList.some((t) => t.id === tire.id);

            return (
              <TireCardShowcase
                key={tire.id}
                tire={tire}
                persona={persona}
                onViewDetail={onViewDetail}
                isCompared={isCompared}
                onToggleCompare={onToggleCompare}
                onAddToQuotation={onAddToQuotation}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
