import React, { useState, useMemo } from "react";
import { Layers, Ruler, Sparkles, GitCompare, PlusCircle, Info, ShieldAlert, Award, Warehouse } from "lucide-react";
import { Tire, UserPersona } from "../types/tyre";
import { TireCardShowcase } from "./TireCardShowcase";

interface PatternSizeDirectorySectionProps {
  tyres: Tire[];
  persona: UserPersona;
  comparisonList: Tire[];
  onToggleCompare: (tire: Tire) => void;
  onAddToQuotation: (tire: Tire) => void;
  onViewDetail: (tire: Tire) => void;
  onUpdateStock?: (tireId: string, newStock: number) => void;
  onUpdateDiscount?: (tireId: string, discountPercent: number, discountPrice?: number, discountLabel?: string) => void;
}

export const PatternSizeDirectorySection: React.FC<PatternSizeDirectorySectionProps> = ({
  tyres,
  persona,
  comparisonList,
  onToggleCompare,
  onAddToQuotation,
  onViewDetail,
  onUpdateStock,
  onUpdateDiscount,
}) => {
  const [activeTab, setActiveTab] = useState<"pattern" | "size">("pattern");
  
  // Pattern selection
  const [selectedPattern, setSelectedPattern] = useState<string>("Comfort");

  // Size directory selection
  const [selectedRim, setSelectedRim] = useState<number>(16);
  const [selectedExactSize, setSelectedExactSize] = useState<string>("ALL");

  const PATTERN_CATEGORIES = [
    {
      id: "Comfort",
      title: "Comfort & Quiet (Selesa & Senyap)",
      badge: "Kabin Senyap",
      description: "Corak bunga khusus mengurangkan frekuensi bising jalan untuk pemanduan amat tenang.",
      icon: "🔇"
    },
    {
      id: "Wet",
      title: "Wet Safety & Grip (Cengkaman Basah)",
      badge: "Hujan Lebat",
      description: "Alur air hidro-planing tinggi dan sebatian silika untuk mengelakkan tergelincir.",
      icon: "🌧️"
    },
    {
      id: "Sport",
      title: "Performance & Sport UHP",
      badge: "Cengkaman Tajam",
      description: "Blok bahu keras dan reka bentuk asimetrik untuk responsif selekoh kelajuan tinggi.",
      icon: "🏎️"
    },
    {
      id: "Eco",
      title: "Eco & Fuel Saving (Jimat Minyak)",
      badge: "Bunga Tebal",
      description: "Rintangan golek (rolling resistance) rendah menjimatkan bahan api.",
      icon: "🌱"
    },
    {
      id: "Terrain",
      title: "All Terrain A/T & 4x4",
      badge: "Lasak Offroad",
      description: "Blok agresif tahan batu, lumpur dan pasir untuk pikap 4x4 dan SUV.",
      icon: "⛰️"
    },
    {
      id: "Commercial",
      title: "Commercial & Van (Heavy Duty)",
      badge: "Kargo & Beban",
      description: "Konstruksi ply bertulang tinggi untuk kenderaan komersial & van kargo.",
      icon: "🚐"
    }
  ];

  // Filter tires by Pattern
  const patternFilteredTyres = useMemo(() => {
    return tyres.filter((t) => {
      const p = t.pattern.toLowerCase();
      const desc = t.description.toLowerCase();
      const cat = t.category.toLowerCase();

      if (selectedPattern === "Comfort") return p.includes("comfort") || p.includes("quiet") || desc.includes("senyap");
      if (selectedPattern === "Wet") return p.includes("wet") || p.includes("safety") || t.wetGripRating === "A";
      if (selectedPattern === "Sport") return p.includes("sport") || p.includes("uhp") || cat.includes("performance");
      if (selectedPattern === "Eco") return p.includes("eco") || p.includes("fuel") || t.fuelSavingRating === "A";
      if (selectedPattern === "Terrain") return p.includes("terrain") || p.includes("a/t") || cat.includes("4x4");
      if (selectedPattern === "Commercial") return p.includes("commercial") || p.includes("heavy") || cat.includes("commercial");
      return true;
    });
  }, [tyres, selectedPattern]);

  // Unique Rim Sizes
  const availableRims = useMemo(() => {
    return Array.from(new Set(tyres.map((t) => t.rimSize))).sort((a: number, b: number) => a - b);
  }, [tyres]);

  // Unique exact sizes under selected Rim
  const sizesUnderRim = useMemo(() => {
    const subset = tyres.filter((t) => t.rimSize === selectedRim);
    return ["ALL", ...Array.from(new Set(subset.map((t) => t.size)))];
  }, [tyres, selectedRim]);

  // Filter tires by Size
  const sizeFilteredTyres = useMemo(() => {
    return tyres.filter((t) => {
      if (t.rimSize !== selectedRim) return false;
      if (selectedExactSize !== "ALL" && t.size.toLowerCase() !== selectedExactSize.toLowerCase()) return false;
      return true;
    });
  }, [tyres, selectedRim, selectedExactSize]);

  return (
    <div className="space-y-6">
      {/* Top Main Navigation Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-red-600" /> Pattern & Size Directory
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              Pilih tayar berdasarkan keperluan fungsi pemanduan (Corak Bunga) atau direktori saiz rim khas.
            </p>
          </div>

          <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setActiveTab("pattern")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${
                activeTab === "pattern"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-4 h-4" /> Pattern Directory (Corak)
            </button>
            <button
              onClick={() => setActiveTab("size")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${
                activeTab === "size"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Ruler className="w-4 h-4" /> Size Directory (Saiz Rim)
            </button>
          </div>
        </div>

        {/* TAB 1: PATTERN DIRECTORY */}
        {activeTab === "pattern" && (
          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pilih Kategori Keperluan Pemanduan / Corak Bunga:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PATTERN_CATEGORIES.map((p) => {
                const isSelected = selectedPattern === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPattern(p.id)}
                    className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-red-50/60 border-red-500 shadow-sm ring-1 ring-red-500/50"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-lg">{p.icon}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                          {p.badge}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-2">{p.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{p.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: SIZE DIRECTORY */}
        {activeTab === "size" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                1. Pilih Diameter Rim (Inci):
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {availableRims.map((rim) => (
                  <button
                    key={rim}
                    onClick={() => {
                      setSelectedRim(rim);
                      setSelectedExactSize("ALL");
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-bold font-mono transition-all border ${
                      selectedRim === rim
                        ? "bg-red-600 text-white border-red-600 shadow-sm"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    Rim {rim}"
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                2. Tapis Mengikut Kod Saiz Tepat Under Rim {selectedRim}":
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {sizesUnderRim.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedExactSize(sz)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                      selectedExactSize === sz
                        ? "bg-red-600 text-white border-red-600"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {sz === "ALL" ? `Semua Saiz Rim ${selectedRim}"` : sz}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            {activeTab === "pattern"
              ? `Hasil Tayar Mengikut Corak (${selectedPattern})`
              : `Hasil Tayar Direktori Saiz Rim ${selectedRim}" (${selectedExactSize})`}
          </h3>
          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold border border-slate-200">
            {activeTab === "pattern" ? patternFilteredTyres.length : sizeFilteredTyres.length} Pilihan
          </span>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(activeTab === "pattern" ? patternFilteredTyres : sizeFilteredTyres).map((tire) => {
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
                onUpdateDiscount={onUpdateDiscount}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
