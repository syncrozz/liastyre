import { Tire, BrandInfo } from "../types/tyre";
import { LIAS_TYRE_CSV_SAMPLE_RAW } from "./csvSampleData";
import { parseCSVTextToTyres } from "../utils/csvParser";

export const INITIAL_BRANDS: BrandInfo[] = [
  {
    id: "michelin",
    name: "MICHELIN",
    country: "Perancis 🇫🇷",
    logoBadge: "MICHELIN",
    color: "bg-blue-900 text-yellow-400 border-yellow-500",
    tagline: "Prestasi Berpanjangan & Keselesaan Premium",
    description: "Pengeluar tayar terkemuka dunia dengan teknologi MaxTouch Construction dan Silent Tune untuk keselamatan terbaik di jalan basah.",
    categories: ["Passenger", "SUV / Crossover", "Performance / UHP"],
    technologies: ["EverGrip Technology", "Acoustic Noise Reduction", "MaxTouch Construction", "Silent Rib"]
  },
  {
    id: "goodyear",
    name: "GOODYEAR",
    country: "Amerika Syarikat 🇺🇸",
    logoBadge: "GOODYEAR",
    color: "bg-amber-600 text-slate-900 border-amber-500",
    tagline: "Teknologi Cengkaman Basah HydroGrip & Assurance",
    description: "Jenama tayar terkemuka pilihan OEM dengan fokus cengkaman basah optimum dan daya tahan bunga tayar yang luar biasa.",
    categories: ["Passenger", "SUV / Crossover", "Commercial / Van", "Performance / UHP"],
    technologies: ["HydroGrip Technology", "SoundComfort", "QuietTred", "DuPont Kevlar Guard"]
  },
  {
    id: "hankook",
    name: "HANKOOK",
    country: "Korea Selatan 🇰🇷",
    logoBadge: "HANKOOK",
    color: "bg-orange-600 text-white border-orange-500",
    tagline: "Kontrol & Ketenangan Pemanduan Paling Mantap",
    description: "Pengeluar utama Korea yang terkenal dengan siri Ventus Prime, Kinergy Eco, dan K435 dengan nilai prestasi-harga cemerlang.",
    categories: ["Passenger", "SUV / Crossover", "4x4 / Offroad", "Commercial / Van"],
    technologies: ["Kontrol Technology", "Sound Absorbing Foam", "Aqua Jet Grooves", "3D Sipe System"]
  },
  {
    id: "continental",
    name: "CONTINENTAL",
    country: "Jerman 🇩🇪",
    logoBadge: "CONTINENTAL",
    color: "bg-yellow-600 text-zinc-950 border-yellow-400",
    tagline: "Kejuruteraan Precision Jerman & Keselamatan Maksimum",
    description: "Teknologi tayar Jerman teras dengan Siri CC7 (ComfortContact) dan UC6 (UltraContact) pilihan utama rakyat Malaysia.",
    categories: ["Passenger", "SUV / Crossover", "Performance / UHP"],
    technologies: ["Zero Noise Breaker", "Diamond Edge Compound", "Aqua Channeling", "ComfortFlex"]
  },
  {
    id: "nexen",
    name: "NEXEN TIRE",
    country: "Korea Selatan 🇰🇷",
    logoBadge: "NEXEN",
    color: "bg-purple-800 text-purple-100 border-purple-500",
    tagline: "Inovasi Bunga Tayar Termaju & Prestasi Paling Dipercayai",
    description: "Jenama tayar Korea berkualiti tinggi dengan siri N Fera, N Priz, dan Primus yang sangat popular di kedai tayar.",
    categories: ["Passenger", "SUV / Crossover", "Performance / UHP"],
    technologies: ["4 Wide Longitudinal Grooves", "High Dispersion Silica", "3D Block Design"]
  },
  {
    id: "toyo",
    name: "TOYO TIRES",
    country: "Jepun 🇯🇵",
    logoBadge: "TOYO",
    color: "bg-blue-600 text-white border-blue-400",
    tagline: "Mutu Pemanduan Jepun & Siri Proxes/CR1 Serba Boleh",
    description: "Tayar buatan/teknologi Jepun terkenal dengan siri NanoEnergy, Proxes CR1, dan TR1 yang senyap dan cengkam.",
    categories: ["Passenger", "SUV / Crossover", "Performance / UHP"],
    technologies: ["Nano Balance Technology", "T-Mode Simulation", "Silent Wall Grooves"]
  },
  {
    id: "autogreen",
    name: "AUTOGREEN",
    country: "China 🇨🇳",
    logoBadge: "AUTOGREEN",
    color: "bg-emerald-700 text-white border-emerald-500",
    tagline: "Jimat Bajet, Bunga Tebal & Tahan Lasak",
    description: "Pilihan tayar bajet ekonomi paling mesra pengguna dengan siri Smart Chaser SC1 dan Grandtour AT2.",
    categories: ["Passenger", "SUV / Crossover", "4x4 / Offroad"],
    technologies: ["Green Compound", "Reinforced Shoulder", "Anti-Hydroplaning Tread"]
  },
  {
    id: "duraturn",
    name: "DURATURN",
    country: "China / Global 🌐",
    logoBadge: "DURATURN",
    color: "bg-teal-700 text-white border-teal-500",
    tagline: "Tahan Jarak Jauh & Kos Pemilikan Rendah",
    description: "Tayar kos efisien siri Mozzo 4S+ dan MZ4S untuk kegunaan harian dan pemanduan bandar.",
    categories: ["Passenger", "Commercial / Van"],
    technologies: ["Spiral Jointless Cap Ply", "Heat Dissipating Tread"]
  },
  {
    id: "kingboss",
    name: "KINGBOSS",
    country: "Global 🌐",
    logoBadge: "KINGBOSS",
    color: "bg-red-700 text-white border-red-500",
    tagline: "Prestasi Tinggi Dengan Harga Borong Kedai",
    description: "Siri G521, K118, dan G866 dengan pelbagai saiz rim 14 hingga 19 inci untuk pasaran massa.",
    categories: ["Passenger", "SUV / Crossover", "Commercial / Van"],
    technologies: ["Dual Pitch Pattern", "Multi-Sipe Tread Design"]
  },
  {
    id: "durun",
    name: "DURUN",
    country: "Global 🌐",
    logoBadge: "DURUN",
    color: "bg-cyan-800 text-cyan-100 border-cyan-500",
    tagline: "Kualiti Stabil & Corak Bunga Agresif",
    description: "Siri tayar ekonomi RU06 dan HG918 sesuai untuk kenderaan harian dan komersial.",
    categories: ["Passenger", "Commercial / Van"],
    technologies: ["All-Season Silica Compound"]
  },
  {
    id: "gepormax",
    name: "GEPORMAX",
    country: "Global 🌐",
    logoBadge: "GEPORMAX",
    color: "bg-indigo-700 text-white border-indigo-500",
    tagline: "Siri Ecoplus UHP & Sport T1 Terpercaya",
    description: "Keluarga tayar Ecoplus UHP dan Sport T1 dengan profil cengkaman basah dan keselesaan harga.",
    categories: ["Passenger", "SUV / Crossover", "Performance / UHP"],
    technologies: ["Dynamic Rib Structure", "Silica Wet Grip Pro"]
  },
  {
    id: "bridgestone",
    name: "BRIDGESTONE",
    country: "Jepun 🇯🇵",
    logoBadge: "BRIDGESTONE",
    color: "bg-red-600 text-white border-red-400",
    tagline: "Keselamatan & Ketahanan Paling Dikeyani",
    description: "Gergasi tayar Jepun dengan siri Ecopia EP150, Turanza T005/6, dan Techno Sport.",
    categories: ["Passenger", "SUV / Crossover", "Performance / UHP"],
    technologies: ["NanoPro-Tech", "3D Wash-Board Siping", "Deflection Guard"]
  }
];

