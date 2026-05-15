-- ============================================================
-- V1 — Initial schema — Solar Shop
-- ============================================================

-- ── Roles ────────────────────────────────────────────────────
CREATE TABLE roles (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE users (
    id                          BIGSERIAL PRIMARY KEY,
    email                       VARCHAR(255) NOT NULL UNIQUE,
    password                    VARCHAR(255) NOT NULL,
    first_name                  VARCHAR(100),
    last_name                   VARCHAR(100),
    phone                       VARCHAR(20),
    is_active                   BOOLEAN      NOT NULL DEFAULT true,
    email_verified              BOOLEAN      NOT NULL DEFAULT false,
    email_verification_token    VARCHAR(255),
    password_reset_token        VARCHAR(255),
    password_reset_expires_at   TIMESTAMP,
    last_login_at               TIMESTAMP,
    deleted_at                  TIMESTAMP,
    created_at                  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

-- ── Addresses ────────────────────────────────────────────────
CREATE TABLE addresses (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT       REFERENCES users(id) ON DELETE SET NULL,
    type          VARCHAR(20)  NOT NULL DEFAULT 'shipping',
    first_name    VARCHAR(100),
    last_name     VARCHAR(100),
    company       VARCHAR(255),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city          VARCHAR(100) NOT NULL,
    state         VARCHAR(100),
    postal_code   VARCHAR(20)  NOT NULL,
    country       VARCHAR(2)   NOT NULL DEFAULT 'FR',
    phone         VARCHAR(20),
    is_default    BOOLEAN      NOT NULL DEFAULT false,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── Categories ───────────────────────────────────────────────
CREATE TABLE categories (
    id               BIGSERIAL PRIMARY KEY,
    parent_id        BIGINT       REFERENCES categories(id) ON DELETE SET NULL,
    slug             VARCHAR(255) NOT NULL UNIQUE,
    name             VARCHAR(255) NOT NULL,
    description      TEXT,
    image_url        VARCHAR(500),
    meta_title       VARCHAR(255),
    meta_description TEXT,
    position         INTEGER      NOT NULL DEFAULT 0,
    is_active        BOOLEAN      NOT NULL DEFAULT true,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── Brands ───────────────────────────────────────────────────
CREATE TABLE brands (
    id               BIGSERIAL PRIMARY KEY,
    slug             VARCHAR(255) NOT NULL UNIQUE,
    name             VARCHAR(255) NOT NULL,
    description      TEXT,
    logo_url         VARCHAR(500),
    website_url      VARCHAR(500),
    meta_title       VARCHAR(255),
    meta_description TEXT,
    is_active        BOOLEAN      NOT NULL DEFAULT true,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── Products ─────────────────────────────────────────────────
CREATE TABLE products (
    id                BIGSERIAL PRIMARY KEY,
    sku               VARCHAR(100) NOT NULL UNIQUE,
    slug              VARCHAR(255) NOT NULL UNIQUE,
    name              VARCHAR(500) NOT NULL,
    short_description TEXT,
    long_description  TEXT,
    category_id       BIGINT       REFERENCES categories(id) ON DELETE SET NULL,
    brand_id          BIGINT       REFERENCES brands(id) ON DELETE SET NULL,
    product_type      VARCHAR(50)  NOT NULL,
    installation_type VARCHAR(50),
    phase_type        VARCHAR(20),
    base_power_kwc    NUMERIC(10,2),
    inverter_power_va NUMERIC(10,2),
    battery_capacity_kwh NUMERIC(10,2),
    voltage_output    VARCHAR(50),
    injection_type    VARCHAR(30),
    panel_count       INTEGER,
    warranty_years    INTEGER,
    weight            NUMERIC(10,2),
    dimensions        VARCHAR(100),
    meta_title        VARCHAR(255),
    meta_description  TEXT,
    is_active         BOOLEAN      NOT NULL DEFAULT false,
    is_featured       BOOLEAN      NOT NULL DEFAULT false,
    deleted_at        TIMESTAMP,
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE product_images (
    id         BIGSERIAL PRIMARY KEY,
    product_id BIGINT       NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url        VARCHAR(500) NOT NULL,
    alt_text   VARCHAR(255),
    position   INTEGER      NOT NULL DEFAULT 0,
    is_primary BOOLEAN      NOT NULL DEFAULT false,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE product_documents (
    id         BIGSERIAL PRIMARY KEY,
    product_id BIGINT       NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name       VARCHAR(255) NOT NULL,
    url        VARCHAR(500) NOT NULL,
    type       VARCHAR(50),
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── Attributes ───────────────────────────────────────────────
CREATE TABLE attributes (
    id         BIGSERIAL PRIMARY KEY,
    code       VARCHAR(100) NOT NULL UNIQUE,
    name       VARCHAR(255) NOT NULL,
    type       VARCHAR(20)  NOT NULL DEFAULT 'text',
    unit       VARCHAR(50),
    filterable BOOLEAN      NOT NULL DEFAULT false,
    comparable BOOLEAN      NOT NULL DEFAULT false,
    position   INTEGER      NOT NULL DEFAULT 0,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE attribute_values (
    id           BIGSERIAL PRIMARY KEY,
    attribute_id BIGINT       NOT NULL REFERENCES attributes(id) ON DELETE CASCADE,
    value        VARCHAR(255) NOT NULL,
    label        VARCHAR(255),
    position     INTEGER      NOT NULL DEFAULT 0
);

CREATE TABLE product_attribute_values (
    id           BIGSERIAL PRIMARY KEY,
    product_id   BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    attribute_id BIGINT NOT NULL REFERENCES attributes(id),
    value        TEXT   NOT NULL,
    UNIQUE (product_id, attribute_id)
);

-- ── Product Variants ─────────────────────────────────────────
CREATE TABLE product_variants (
    id             BIGSERIAL PRIMARY KEY,
    product_id     BIGINT        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    reference      VARCHAR(100)  NOT NULL UNIQUE,
    label          VARCHAR(255)  NOT NULL,
    price_ht       NUMERIC(10,2) NOT NULL,
    price_ttc      NUMERIC(10,2) NOT NULL,
    currency       VARCHAR(3)    NOT NULL DEFAULT 'EUR',
    weight         NUMERIC(10,2),
    dimensions     VARCHAR(100),
    is_default     BOOLEAN       NOT NULL DEFAULT false,
    is_active      BOOLEAN       NOT NULL DEFAULT true,
    created_at     TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ── Stock ────────────────────────────────────────────────────
CREATE TABLE stock_items (
    id                  BIGSERIAL PRIMARY KEY,
    variant_id          BIGINT  NOT NULL UNIQUE REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity            INTEGER NOT NULL DEFAULT 0,
    reserved_quantity   INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER NOT NULL DEFAULT 5,
    allow_backorder     BOOLEAN NOT NULL DEFAULT false,
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Coupons ──────────────────────────────────────────────────
CREATE TABLE coupons (
    id               BIGSERIAL PRIMARY KEY,
    code             VARCHAR(100)  NOT NULL UNIQUE,
    description      VARCHAR(255),
    type             VARCHAR(20)   NOT NULL,
    value            NUMERIC(10,2) NOT NULL,
    min_order_amount NUMERIC(10,2),
    max_uses         INTEGER,
    used_count       INTEGER       NOT NULL DEFAULT 0,
    starts_at        TIMESTAMP,
    expires_at       TIMESTAMP,
    is_active        BOOLEAN       NOT NULL DEFAULT true,
    created_at       TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ── Cart ─────────────────────────────────────────────────────
CREATE TABLE carts (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT    REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    coupon_id  BIGINT    REFERENCES coupons(id),
    currency   VARCHAR(3) NOT NULL DEFAULT 'EUR',
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE cart_items (
    id              BIGSERIAL PRIMARY KEY,
    cart_id         BIGINT        NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    variant_id      BIGINT        NOT NULL REFERENCES product_variants(id),
    quantity        INTEGER       NOT NULL DEFAULT 1,
    unit_price_ht   NUMERIC(10,2) NOT NULL,
    unit_price_ttc  NUMERIC(10,2) NOT NULL,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ── Orders ───────────────────────────────────────────────────
CREATE TABLE orders (
    id                  BIGSERIAL PRIMARY KEY,
    reference           VARCHAR(50)   NOT NULL UNIQUE,
    user_id             BIGINT        REFERENCES users(id) ON DELETE SET NULL,
    status              VARCHAR(30)   NOT NULL DEFAULT 'pending',
    currency            VARCHAR(3)    NOT NULL DEFAULT 'EUR',
    subtotal_ht         NUMERIC(10,2) NOT NULL,
    tax_amount          NUMERIC(10,2) NOT NULL DEFAULT 0,
    shipping_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_ttc           NUMERIC(10,2) NOT NULL,
    coupon_id           BIGINT        REFERENCES coupons(id),
    shipping_address_id BIGINT        REFERENCES addresses(id),
    billing_address_id  BIGINT        REFERENCES addresses(id),
    shipping_method     VARCHAR(100),
    notes               TEXT,
    internal_notes      TEXT,
    cancelled_at        TIMESTAMP,
    delivered_at        TIMESTAMP,
    created_at          TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    id               BIGSERIAL PRIMARY KEY,
    order_id         BIGINT        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    variant_id       BIGINT        REFERENCES product_variants(id) ON DELETE SET NULL,
    product_snapshot JSONB         NOT NULL,
    quantity         INTEGER       NOT NULL,
    unit_price_ht    NUMERIC(10,2) NOT NULL,
    unit_price_ttc   NUMERIC(10,2) NOT NULL,
    total_ht         NUMERIC(10,2) NOT NULL,
    total_ttc        NUMERIC(10,2) NOT NULL,
    created_at       TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ── Payments ─────────────────────────────────────────────────
CREATE TABLE payments (
    id                  BIGSERIAL PRIMARY KEY,
    order_id            BIGINT        NOT NULL REFERENCES orders(id),
    provider            VARCHAR(50)   NOT NULL,
    provider_payment_id VARCHAR(255),
    amount              NUMERIC(10,2) NOT NULL,
    currency            VARCHAR(3)    NOT NULL DEFAULT 'EUR',
    status              VARCHAR(30)   NOT NULL DEFAULT 'pending',
    method              VARCHAR(50),
    metadata            JSONB,
    created_at          TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ── Shipments ────────────────────────────────────────────────
CREATE TABLE shipments (
    id                    BIGSERIAL PRIMARY KEY,
    order_id              BIGINT       NOT NULL REFERENCES orders(id),
    carrier               VARCHAR(100),
    tracking_number       VARCHAR(255),
    status                VARCHAR(30)  NOT NULL DEFAULT 'pending',
    shipped_at            TIMESTAMP,
    estimated_delivery_at TIMESTAMP,
    delivered_at          TIMESTAMP,
    created_at            TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── Quotes ───────────────────────────────────────────────────
CREATE TABLE quotes (
    id                 BIGSERIAL PRIMARY KEY,
    reference          VARCHAR(50)   NOT NULL UNIQUE,
    user_id            BIGINT        REFERENCES users(id) ON DELETE SET NULL,
    status             VARCHAR(30)   NOT NULL DEFAULT 'new',
    first_name         VARCHAR(100),
    last_name          VARCHAR(100),
    email              VARCHAR(255)  NOT NULL,
    phone              VARCHAR(20),
    company            VARCHAR(255),
    installation_type  VARCHAR(50),
    consumption_kwh    NUMERIC(10,2),
    location           VARCHAR(255),
    budget             NUMERIC(10,2),
    message            TEXT,
    internal_notes     TEXT,
    converted_order_id BIGINT        REFERENCES orders(id),
    assigned_to        BIGINT        REFERENCES users(id),
    created_at         TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE quote_items (
    id         BIGSERIAL PRIMARY KEY,
    quote_id   BIGINT        NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    product_id BIGINT        REFERENCES products(id) ON DELETE SET NULL,
    variant_id BIGINT        REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity   INTEGER       NOT NULL DEFAULT 1,
    unit_price_ht NUMERIC(10,2),
    created_at TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ── SEO Pages ────────────────────────────────────────────────
CREATE TABLE seo_pages (
    id               BIGSERIAL PRIMARY KEY,
    page_type        VARCHAR(50)  NOT NULL,
    entity_id        BIGINT,
    slug             VARCHAR(255) NOT NULL UNIQUE,
    meta_title       VARCHAR(255),
    meta_description TEXT,
    og_title         VARCHAR(255),
    og_description   TEXT,
    og_image_url     VARCHAR(500),
    canonical_url    VARCHAR(500),
    no_index         BOOLEAN      NOT NULL DEFAULT false,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── Audit Logs ───────────────────────────────────────────────
CREATE TABLE audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT       REFERENCES users(id) ON DELETE SET NULL,
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id   BIGINT,
    old_value   JSONB,
    new_value   JSONB,
    ip_address  VARCHAR(45),
    user_agent  TEXT,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_users_email             ON users(email);
CREATE INDEX idx_users_deleted_at        ON users(deleted_at);
CREATE INDEX idx_categories_slug         ON categories(slug);
CREATE INDEX idx_categories_parent_id    ON categories(parent_id);
CREATE INDEX idx_brands_slug             ON brands(slug);
CREATE INDEX idx_products_slug           ON products(slug);
CREATE INDEX idx_products_category_id    ON products(category_id);
CREATE INDEX idx_products_brand_id       ON products(brand_id);
CREATE INDEX idx_products_is_active      ON products(is_active);
CREATE INDEX idx_products_product_type   ON products(product_type);
CREATE INDEX idx_products_install_type   ON products(installation_type);
CREATE INDEX idx_products_phase_type     ON products(phase_type);
CREATE INDEX idx_products_deleted_at     ON products(deleted_at);
CREATE INDEX idx_product_variants_prod   ON product_variants(product_id);
CREATE INDEX idx_product_images_prod     ON product_images(product_id);
CREATE INDEX idx_pav_product_id          ON product_attribute_values(product_id);
CREATE INDEX idx_pav_attribute_id        ON product_attribute_values(attribute_id);
CREATE INDEX idx_stock_variant_id        ON stock_items(variant_id);
CREATE INDEX idx_cart_items_cart_id      ON cart_items(cart_id);
CREATE INDEX idx_orders_user_id          ON orders(user_id);
CREATE INDEX idx_orders_status           ON orders(status);
CREATE INDEX idx_orders_reference        ON orders(reference);
CREATE INDEX idx_order_items_order_id    ON order_items(order_id);
CREATE INDEX idx_quotes_email            ON quotes(email);
CREATE INDEX idx_quotes_status           ON quotes(status);
CREATE INDEX idx_audit_logs_user_id      ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity       ON audit_logs(entity_type, entity_id);

-- ============================================================
-- Seed data
-- ============================================================
INSERT INTO roles (name) VALUES
    ('ROLE_CLIENT'),
    ('ROLE_COMMERCIAL'),
    ('ROLE_ADMIN'),
    ('ROLE_SUPER_ADMIN');
