import React, { useState } from "react";
import { X, ShieldCheck, Info, Layers, Ruler, PlusCircle, GitCompare, Warehouse, CheckCircle2, DollarSign, Cpu, ZoomIn, Activity, Sparkles, Droplets, Volume2, Link2, FileCode, ImageIcon, Tag, Percent, Flame } from "lucide-react";
import { Tire, UserPersona } from "../types/tyre";
import { resolveTireImageUrl, getTireStudioMeta, CATEGORY_FALLBACK_IMAGES, DEFAULT_TIRE_PLACEHOLDER } from "../utils/tireImageResolver";
import { getTirePriceDetails } from "../utils/tireDiscount";
import { getTireMadeIn, getTireMadeInAndYear, getTireCountryFlag } from "../utils/tireOrigin";

interface TireDetailModalProps {
  tire: Tire | null;
  persona: UserPersona;
  onClose: () => void;
  onAddToQuotation: (tire: Tire) => void;
  onToggleCompare: (tire: Tire) => void;
  isCompared: boolean;
  onUpdateStock?: (tireId: string, newStock: number) => void;
  onUpdateDiscount?: (tireId: string, discountPercent: number, discountPrice?: number, discountLabel?: string) => void;
}

export const TireDetailModal: React.FC<TireDetailModalProps> = ({
  tire,
  persona,
  onClose,
  onAddToQuotation,
  onToggleCompare,
  isCompared,
  onUpdateStock,
  onUpdateDiscount,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [customDiscountPct, setCustomDiscountPct] = useState<string>("");
  if (!tire) return null;

  const resolvedImgUrl = resolveTireImageUrl(tire);
  const studioMeta = getTireStudioMeta(tire);
  const priceDetails = getTirePriceDetails(tire);
  const madeInCountry = getTireMadeIn(tire);
  const originFlag = getTireCountryFlag(madeInCountry);
  const madeInAndYear = getTireMadeInAndYear(tire);

  const handleApplyDiscount = (pct: number) => {
    if (onUpdateDiscount) {
      onUpdateDiscount(tire.id, pct);
    }
  };

  const handleApplyCustom = () => {
    const val = parseInt(customDiscountPct, 10);
    if (!isNaN(val) && val >= 0 && val <= 90 && onUpdateDiscount) {
      onUpdateDiscount(tire.id, val);
      setCustomDiscountPct("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-slate-200 text-slate-900 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 relative overflow-hidden max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors z-30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 border-b border-slate-100 pb-3 pr-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-red-600 text-white shadow-xs">
              {tire.brand}
            </span>
            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-slate-900 text-white shadow-xs flex items-center gap-1">
              <span>{originFlag}</span>
              <span>{madeInCountry} {tire.year || 2026}</span>
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {tire.category}
            </span>
            {priceDetails.hasDiscount && (
              <span className="text-xs font-black px-2.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-300 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-red-600" />
                {priceDetails.discountLabel || `Diskaun ${priceDetails.discountPercent}%`}
              </span>
            )}
            <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Stok Kedai: {tire.storeStock} Biji
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900">
              {tire.size} <span className="text-red-600 font-sans font-bold text-xl">({tire.brand} {tire.model})</span>
            </h2>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto pr-1 space-y-5 flex-1">
          {/* Studio Tread Visualizer Showcase Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-5 rounded-2xl border border-slate-800 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider bg-red-600/30 text-red-300 border border-red-500/40 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-red-400" /> Paparan Studio Bunga Tayar HD
              </span>
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5 text-red-400" />
                {isZoomed ? "Nyah-Zoom Bunga" : "Zoom Terperinci"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Studio Tire Render */}
              <div className="md:col-span-6 flex flex-col items-center justify-center relative p-2 min-h-[180px]">
                {resolvedImgUrl ? (
                  <>
                    <div className="absolute bottom-1 w-32 h-4 bg-black/60 rounded-full blur-md"></div>
                    <img
                      src={resolvedImgUrl}
                      alt="Tread Pattern"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.style.display = "none";
                        const el = e.currentTarget.parentElement?.querySelector(".modal-img-error");
                        if (el) (el as HTMLElement).style.display = "flex";
                      }}
                      className={`object-contain transition-all duration-300 drop-shadow-2xl ${
                        isZoomed ? "w-64 h-64 scale-125" : "w-44 h-44 hover:scale-105"
                      }`}
                    />
                    <div className="modal-img-error hidden flex-col items-center justify-center text-center p-4 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700 text-slate-500 w-44 h-44">
                      <ImageIcon className="w-8 h-8 text-slate-600 opacity-50" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 bg-slate-800/40 rounded-2xl border border-dashed border-slate-700 text-slate-500 text-center w-full max-w-[220px]">
                    <ImageIcon className="w-8 h-8 text-slate-600 opacity-50" />
                  </div>
                )}
                {persona === "Kedai Tayar" && (tire.imageId || tire.imageUrl) && (
                  <div className="mt-2 text-[10px] font-mono bg-white/10 text-yellow-300 border border-yellow-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                    <FileCode className="w-3 h-3 text-yellow-400" /> Aset / Link: <strong>{tire.imageId || "Pautan Luar"}</strong>
                  </div>
                )}
              </div>

              {/* Tread Technical Breakdown */}
              <div className="md:col-span-6 space-y-3 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-xs">
                <div>
                  <div className="text-xs font-extrabold text-red-400 uppercase tracking-wider">
                    {studioMeta.treadTypeLabel}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {studioMeta.treadDesc}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs font-mono">
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-sans">Made In (Buatan)</span>
                    <strong className="text-emerald-400 font-bold text-sm">{originFlag} {madeInCountry}</strong>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-sans">Tahun Keluaran</span>
                    <strong className="text-amber-400 font-bold text-sm">{tire.year || 2026}</strong>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-sans">Bunga Baru</span>
                    <strong className="text-blue-400 font-bold text-sm">{tire.treadDepthMm} mm</strong> (100%)
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-sans">Jangka Hayat</span>
                    <strong className="text-purple-400 font-bold text-sm">{tire.treadLifeKm.toLocaleString()} KM</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Core Technical Specifications Grid */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2 flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-red-600" /> Spesifikasi Teknis Lengkap
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Made In (Buatan)</span>
                <strong className="text-slate-900 font-mono font-bold flex items-center gap-1">{originFlag} {madeInCountry}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Tahun Pembuatan</span>
                <strong className="text-slate-900 font-mono font-bold">{tire.year || 2026}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Lebar Tayar</span>
                <strong className="text-slate-900 font-mono">{tire.width} mm</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Nisbah Aspek</span>
                <strong className="text-slate-900 font-mono">{tire.aspectRatio}%</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Saiz Rim</span>
                <strong className="text-slate-900 font-mono">{tire.rimSize} Inci</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Kedalaman Bunga</span>
                <strong className="text-red-600 font-mono font-bold">{tire.treadDepthMm} mm</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Indeks Beban & Kelajuan</span>
                <strong className="text-slate-900 font-mono">{tire.loadIndex}{tire.speedRating}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Jangka Hayat (Km)</span>
                <strong className="text-slate-900 font-mono">{tire.treadLifeKm.toLocaleString()} KM</strong>
              </div>
            </div>
          </div>

          {/* Key Technologies List */}
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-red-600" /> Ciri Teknologi Tersemai
            </span>
            <div className="flex flex-wrap gap-2">
              {tire.keyTechnologies.map((tech) => (
                <span key={tech} className="bg-slate-50 text-slate-700 border border-slate-200 text-xs px-3 py-1 rounded-lg font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Commercial, Pricing & Discount Management Section */}
          <div className="pt-2 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block font-medium">
                  {priceDetails.hasDiscount ? "Harga Tawaran Diskaun" : "Harga Cadangan Pasaran"}
                </span>
                {priceDetails.hasDiscount ? (
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="line-through text-slate-400 font-mono text-sm font-semibold">
                        RM{priceDetails.originalPrice}
                      </span>
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                        Jimat RM{priceDetails.savings} ({priceDetails.discountPercent}%)
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-red-600 font-mono">RM{priceDetails.finalPrice}</span>
                      <span className="text-xs text-slate-500">/biji</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-red-600">RM{tire.marketPrice}</span>
                    <span className="text-xs text-slate-500">/biji</span>
                  </div>
                )}
              </div>

              {persona === "Kedai Tayar" && (
                <div className="text-right bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                  <span className="text-[10px] text-emerald-700 block font-bold">Harga Kos: RM{tire.costPrice}</span>
                  <span className="text-sm font-bold text-emerald-700">+RM{tire.profit} Margin Untung</span>
                </div>
              )}
            </div>

            {/* Admin Discount Setter inside Modal */}
            {persona === "Kedai Tayar" && onUpdateDiscount && (
              <div className="bg-red-50/70 border border-red-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-red-950 flex items-center gap-1.5 text-xs">
                    <Flame className="w-4 h-4 text-red-600" /> Tetapkan Diskaun Promosi (Admin)
                  </span>
                  {priceDetails.hasDiscount && (
                    <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                      Aktif: {priceDetails.discountPercent}% Diskaun
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyDiscount(0)}
                    className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors cursor-pointer ${
                      !priceDetails.hasDiscount
                        ? "bg-slate-800 text-white border-slate-800"
                        : "bg-white text-slate-700 hover:bg-slate-100 border-slate-300"
                    }`}
                  >
                    Tiada (0%)
                  </button>
                  {[5, 10, 15, 20, 25].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleApplyDiscount(pct)}
                      className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors cursor-pointer ${
                        priceDetails.hasDiscount && priceDetails.discountPercent === pct
                          ? "bg-red-600 text-white border-red-700 shadow-xs"
                          : "bg-white text-red-700 hover:bg-red-100 border-red-200"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}

                  <div className="flex items-center gap-1 ml-auto">
                    <input
                      type="number"
                      min="1"
                      max="90"
                      placeholder="Custom %"
                      value={customDiscountPct}
                      onChange={(e) => setCustomDiscountPct(e.target.value)}
                      className="w-20 bg-white border border-slate-200 rounded px-2 py-1 text-slate-900 font-mono text-xs outline-none focus:border-red-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustom}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded transition-colors cursor-pointer"
                    >
                      Set %
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Stock Quick Modifier inside Modal */}
            {persona === "Kedai Tayar" && onUpdateStock && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <span className="font-extrabold text-amber-950 block text-xs">Pengurusan Stok Semasa Kedai</span>
                    <span className="text-[11px] text-amber-800">
                      Baki terkini: <strong className="font-mono text-slate-900">{tire.storeStock} Biji</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onUpdateStock(tire.id, Math.max(0, tire.storeStock - 1))}
                    className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 rounded-lg text-slate-900 font-black text-sm transition-colors shadow-sm cursor-pointer"
                    title="Tolak 1 Biji (-1)"
                  >
                    -
                  </button>
                  <span className="font-mono font-black text-slate-900 px-3 py-1 text-sm bg-white border border-amber-300 rounded-lg shadow-inner min-w-[40px] text-center">
                    {tire.storeStock}
                  </span>
                  <button
                    onClick={() => onUpdateStock(tire.id, tire.storeStock + 1)}
                    className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 rounded-lg text-slate-900 font-black text-sm transition-colors shadow-sm cursor-pointer"
                    title="Tambah 1 Biji (+1)"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 shrink-0">
          <button
            onClick={() => {
              onToggleCompare(tire);
            }}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 border cursor-pointer ${
              isCompared
                ? "bg-red-600 text-white border-red-600"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
            }`}
          >
            <GitCompare className="w-4 h-4" /> {isCompared ? "Sudah Di-Bandingkan" : "Tambah Untuk Banding"}
          </button>

          <button
            onClick={() => {
              onAddToQuotation(tire);
              onClose();
            }}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Masukkan Dalam Sebut Harga
          </button>
        </div>
      </div>
    </div>
  );
};