const RAW_PARSED_TYRES = parseCSVTextToTyres(LIAS_TYRE_CSV_SAMPLE_RAW);

// Image and badge mapping for top models
const IMAGE_MAPPINGS: Record<string, { imageId?: string; isPopular?: boolean; isDiscounted?: boolean; discountPercent?: number; discountLabel?: string }> = {
  "GOODYEAR AMG 2026": { imageId: "TY001", isPopular: true, isDiscounted: true, discountPercent: 15, discountLabel: "Promosi Jimat 15%" },
  "GOODYEAR ADP2 2026": { imageId: "TY002", isPopular: true, isDiscounted: true, discountPercent: 10, discountLabel: "Jimat Kasih 10%" },
  "GOODYEAR AMG SUV 2026": { imageId: "TY003", isPopular: true },
  "MICHELIN PRIMACY 5 2026": { imageId: "TY004", isPopular: true, isDiscounted: true, discountPercent: 12, discountLabel: "Rebate Michelin 12%" },
  "MICHELIN XM2+ 2026": { imageId: "TY005", isPopular: true },
  "CONTINENTAL CC7 2026": { imageId: "TY006", isPopular: true, isDiscounted: true, discountPercent: 10, discountLabel: "ComfortContact Deal" },
  "CONTINENTAL UC6 2026": { imageId: "TY007", isPopular: true },
  "NEXEN N FERA SU4 2026": { imageId: "TY008", isPopular: true, isDiscounted: true, discountPercent: 20, discountLabel: "Tawaran Hangat 20%" },
  "NEXEN N FERA PRIMUS V 2026": { imageId: "TY009", isPopular: true },
  "TOYO PROXES CR1 2026": { imageId: "TY010", isPopular: true, isDiscounted: true, discountPercent: 10, discountLabel: "Jepun Special 10%" },
  "TOYO CR1 2026": { imageId: "TY010", isPopular: true },
  "HANKOOK DYNAPRO AT2 2026": { imageId: "TY011", isPopular: true },
  "HANKOOK DYNAPRO AT2 XTREME 2026": { imageId: "TY011", isPopular: true },
  "HANKOOK K435 2026": { imageId: "TY012", isPopular: true },
  "AUTOGREEN SMART CHASER 2026": { isDiscounted: true, discountPercent: 15, discountLabel: "Ekonomi Jimat 15%" },
  "KINGBOSS G521 2026": { isDiscounted: true, discountPercent: 10, discountLabel: "Borong Jimat 10%" }
};

export const INITIAL_TYRES: Tire[] = RAW_PARSED_TYRES.map((t) => {
  const fullKey = `${t.brand} ${t.model}`.toUpperCase();
  for (const [key, mapping] of Object.entries(IMAGE_MAPPINGS)) {
    if (fullKey.includes(key.toUpperCase())) {
      return {
        ...t,
        imageId: mapping.imageId || t.imageId,
        isPopular: mapping.isPopular ?? t.isPopular,
        isDiscounted: mapping.isDiscounted ?? t.isDiscounted,
        discountPercent: mapping.discountPercent ?? t.discountPercent,
        discountLabel: mapping.discountLabel ?? t.discountLabel
      };
    }
  }
  return t;
});
