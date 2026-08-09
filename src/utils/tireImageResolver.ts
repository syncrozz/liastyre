import { Tire } from "../types/tyre";

export const GITHUB_ASSETS_BASE_URL = "https://raw.githubusercontent.com/syncrozz/syncrozz-assets/main/Gambar%20Tayar/";

// Default placeholder constant is empty string (no default image)
export const DEFAULT_TIRE_PLACEHOLDER = "";

// Category fallback studio images
export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  "4x4 / Offroad": "",
  "Commercial / Van": "",
  "Performance / UHP": "",
  "Passenger": "",
  "SUV / Crossover": ""
};

/**
 * Resolves the image URL for a given tire object.
 * Priority order:
 * 1. tire.imageUrl (If GitHub blob URL, converts to raw.githubusercontent.com)
 * 2. tire.imageId (e.g., "TY001" or full URL pasted into imageId field)
 * 3. Returns "" if no image URL or asset ID is set.
 */
export function resolveTireImageUrl(tire: Tire): string {
  let source = tire.imageUrl?.trim() || tire.imageId?.trim() || "";

  if (!source) {
    return "";
  }

  // Handle full HTTP / HTTPS URLs (e.g., GitHub blob URLs or direct image URLs)
  if (source.startsWith("http://") || source.startsWith("https://")) {
    let url = source;
    if (url.includes("github.com") && url.includes("/blob/")) {
      url = url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
    }
    return url;
  }

  // Handle asset ID shorthand (e.g., "TY001" -> https://raw.githubusercontent.com/.../TY001.webp)
  const cleanId = source.replace(/\.webp$/i, "").replace(/\.png$/i, "").replace(/\.jpg$/i, "");
  return `${GITHUB_ASSETS_BASE_URL}${cleanId}.webp`;
}

/**
 * Gets description and studio specs for tread pattern visualization
 */
export function getTireStudioMeta(tire: Tire) {
  const cat = tire.category;
  const pattern = (tire.pattern || "").toLowerCase();

  if (cat === "4x4 / Offroad" || pattern.includes("at") || pattern.includes("rover")) {
    return {
      treadTypeLabel: "Corak All-Terrain Rugged Off-Road",
      treadDesc: "Blok tayar agresif dengan alur pembersihan lumpur & cengkaman berbatu."
    };
  }
  if (cat === "Commercial / Van") {
    return {
      treadTypeLabel: "Corak Heavy Duty Van Commercial Rib",
      treadDesc: "Dinding tayar diperkuat untuk berat maksimum & kestabilan muatan."
    };
  }
  if (cat === "Performance / UHP" || pattern.includes("sport") || pattern.includes("v-shape")) {
    return {
      treadTypeLabel: "Corak Asimetrik UHP High-Speed Sport",
      treadDesc: "Alur V-Directional halaju tinggi dengan ketegangan bahu tayar presisi."
    };
  }
  return {
    treadTypeLabel: "Corak Asimetrik Silent Touring Comfort",
    treadDesc: "4 alur penyingkiran air utama dengan sipes penyerap bunyi kabin."
  };
}
