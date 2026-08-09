import React, { useState } from "react";
import { Tire, UserPersona } from "../types/tyre";
import { ShieldCheck, Award, Info, Sparkles, ZoomIn, Activity, Scale, Image as ImageIcon } from "lucide-react";
import { resolveTireImageUrl, getTireStudioMeta, CATEGORY_FALLBACK_IMAGES, DEFAULT_TIRE_PLACEHOLDER } from "../utils/tireImageResolver";

interface TireCardShowcaseProps {
  tire: Tire;
  persona?: UserPersona;
  onViewDetail: (tire: Tire) => void;
  isCompared?: boolean;
  onToggleCompare?: (tire: Tire) => void;
  onAddToQuotation?: (tire: Tire) => void;
}

// Brand theme badge styling matching user's reference image
const getBrandTheme = (brandName: string) => {
  const b = brandName.toUpperCase();
  if (b.includes("MICHELIN")) {
    return { bg: "bg-[#002D72]", text: "text-white", accent: "border-yellow-400", logoText: "MICHELIN" };
  }
  if (b.includes("NEXEN")) {
    return { bg: "bg-[#5B168C]", text: "text-white", accent: "border-purple-300", logoText: "NEXEN TIRE" };
  }
  if (b.includes("GENERAL")) {
    return { bg: "bg-[#C8102E]", text: "text-white", accent: "border-red-400", logoText: "GENERAL TIRE" };
  }
  if (b.includes("COOPER")) {
    return { bg: "bg-[#1B4332]", text: "text-white", accent: "border-emerald-400", logoText: "COOPER TIRES" };
  }
  if (b.includes("GREATWALL") || b.includes("AEROFORCE")) {
    return { bg: "bg-[#B84B12]", text: "text-white", accent: "border-amber-400", logoText: b.includes("AEROFORCE") ? "AEROFORCE" : "GREATWALL" };
  }
  if (b.includes("CONTINENTAL")) {
    return { bg: "bg-[#FF6600]", text: "text-slate-950 font-black", accent: "border-black", logoText: "CONTINENTAL" };
  }
  if (b.includes("BRIDGESTONE")) {
    return { bg: "bg-[#E60012]", text: "text-white", accent: "border-white", logoText: "BRIDGESTONE" };
  }
  if (b.includes("GOODYEAR")) {
    return { bg: "bg-[#002855]", text: "text-yellow-400", accent: "border-yellow-400", logoText: "GOODYEAR" };
  }
  if (b.includes("TOYO")) {
    return { bg: "bg-[#003399]", text: "text-white", accent: "border-blue-300", logoText: "TOYO TIRES" };
  }
  if (b.includes("HANKOOK")) {
    return { bg: "bg-[#FF5500]", text: "text-white", accent: "border-black", logoText: "HANKOOK" };
  }
  if (b.includes("AUTOGREEN") || b.includes("ATLANDER")) {
    return { bg: "bg-[#0F172A]", text: "text-emerald-400", accent: "border-emerald-500", logoText: brandName };
  }
  return { bg: "bg-[#1E293B]", text: "text-white", accent: "border-slate-400", logoText: brandName };
};

// Realistic studio tire image URLs with tread visual depth
const getTireStudioImage = (tire: Tire): { mainUrl: string; treadTypeLabel: string; treadDesc: string } => {
  const cat = tire.category;
  const pattern = (tire.pattern || "").toLowerCase();

  if (cat === "4x4 / Offroad" || pattern.includes("at") || pattern.includes("rover")) {
    return {
      mainUrl: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=600&auto=format&fit=crop&q=80",
      treadTypeLabel: "Corak All-Terrain (Block Thick)",
      treadDesc: "Alur dalam khas untuk cengkaman off-road & jalan basah"
    };
  }
  if (cat === "Commercial / Van") {
    return {
      mainUrl: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=600&auto=format&fit=crop&q=80",
      treadTypeLabel: "Corak Rib Komersial Heavy Duty",
      treadDesc: "Struktur corak diperkuat untuk muatan berat & tahan haus"
    };
  }
  if (cat === "Performance / UHP" || pattern.includes("sport") || pattern.includes("v-shape")) {
    return {
      mainUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&auto=format&fit=crop&q=80",
      treadTypeLabel: "Corak Asimetrik Sukan UHP",
      treadDesc: "Alur V-Drainage halaju tinggi & kawalan selekor tajam"
    };
  }
  // Standard / Passenger Comfort
  return {
    mainUrl: "https://images.unsplash.com/photo-1543465077-db45d34b88a5?w=600&auto=format&fit=crop&q=80",
    treadTypeLabel: "Corak Asimetrik Silent Touring",
    treadDesc: "Blok penyerap bunyi & 4 alur penyingkiran air pantas"
  };
};

