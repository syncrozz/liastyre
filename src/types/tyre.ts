export type CategoryType = 
  | "Passenger"
  | "SUV / Crossover"
  | "4x4 / Offroad"
  | "Commercial / Van"
  | "Performance / UHP";

export type TireStatus = "Active" | "In Stock" | "Low Stock" | "On Order" | "Out of Stock";

export interface Tire {
  id: string;
  brandId: string;
  brand: string;
  size: string; // e.g. "205/55R16"
  width: number;
  aspectRatio: number;
  rimSize: number;
  model: string;
  pattern: string;
  category: CategoryType;
  treadDepthMm: number;
  speedRating: string;
  loadIndex: number;
  marketPrice: number;
  costPrice: number;
  profit: number;
  storeStock: number;
  supplierStockNexen?: number;
  supplierStockGoodyear?: number;
  totalStock: number;
  status: TireStatus;
  year: number;
  wetGripRating: "A" | "B" | "C" | "D";
  noiseLevelDb: number;
  fuelSavingRating: "A" | "B" | "C" | "D";
  treadLifeKm: number;
  description: string;
  keyTechnologies: string[];
  imageId?: string; // e.g. "TY001", "TY002" from github syncrozz-assets
  imageUrl?: string; // e.g. direct link or github link
  isNewProduct?: boolean;
  isPopular?: boolean;
}

export interface BrandInfo {
  id: string;
  name: string;
  country: string;
  logoBadge: string; // e.g. "🇫🇷" or "🇲🇾" or logo color
  color: string;
  tagline: string;
  description: string;
  categories: string[];
  technologies: string[];
  website?: string;
}

export interface VehicleMapping {
  id: string;
  make: string; // e.g. Toyota
  model: string; // e.g. Vios
  yearRange: string; // e.g. 2019-2023
  oeSize: string; // e.g. 185/60R15
  upgradeSizes: string[]; // e.g. ["195/50R16", "205/45R17"]
  recommendedCategory: CategoryType;
  popularModels?: string[];
}

export interface QuotationItem {
  tireId: string;
  tire: Tire;
  quantity: number;
  unitPrice: number;
  installationFeePerTire: number;
  balancingFeePerTire: number;
}

export interface Quotation {
  id: string;
  quotationNo: string;
  date: string;
  customerName: string;
  customerPhone: string;
  vehiclePlate: string;
  vehicleModel: string;
  items: QuotationItem[];
  alignmentFee: number;
  tradeInDiscount: number;
  notes: string;
  status: "Draf" | "Dikeluarkan" | "Selesai";
}

export type UserPersona = "Pemilik Kenderaan" | "Kedai Tayar";

export type NavTab = 
  | "smart_search"
  | "vehicle_matching"
  | "brand_directory"
  | "pattern_directory"
  | "size_directory"
  | "comparison"
  | "quotation"
  | "inventory_dashboard"
  | "ai_advisor";
