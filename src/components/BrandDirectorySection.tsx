import React, { useState } from "react";
import { ShieldCheck, ChevronRight, Sparkles, Layers, Cpu, ArrowLeft, GitCompare, PlusCircle, Info, Warehouse } from "lucide-react";
import { INITIAL_BRANDS } from "../data/tyresData";
import { Tire, UserPersona, BrandInfo } from "../types/tyre";
import { TireCardShowcase } from "./TireCardShowcase";

interface BrandDirectorySectionProps {
  tyres: Tire[];
  persona: UserPersona;
  comparisonList: Tire[];
  onToggleCompare: (tire: Tire) => void;
  onAddToQuotation: (tire: Tire) => void;
  onViewDetail: (tire: Tire) => void;
  onUpdateStock?: (tireId: string, newStock: number) => void;
}

export const BrandDirectorySection: React.FC<BrandDirectorySectionProps> = ({
  tyres,
  persona,
  comparisonList,
  onToggleCompare,
  onAddToQuotation,
  onViewDetail,
  onUpdateStock,
}) => {
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);

  const selectedBrandObj = INITIAL_BRANDS.find((b) => b.id === activeBrandId);

  const brandTyres = tyres.filter((t) => {
    if (!activeBrandId) return false;
    return t.brandId.toLowerCase() === activeBrandId.toLowerCase() || t.brand.toLowerCase() === activeBrandId.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-red-600" /> Brand Directory
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Direktori Jenama & Pengeluar Tayar Utama
            </h2>
            <p className="text-slate-500 text-sm mt-1 max-w-2xl">
              Lihat koleksi lengkap mengikut pengeluar tayar. Ketahui profil teknologi, saiz yang ditawarkan, dan katalog penuh jenama kegemaran anda.
            </p>
          </div>

          {activeBrandId && (
            <button
              onClick={() => setActiveBrandId(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-red-600" /> Lihat Semua Jenama
            </button>
          )}
        </div>
      </div>

      {/* View Mode 1: Brand Catalogue Overview */}
      {!activeBrandId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INITIAL_BRANDS.map((brand) => {
            const count = tyres.filter(
              (t) => t.brandId.toLowerCase() === brand.id.toLowerCase() || t.brand.toLowerCase() === brand.name.toLowerCase()
            ).length;

            const prices = tyres
              .filter((t) => t.brandId.toLowerCase() === brand.id.toLowerCase() || t.brand.toLowerCase() === brand.name.toLowerCase())
              .map((t) => t.marketPrice);

            const minPrice = prices.length ? Math.min(...prices) : 0;
            const maxPrice = prices.length ? Math.max(...prices) : 0;

            return (
              <div
                key={brand.id}
                onClick={() => setActiveBrandId(brand.id)}
                className="bg-white border border-slate-200 hover:border-red-400 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xl font-bold tracking-wider text-slate-900 group-hover:text-red-600 transition-colors">
                      {brand.name}
                    </span>
                    <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full text-slate-600 font-semibold border border-slate-200">
                      {brand.country}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-red-600 mb-2">{brand.tagline}</p>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">{brand.description}</p>

                  {/* Core Technologies Badges */}
                  <div className="space-y-1 mb-4">
                    <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-red-600" /> Teknologi Teras:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {brand.technologies.slice(0, 3).map((tech) => (
                        <span key={tech} className="text-[10px] bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Julat Harga</span>
                    <span className="text-xs font-extrabold text-red-600">
                      RM{minPrice} - RM{maxPrice}
                    </span>
                  </div>

                  <span className="px-3 py-1.5 bg-slate-100 group-hover:bg-red-600 text-slate-700 group-hover:text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1 shadow-sm">
                    <span>{count} Model</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* View Mode 2: Dedicated Single Brand Page */
        <div className="space-y-6">
          {/* Brand Header Banner */}
          {selectedBrandObj && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{selectedBrandObj.name}</h2>
                    <span className="text-xs font-bold px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full">
                      {selectedBrandObj.country}
                    </span>
                  </div>
                  <p className="text-red-600 text-sm font-semibold mt-1">{selectedBrandObj.tagline}</p>
                  <p className="text-slate-600 text-xs mt-2 max-w-3xl leading-relaxed">{selectedBrandObj.description}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center min-w-[160px]">
                  <span className="text-xs text-slate-500 block font-medium">Jumlah Model Dalam Stok</span>
                  <strong className="text-3xl font-extrabold text-red-600">{brandTyres.length}</strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Sedia Rujukan</span>
                </div>
              </div>

              {/* Technologies List */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                <span className="text-slate-500 font-bold flex items-center gap-1">
                  <Cpu className="w-4 h-4 text-red-600" /> Ciri Teknologi Pengeluar:
                </span>
                {selectedBrandObj.technologies.map((t) => (
                  <span key={t} className="bg-slate-50 text-red-700 font-semibold px-2.5 py-1 rounded-lg border border-slate-200">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tires List Under This Brand */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {brandTyres.map((tire) => {
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
        </div>
      )}
    </div>
  );
};
