-- =========================================================================
-- LIAS TYRE PRO — SUPABASE POSTGRESQL SCHEMA DDL
-- Tables: public.tyres, public.settings
-- =========================================================================

-- 1. Create table public.tyres
CREATE TABLE IF NOT EXISTS public.tyres (
    id VARCHAR(100) PRIMARY KEY,
    brand_id VARCHAR(50) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    size VARCHAR(50) NOT NULL,
    width NUMERIC(6,2) NOT NULL DEFAULT 0,
    aspect_ratio NUMERIC(5,2) NOT NULL DEFAULT 0,
    rim_size NUMERIC(4,1) NOT NULL DEFAULT 0,
    model VARCHAR(150) NOT NULL,
    pattern VARCHAR(100) NOT NULL DEFAULT '',
    category VARCHAR(50) NOT NULL DEFAULT 'Passenger',
    tread_depth_mm NUMERIC(4,2) NOT NULL DEFAULT 0,
    speed_rating VARCHAR(10) NOT NULL DEFAULT 'H',
    load_index INTEGER NOT NULL DEFAULT 0,
    market_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    cost_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    profit NUMERIC(10,2) NOT NULL DEFAULT 0,
    store_stock INTEGER NOT NULL DEFAULT 0,
    supplier_stock_nexen INTEGER DEFAULT 0,
    supplier_stock_goodyear INTEGER DEFAULT 0,
    total_stock INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'In Stock',
    year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    wet_grip_rating VARCHAR(5) NOT NULL DEFAULT 'C',
    noise_level_db INTEGER NOT NULL DEFAULT 70,
    fuel_saving_rating VARCHAR(5) NOT NULL DEFAULT 'C',
    tread_life_km INTEGER NOT NULL DEFAULT 40000,
    description TEXT NOT NULL DEFAULT '',
    key_technologies TEXT[] NOT NULL DEFAULT '{}',
    image_id VARCHAR(100),
    image_url TEXT,
    is_new_product BOOLEAN DEFAULT FALSE,
    is_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for frequently queried/filtered columns in Lias Tyre:
-- Index 1: size (Primary filter for customer tyre lookup and vehicle matching)
CREATE INDEX IF NOT EXISTS idx_tyres_size ON public.tyres(size);

-- Index 2: brand_id & brand (Filtering in Brand Directory and Brand-specific queries)
CREATE INDEX IF NOT EXISTS idx_tyres_brand_id ON public.tyres(brand_id);
CREATE INDEX IF NOT EXISTS idx_tyres_brand ON public.tyres(brand);

-- Index 3: category (Filtering in Segment / Category Directory e.g. SUV, 4x4, Performance)
CREATE INDEX IF NOT EXISTS idx_tyres_category ON public.tyres(category);

-- Index 4: status (Filtering in Inventory Dashboard e.g. Out of Stock, Low Stock, In Stock)
CREATE INDEX IF NOT EXISTS idx_tyres_status ON public.tyres(status);

-- 2. Create table public.settings
CREATE TABLE IF NOT EXISTS public.settings (
    key VARCHAR(50) PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial admin security setting (PIN '1234' SHA-256 hash) if not present
INSERT INTO public.settings (key, value, updated_at)
VALUES (
    'security',
    '{"adminPinHash": "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4", "updatedAt": "2026-08-16T00:00:00.000Z"}'::jsonb,
    NOW()
)
ON CONFLICT (key) DO NOTHING;