export const TireCardShowcase: React.FC<TireCardShowcaseProps> = ({
  tire,
  persona,
  onViewDetail,
  isCompared,
  onToggleCompare,
  onAddToQuotation,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const brandTheme = getBrandTheme(tire.brand);
  const resolvedImgUrl = resolveTireImageUrl(tire);
  const studioMeta = getTireStudioMeta(tire);

  return (
    <div
      onClick={() => onViewDetail(tire)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-[#f2f3f5] rounded-2xl p-4 border border-slate-200/90 hover:border-slate-400 hover:border-red-500/30 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden cursor-pointer"
    >
      {/* Top Banner & Header */}
      <div className="space-y-3">
        {/* Brand Banner Badge & Stock Pill */}
        <div className="flex items-start justify-between gap-2">
          {/* Brand Logo Banner (Matching user reference image style) */}
          <div
            className={`${brandTheme.bg} ${brandTheme.text} px-3 py-1.5 rounded-md shadow-sm border-l-4 ${brandTheme.accent} inline-flex items-center gap-1.5 max-w-[70%] overflow-hidden`}
          >
            <span className="text-xs font-black tracking-wider uppercase truncate">
              {brandTheme.logoText}
            </span>
          </div>

          {/* Stock & Size Badge */}
          <div className="text-right flex flex-col items-end">
            <span className="text-sm font-black text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 font-mono shadow-xs">
              {tire.size}
            </span>
            {persona === "Kedai Tayar" && (
              <span className="text-[10px] font-bold text-slate-500 mt-0.5">
                Stok: <span className={tire.storeStock > 0 ? "text-emerald-600 font-bold" : "text-red-500 font-bold"}>{tire.storeStock} Biji</span>
              </span>
            )}
          </div>
        </div>

        {/* Model Title & Category */}
        <div>
          <h4 className="text-sm font-extrabold text-slate-900 leading-tight group-hover:text-red-600 transition-colors">
            {tire.brand} {tire.model}
          </h4>
          <p className="text-[11px] text-slate-500 font-medium">
            {tire.category} • Bunga {tire.treadDepthMm}mm ({tire.year})
          </p>
        </div>

        {/* Studio Visual Grid: Left Performance Specs + Right Tire Tread Render */}
        <div className="grid grid-cols-12 gap-2 items-center bg-white/70 p-3 rounded-xl border border-slate-200/60 backdrop-blur-xs relative">
          {/* Left Column: Key Performance Metrics */}
          <div className="col-span-5 space-y-1.5 border-r border-slate-200/80 pr-2">
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">
                Cengkaman Basah
              </div>
              <div className="text-xs font-black text-emerald-700 leading-tight">
                Gred {tire.wetGripRating || "A"}
              </div>
            </div>

            <div className="pt-1 border-t border-slate-100">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">
                Penjimatan Minyak
              </div>
              <div className="text-xs font-black text-slate-800 leading-tight">
                Gred {tire.fuelSavingRating || "B"}
              </div>
            </div>

            <div className="pt-1 border-t border-slate-100">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">
                Bunyi Kabin
              </div>
              <div className="text-xs font-black text-slate-800 leading-tight">
                {tire.noiseLevelDb} dB
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Tire Tread & Wheel Render */}
          <div
            onClick={() => onViewDetail(tire)}
            className="col-span-7 relative flex items-center justify-center p-1 cursor-pointer group/img min-h-[110px]"
          >
            {resolvedImgUrl ? (
              <>
                {/* Subtle Studio Floor Drop Shadow */}
                <div className="absolute bottom-0 w-24 h-3 bg-black/20 rounded-full blur-md transform scale-y-50 group-hover/img:scale-x-110 transition-transform"></div>

                {/* Tire Product Photo */}
                <img
                  src={resolvedImgUrl}
                  alt={`${tire.brand} ${tire.model} Tread Pattern`}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.style.display = "none";
                    const el = e.currentTarget.parentElement?.querySelector(".img-error-fallback");
                    if (el) (el as HTMLElement).style.display = "flex";
                  }}
                  className="w-28 h-28 object-contain z-10 transform group-hover/img:scale-105 group-hover/img:-rotate-2 transition-transform duration-300 drop-shadow-md"
                />

                {/* Error Fallback when image URL fails to load */}
                <div className="img-error-fallback hidden flex-col items-center justify-center text-center p-2 text-slate-400 bg-slate-100/50 rounded-xl border border-dashed border-slate-200 w-28 h-24 z-10 opacity-50">
                  <ImageIcon className="w-6 h-6 text-slate-300" />
                </div>

                {/* Hover Tread Inspection Badge */}
                <div className="absolute inset-0 bg-slate-950/40 rounded-xl z-20 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-1 text-center backdrop-blur-[1px]">
                  <ZoomIn className="w-5 h-5 text-red-400 animate-bounce mb-1" />
                  <span className="text-[10px] font-extrabold uppercase bg-red-600 px-2 py-0.5 rounded-full shadow">
                    {persona === "Kedai Tayar" && (tire.imageId || tire.imageUrl) ? `Aset: ${tire.imageId || "URL"}` : "Zoom Bunga"}
                  </span>
                </div>
              </>
            ) : (
              /* No Image Provided - Clean Minimal Box */
              <div className="flex flex-col items-center justify-center text-center p-2 text-slate-400 bg-slate-100/50 rounded-xl border border-dashed border-slate-200 w-28 h-24 opacity-50">
                <ImageIcon className="w-6 h-6 text-slate-300" />
              </div>
            )}
          </div>
        </div>

        {/* Tread Pattern Badge & Specs Bar */}
        <div className="bg-slate-200/60 p-2 rounded-xl flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="font-bold text-slate-800 truncate max-w-[170px]" title={tire.pattern || studioMeta.treadTypeLabel}>
              {tire.pattern || studioMeta.treadTypeLabel}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {persona === "Kedai Tayar" && tire.imageId && (
              <span className="text-[10px] font-mono font-bold bg-slate-900 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500/30">
                {tire.imageId}
              </span>
            )}
            <span className="text-[10px] font-semibold text-slate-500 font-mono">
              {tire.noiseLevelDb}dB
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="pt-3 mt-3 border-t border-slate-200/80">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Harga Pasaran</span>
            <div className="text-lg font-black text-red-600 font-mono leading-none">
              RM {tire.marketPrice}
            </div>
          </div>

          {persona === "Kedai Tayar" && (
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-mono">Kos Est: RM{tire.costPrice}</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                Untung: RM{tire.profit}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
