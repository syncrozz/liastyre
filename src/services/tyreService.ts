import { Tire } from "../types/tyre";
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabase";

/**
 * Interface representing the relational PostgreSQL table row in public.tyres.
 */
export interface DbTireRow {
  id: string;
  brand_id: string;
  brand: string;
  size: string;
  width: number;
  aspect_ratio: number;
  rim_size: number;
  model: string;
  pattern: string;
  category: string;
  tread_depth_mm: number;
  speed_rating: string;
  load_index: number;
  market_price: number;
  cost_price: number;
  profit: number;
  store_stock: number;
  supplier_stock_nexen?: number | null;
  supplier_stock_goodyear?: number | null;
  total_stock: number;
  status: string;
  year: number;
  wet_grip_rating: string;
  noise_level_db: number;
  fuel_saving_rating: string;
  tread_life_km: number;
  description: string;
  key_technologies: string[];
  image_id?: string | null;
  image_url?: string | null;
  is_new_product?: boolean | null;
  is_popular?: boolean | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Transforms a PostgreSQL database row into a domain model Tire entity.
 */
export function mapDbRowToTire(row: DbTireRow): Tire {
  return {
    id: row.id,
    brandId: row.brand_id,
    brand: row.brand,
    size: row.size,
    width: row.width,
    aspectRatio: row.aspect_ratio,
    rimSize: row.rim_size,
    model: row.model,
    pattern: row.pattern,
    category: row.category as Tire["category"],
    treadDepthMm: row.tread_depth_mm,
    speedRating: row.speed_rating,
    loadIndex: row.load_index,
    marketPrice: row.market_price,
    costPrice: row.cost_price,
    profit: row.profit,
    storeStock: row.store_stock,
    supplierStockNexen: row.supplier_stock_nexen ?? undefined,
    supplierStockGoodyear: row.supplier_stock_goodyear ?? undefined,
    totalStock: row.total_stock,
    status: row.status as Tire["status"],
    year: row.year,
    wetGripRating: row.wet_grip_rating as Tire["wetGripRating"],
    noiseLevelDb: row.noise_level_db,
    fuelSavingRating: row.fuel_saving_rating as Tire["fuelSavingRating"],
    treadLifeKm: row.tread_life_km,
    description: row.description,
    keyTechnologies: row.key_technologies || [],
    imageId: row.image_id ?? undefined,
    imageUrl: row.image_url ?? undefined,
    isNewProduct: row.is_new_product ?? undefined,
    isPopular: row.is_popular ?? undefined,
  };
}

/**
 * Transforms a domain model Tire entity into a PostgreSQL database row.
 */
export function mapTireToDbRow(tire: Tire): DbTireRow {
  return {
    id: tire.id,
    brand_id: tire.brandId,
    brand: tire.brand,
    size: tire.size,
    width: tire.width,
    aspect_ratio: tire.aspectRatio,
    rim_size: tire.rimSize,
    model: tire.model,
    pattern: tire.pattern,
    category: tire.category,
    tread_depth_mm: tire.treadDepthMm,
    speed_rating: tire.speedRating,
    load_index: tire.loadIndex,
    market_price: tire.marketPrice,
    cost_price: tire.costPrice,
    profit: tire.profit,
    store_stock: tire.storeStock,
    supplier_stock_nexen: tire.supplierStockNexen ?? null,
    supplier_stock_goodyear: tire.supplierStockGoodyear ?? null,
    total_stock: tire.totalStock,
    status: tire.status,
    year: tire.year,
    wet_grip_rating: tire.wetGripRating,
    noise_level_db: tire.noiseLevelDb,
    fuel_saving_rating: tire.fuelSavingRating,
    tread_life_km: tire.treadLifeKm,
    description: tire.description || "",
    key_technologies: tire.keyTechnologies || [],
    image_id: tire.imageId ?? null,
    image_url: tire.imageUrl ?? null,
    is_new_product: tire.isNewProduct ?? null,
    is_popular: tire.isPopular ?? null,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Database Abstraction Service for Lias Tyre Inventory and Catalog.
 * Encapsulates all direct database calls away from UI components.
 */
export class TyreService {
  /**
   * Fetches all tyres from the database.
   */
  static async getAllTyres(): Promise<{ data: Tire[]; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { data: [], error: "Supabase client is not configured in environment." };
    }

    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from("tyres")
        .select("*")
        .order("brand", { ascending: true });

      if (error) {
        return { data: [], error: error.message };
      }

      const tyres = (data as DbTireRow[]).map(mapDbRowToTire);
      return { data: tyres };
    } catch (err: any) {
      return { data: [], error: err?.message || String(err) };
    }
  }

  /**
   * Fetches a single tyre by its unique ID.
   */
  static async getTyreById(id: string): Promise<{ data: Tire | null; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: "Supabase client is not configured in environment." };
    }

    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from("tyres")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data ? mapDbRowToTire(data as DbTireRow) : null };
    } catch (err: any) {
      return { data: null, error: err?.message || String(err) };
    }
  }

  /**
   * Upserts multiple tyres (used for CSV Bulk Import and Mass Sync).
   */
  static async upsertTyres(tyres: Tire[]): Promise<{ success: boolean; count: number; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, count: 0, error: "Supabase client is not configured in environment." };
    }

    try {
      const client = getSupabaseClient();
      const rows = tyres.map(mapTireToDbRow);

      const { data, error } = await client
        .from("tyres")
        .upsert(rows, { onConflict: "id" })
        .select("id");

      if (error) {
        return { success: false, count: 0, error: error.message };
      }

      return { success: true, count: data?.length || rows.length };
    } catch (err: any) {
      return { success: false, count: 0, error: err?.message || String(err) };
    }
  }

  /**
   * Adds a single new tyre entity.
   */
  static async addTyre(tire: Tire): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Supabase client is not configured in environment." };
    }

    try {
      const client = getSupabaseClient();
      const row = mapTireToDbRow(tire);

      const { error } = await client.from("tyres").insert(row);
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || String(err) };
    }
  }

  /**
   * Updates an existing tyre's full record.
   */
  static async updateTyre(tire: Tire): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Supabase client is not configured in environment." };
    }

    try {
      const client = getSupabaseClient();
      const row = mapTireToDbRow(tire);

      const { error } = await client.from("tyres").update(row).eq("id", tire.id);
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || String(err) };
    }
  }

  /**
   * Updates store stock and status for a single tyre.
   */
  static async updateStock(tireId: string, newStock: number): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Supabase client is not configured in environment." };
    }

    try {
      const client = getSupabaseClient();
      const status: Tire["status"] =
        newStock <= 0 ? "Out of Stock" : newStock <= 2 ? "Low Stock" : "In Stock";

      const { error } = await client
        .from("tyres")
        .update({
          store_stock: newStock,
          total_stock: newStock,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", tireId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || String(err) };
    }
  }

  /**
   * Atomically deducts inventory stock for a set of items (e.g. upon quotation approval).
   */
  static async deductStock(
    items: { tireId: string; quantity: number }[]
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Supabase client is not configured in environment." };
    }

    try {
      const client = getSupabaseClient();
      for (const item of items) {
        // Fetch current stock
        const { data: current, error: fetchErr } = await client
          .from("tyres")
          .select("store_stock")
          .eq("id", item.tireId)
          .single();

        if (fetchErr || !current) continue;

        const updatedStock = Math.max(0, (current.store_stock || 0) - item.quantity);
        const status: Tire["status"] =
          updatedStock <= 0 ? "Out of Stock" : updatedStock <= 2 ? "Low Stock" : "In Stock";

        await client
          .from("tyres")
          .update({
            store_stock: updatedStock,
            total_stock: updatedStock,
            status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.tireId);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || String(err) };
    }
  }

  /**
   * Fetches admin PIN hash from settings table.
   */
  static async getAdminPinHash(): Promise<{ hash: string | null; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { hash: null, error: "Supabase client is not configured." };
    }

    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from("settings")
        .select("value")
        .eq("key", "security")
        .single();

      if (error) {
        return { hash: null, error: error.message };
      }

      return { hash: data?.value?.adminPinHash || null };
    } catch (err: any) {
      return { hash: null, error: err?.message || String(err) };
    }
  }

  /**
   * Updates admin PIN hash in settings table.
   */
  static async updateAdminPinHash(newHash: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Supabase client is not configured." };
    }

    try {
      const client = getSupabaseClient();
      const { error } = await client.from("settings").upsert({
        key: "security",
        value: {
          adminPinHash: newHash,
          updatedAt: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || String(err) };
    }
  }
}
