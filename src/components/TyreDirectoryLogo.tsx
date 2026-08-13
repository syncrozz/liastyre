import React from "react";

export const OFFICIAL_TYRE_DIRECTORY_LOGO_URL =
  "https://raw.githubusercontent.com/syncrozz/syncrozz-assets/main/logo/TYRE_DIRECTORY_PWA_IconPack_2.0/android-chrome-192x192.png";

interface TyreDirectoryLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textSize?: "sm" | "md" | "lg";
}

export const TyreDirectoryLogo: React.FC<TyreDirectoryLogoProps> = ({
  className = "",
  size = 40,
  showText = false,
  textSize = "md",
}) => {
  return (
    <div className={`flex items-center gap-3 inline-flex ${className}`}>
      {/* Official Lias Tyre Logo Badge */}
      <div
        className="relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-md shadow-red-600/30"
        style={{ width: size, height: size }}
      >
        <img
          src={OFFICIAL_TYRE_DIRECTORY_LOGO_URL}
          alt="Lias Tyre Logo"
          className="w-full h-full object-contain rounded-xl"
        />
      </div>

      {showText && (
        <div>
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black tracking-tight text-white ${
                textSize === "lg" ? "text-2xl" : textSize === "md" ? "text-xl" : "text-lg"
              }`}
            >
              LIAS
            </span>
            <span
              className={`font-black tracking-tight text-[#E10600] ${
                textSize === "lg" ? "text-2xl" : textSize === "md" ? "text-xl" : "text-lg"
              }`}
            >
              TYRE
            </span>
            <span className="text-[10px] font-extrabold bg-[#E10600]/20 text-red-300 border border-[#E10600]/40 px-1.5 py-0.5 rounded ml-0.5">
              PRO
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Sistem Pengurusan &amp; Direktori Tayar
          </p>
        </div>
      )}
    </div>
  );
};

