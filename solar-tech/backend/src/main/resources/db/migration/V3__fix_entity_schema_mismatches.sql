-- ============================================================
-- V3 — Fix mismatches between entities and V1 schema
-- ============================================================

-- ── orders: add denormalized shipping address columns ────────
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS shipping_first_name  VARCHAR(100),
    ADD COLUMN IF NOT EXISTS shipping_last_name   VARCHAR(100),
    ADD COLUMN IF NOT EXISTS shipping_email       VARCHAR(255),
    ADD COLUMN IF NOT EXISTS shipping_phone       VARCHAR(30),
    ADD COLUMN IF NOT EXISTS shipping_address     VARCHAR(500),
    ADD COLUMN IF NOT EXISTS shipping_city        VARCHAR(100),
    ADD COLUMN IF NOT EXISTS shipping_postal_code VARCHAR(20),
    ADD COLUMN IF NOT EXISTS shipping_country     VARCHAR(2) DEFAULT 'FR';

-- ── order_items: rename variant_id → product_variant_id ─────
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'order_items' AND column_name = 'variant_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'order_items' AND column_name = 'product_variant_id'
    ) THEN
        ALTER TABLE order_items RENAME COLUMN variant_id TO product_variant_id;
    END IF;
END$$;

-- ── order_items: add missing columns ────────────────────────
ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS product_name  VARCHAR(255),
    ADD COLUMN IF NOT EXISTS variant_label VARCHAR(100);

-- ── order_items: fix product_snapshot type (JSONB → TEXT) ───
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'order_items'
          AND column_name = 'product_snapshot'
          AND data_type = 'jsonb'
    ) THEN
        ALTER TABLE order_items
            ALTER COLUMN product_snapshot TYPE TEXT USING product_snapshot::TEXT;
    END IF;
END$$;

-- ── order_items: remove columns not mapped by entity ────────
ALTER TABLE order_items
    DROP COLUMN IF EXISTS total_ht,
    DROP COLUMN IF EXISTS total_ttc;

-- ── quotes: rename internal_notes → admin_notes ─────────────
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'quotes' AND column_name = 'internal_notes'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'quotes' AND column_name = 'admin_notes'
    ) THEN
        ALTER TABLE quotes RENAME COLUMN internal_notes TO admin_notes;
    END IF;
END$$;

-- ── quote_items: add missing columns ────────────────────────
ALTER TABLE quote_items
    ADD COLUMN IF NOT EXISTS product_name  VARCHAR(255),
    ADD COLUMN IF NOT EXISTS variant_label VARCHAR(100);
