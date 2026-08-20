import React, { useState } from "react";
import { Tire, UserPersona } from "../types/tyre";
import { ShieldCheck, Award, Info, Sparkles, ZoomIn, Activity, Scale, Image as ImageIcon, Tag, Percent, Check, Edit3, X, Globe, Calendar } from "lucide-react";
import { resolveTireImageUrl, getTireStudioMeta, CATEGORY_FALLBACK_IMAGES, DEFAULT_TIRE_PLACEHOLDER } from "../utils/tireImageResolver";
import { getTirePriceDetails } from "../utils/tireDiscount";
import { getTireMadeIn, getTireMadeInAndYear, getTireCountryFlag } from "../utils/tireOrigin";

interface TireCardShowcaseProps {
  tire: Tire;
  persona?: UserPersona;
  onViewDetail: (tire: Tire) => void;
  isCompared?: boolean;
  onToggleCompare?: (tire: Tire) => void;
  onAddToQuotation?: (tire: Tire) => void;
  onUpdateDiscount?: (tireId: string, discountPercent: number, discountPrice?: number, discountLabel?: string) => void;
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
  onUpdateDiscount,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDiscountMenu, setShowDiscountMenu] = useState(false);
  const [customDiscountVal, setCustomDiscountVal] = useState<string>("");

  const brandTheme = getBrandTheme(tire.brand);
  const resolvedImgUrl = resolveTireImageUrl(tire);
  const studioMeta = getTireStudioMeta(tire);
  const priceDetails = getTirePriceDetails(tire);
  const madeInCountry = getTireMadeIn(tire);
  const originFlag = getTireCountryFlag(madeInCountry);
  const madeInAndYear = getTireMadeInAndYear(tire);

  const handleSetPresetDiscount = (e: React.MouseEvent, percent: number) => {
    e.stopPropagation();
    if (onUpdateDiscount) {
      onUpdateDiscount(tire.id, percent);
    }
    setShowDiscountMenu(false);
  };

  const handleApplyCustomDiscount = (e: React.MouseEvent) => {
    e.stopPropagation();
    const val = parseInt(customDiscountVal, 10);
    if (!isNaN(val) && val >= 0 && val <= 90 && onUpdateDiscount) {
      onUpdateDiscount(tire.id, val);
    }
    setShowDiscountMenu(false);
    setCustomDiscountVal("");
  };

  return (
    <div
      onClick={() => onViewDetail(tire)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group bg-[#f2f3f5] rounded-2xl p-4 border transition-all duration-300 flex flex-col justify-between relative overflow-hidden cursor-pointer ${
        priceDetails.hasDiscount
          ? "border-red-300 hover:border-red-500 shadow-sm hover:shadow-xl ring-1 ring-red-500/20"
          : "border-slate-200/90 hover:border-slate-400 hover:border-red-500/30 shadow-sm hover:shadow-xl"
      }`}
    >
      {/* Reben Merah Diskaun di Bahagian Bawah Kanan (Bottom-Right Red Ribbon) */}
      {priceDetails.hasDiscount && (
        <div
          id={`discount-ribbon-${tire.id}`}
          className="absolute -right-10 bottom-6 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-[10px] tracking-wider py-1 w-36 -rotate-45 shadow-md z-20 flex items-center justify-center gap-1 uppercase pointer-events-none select-none"
        >
          <Sparkles className="w-2.5 h-2.5 text-amber-300 shrink-0" />
          <span>{priceDetails.discountPercent}% OFF</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="space-y-3">
        {/* Brand Banner Badge, Stock Pill & Discount Promo Tag */}
        <div className="flex items-start justify-between gap-2">
          {/* Brand Logo Banner */}
          <div className="flex flex-col gap-1 max-w-[65%]">
            <div
              className={`${brandTheme.bg} ${brandTheme.text} px-3 py-1.5 rounded-md shadow-sm border-l-4 ${brandTheme.accent} inline-flex items-center gap-1.5 overflow-hidden`}
            >
              <span className="text-xs font-black tracking-wider uppercase truncate">
                {brandTheme.logoText}
              </span>
            </div>
            {priceDetails.hasDiscount && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md w-fit">
                <Tag className="w-3 h-3 text-red-600" />
                {priceDetails.discountLabel || `Diskaun ${priceDetails.discountPercent}%`}
              </span>
            )}
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
          {/* Left Column: Made In & Tahun Keluaran */}
          <div className="col-span-5 flex flex-col justify-center space-y-1.5 border-r border-slate-200/80 pr-2">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Made In
              </div>
              <div className="text-xs font-black text-slate-900 uppercase flex items-center gap-1 mt-0.5">
                <span className="text-sm leading-none">{originFlag}</span>
                <span className="truncate">{madeInCountry}</span>
              </div>
            </div>

            <div className="pt-1 border-t border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Tahun
              </div>
              <div className="text-xs font-black text-slate-900 font-mono flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-red-600 shrink-0" />
                <span>{tire.year || 2026}</span>
              </div>
            </div>

            <div className="pt-1">
              <span className="inline-flex items-center gap-1 bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-xs uppercase tracking-wider w-full justify-center text-center">
                {madeInAndYear}
              </span>
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

      {/* Pricing Section & Admin Discount Setter */}
      <div className="pt-3 mt-3 border-t border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">
              {priceDetails.hasDiscount ? "Harga Tawaran Diskaun" : "Harga Pasaran"}
            </span>
            
            {priceDetails.hasDiscount ? (
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="line-through text-slate-400 font-mono text-xs font-semibold">
                    RM{priceDetails.originalPrice}
                  </span>
                  <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded">
                    Jimat RM{priceDetails.savings}
                  </span>
                </div>
                <div className="text-xl font-black text-red-600 font-mono leading-none">
                  RM {priceDetails.finalPrice}
                </div>
              </div>
            ) : (
              <div className="text-lg font-black text-red-600 font-mono leading-none">
                RM {priceDetails.finalPrice}
              </div>
            )}
          </div>

          <div className="text-right flex flex-col items-end gap-1">
            {persona === "Kedai Tayar" && (
              <>
                <span className="text-[10px] text-slate-400 block font-mono">Kos: RM{tire.costPrice}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDiscountMenu(!showDiscountMenu);
                  }}
                  className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all flex items-center gap-1 cursor-pointer ${
                    priceDetails.hasDiscount
                      ? "bg-red-600 text-white border-red-700 shadow-xs"
                      : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs"
                  }`}
                  title="Tetapkan diskaun untuk item ini"
                >
                  <Percent className="w-3 h-3" />
                  {priceDetails.hasDiscount ? `Diskaun ${priceDetails.discountPercent}%` : "+ Set Diskaun"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Admin Quick Discount Dropdown / Popover */}
        {persona === "Kedai Tayar" && showDiscountMenu && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="p-3 bg-white rounded-xl border border-red-200 shadow-xl space-y-2 text-xs animate-fadeIn"
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <span className="font-extrabold text-slate-900 text-[11px] flex items-center gap-1">
                <Tag className="w-3 h-3 text-red-600" /> Tetapkan Diskaun Item Ini
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDiscountMenu(false);
                }}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={(e) => handleSetPresetDiscount(e, 0)}
                className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                  !priceDetails.hasDiscount
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"
                }`}
              >
                Tiada (0%)
              </button>
              {[5, 10, 15, 20, 25, 30].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={(e) => handleSetPresetDiscount(e, pct)}
                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                    priceDetails.hasDiscount && priceDetails.discountPercent === pct
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 pt-1">
              <input
                type="number"
                min="1"
                max="90"
                placeholder="Custom %"
                value={customDiscountVal}
                onChange={(e) => setCustomDiscountVal(e.target.value)}
                className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-900 font-mono text-[11px] outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={handleApplyCustomDiscount}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] rounded transition-colors"
              >
                Simpan %
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
