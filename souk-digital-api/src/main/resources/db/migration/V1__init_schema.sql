-- ═══════════════════════════════════════════════════════════════
-- Souk Digital — Initial Schema
-- ═══════════════════════════════════════════════════════════════

-- ── Users ──────────────────────────────────────────────────────
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(255) UNIQUE,
    phone         VARCHAR(20)  UNIQUE,
    password_hash VARCHAR(255),
    role          VARCHAR(20)  NOT NULL DEFAULT 'BUYER',
    is_verified   BOOLEAN      NOT NULL DEFAULT false,
    avatar_url    TEXT,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_users_role CHECK (role IN ('BUYER','VENDOR','ADMIN'))
);

-- ── Vendors ─────────────────────────────────────────────────────
CREATE TABLE vendors (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name             VARCHAR(200) NOT NULL,
    name_ar          VARCHAR(200),
    slug             VARCHAR(200) UNIQUE NOT NULL,
    city             VARCHAR(100),
    description      TEXT,
    description_ar   TEXT,
    avatar_url       TEXT,
    banner_url       TEXT,
    is_artisan       BOOLEAN     NOT NULL DEFAULT false,
    is_verified      BOOLEAN     NOT NULL DEFAULT false,
    commission_rate  DECIMAL(5,2)         DEFAULT 10.00,
    rating           DECIMAL(3,2)         DEFAULT 0,
    review_count     INT                  DEFAULT 0,
    product_count    INT                  DEFAULT 0,
    follower_count   INT                  DEFAULT 0,
    member_since     DATE                 DEFAULT CURRENT_DATE,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Categories ──────────────────────────────────────────────────
CREATE TABLE categories (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) NOT NULL,
    name_ar    VARCHAR(100) NOT NULL,
    slug       VARCHAR(100) UNIQUE NOT NULL,
    emoji      VARCHAR(10),
    image_url  TEXT,
    parent_id  UUID REFERENCES categories(id),
    sort_order INT          NOT NULL DEFAULT 0,
    is_active  BOOLEAN      NOT NULL DEFAULT true
);

-- ── Products ────────────────────────────────────────────────────
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id       UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    category_id     UUID REFERENCES categories(id),
    name            VARCHAR(300) NOT NULL,
    name_ar         VARCHAR(300) NOT NULL,
    slug            VARCHAR(300) UNIQUE NOT NULL,
    description     TEXT,
    description_ar  TEXT,
    price           DECIMAL(10,2) NOT NULL,
    original_price  DECIMAL(10,2),
    stock_count     INT          NOT NULL DEFAULT 0,
    badge           VARCHAR(20),
    city            VARCHAR(100),
    free_delivery   BOOLEAN      NOT NULL DEFAULT false,
    is_active       BOOLEAN      NOT NULL DEFAULT true,
    rating          DECIMAL(3,2)          DEFAULT 0,
    review_count    INT                   DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_products_badge CHECK (badge IN ('artisan','sale','new','top','flash') OR badge IS NULL)
);

-- ── Product Images ──────────────────────────────────────────────
CREATE TABLE product_images (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url         TEXT NOT NULL,
    sort_order  INT  NOT NULL DEFAULT 0
);

-- ── Orders ──────────────────────────────────────────────────────
CREATE TABLE orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id            UUID NOT NULL REFERENCES users(id),
    status              VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    payment_method      VARCHAR(30) NOT NULL,
    payment_status      VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    subtotal            DECIMAL(10,2) NOT NULL,
    discount_amount     DECIMAL(10,2)          DEFAULT 0,
    delivery_fee        DECIMAL(10,2)          DEFAULT 0,
    total               DECIMAL(10,2) NOT NULL,
    promo_code          VARCHAR(50),
    tracking_number     VARCHAR(100),
    notes               TEXT,
    -- Embedded delivery address
    delivery_first_name VARCHAR(100),
    delivery_last_name  VARCHAR(100),
    delivery_phone      VARCHAR(20),
    delivery_street     TEXT,
    delivery_city       VARCHAR(100),
    delivery_zip        VARCHAR(20),
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_orders_status         CHECK (status IN ('PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED')),
    CONSTRAINT chk_orders_payment_method CHECK (payment_method IN ('COD','CARD_CMI','MOBILE','TRANSFER')),
    CONSTRAINT chk_orders_payment_status CHECK (payment_status IN ('PENDING','PAID','FAILED','REFUNDED'))
);

-- ── Order Items ─────────────────────────────────────────────────
CREATE TABLE order_items (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id       UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id     UUID NOT NULL REFERENCES products(id),
    vendor_id      UUID NOT NULL REFERENCES vendors(id),
    product_name   VARCHAR(300) NOT NULL,
    product_image  TEXT,
    price          DECIMAL(10,2) NOT NULL,
    quantity       INT          NOT NULL,
    subtotal       DECIMAL(10,2) NOT NULL
);

-- ── Addresses ───────────────────────────────────────────────────
CREATE TABLE addresses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label       VARCHAR(50),
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    phone       VARCHAR(20)  NOT NULL,
    street      TEXT         NOT NULL,
    city        VARCHAR(100) NOT NULL,
    zip_code    VARCHAR(20),
    is_default  BOOLEAN      NOT NULL DEFAULT false
);

-- ── Reviews ─────────────────────────────────────────────────────
CREATE TABLE reviews (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id           UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id              UUID NOT NULL REFERENCES users(id),
    order_id             UUID REFERENCES orders(id),
    rating               SMALLINT    NOT NULL,
    comment              TEXT,
    is_verified_purchase BOOLEAN     NOT NULL DEFAULT false,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT uq_reviews_product_user UNIQUE (product_id, user_id)
);

-- ── Promo Codes ─────────────────────────────────────────────────
CREATE TABLE promo_codes (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code             VARCHAR(50) UNIQUE NOT NULL,
    discount_percent DECIMAL(5,2)       NOT NULL,
    max_uses         INT,
    used_count       INT         NOT NULL DEFAULT 0,
    expires_at       TIMESTAMPTZ,
    is_active        BOOLEAN     NOT NULL DEFAULT true,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── OTP Codes ───────────────────────────────────────────────────
CREATE TABLE otp_codes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone      VARCHAR(20)  NOT NULL,
    code       VARCHAR(6)   NOT NULL,
    expires_at TIMESTAMPTZ  NOT NULL,
    used       BOOLEAN      NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Payment Transactions ────────────────────────────────────────
CREATE TABLE payment_transactions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id     UUID NOT NULL REFERENCES orders(id),
    provider     VARCHAR(30)   NOT NULL,
    provider_ref VARCHAR(200),
    amount       DECIMAL(10,2) NOT NULL,
    status       VARCHAR(20)   NOT NULL,
    raw_response TEXT,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_payment_provider CHECK (provider IN ('CMI','MOBILE','COD','TRANSFER')),
    CONSTRAINT chk_payment_status   CHECK (status IN ('PENDING','SUCCESS','FAILED'))
);

-- ═══════════════════════════════════════════════════════════════
-- Indexes
-- ═══════════════════════════════════════════════════════════════
CREATE INDEX idx_users_email          ON users(email);
CREATE INDEX idx_users_phone          ON users(phone);
CREATE INDEX idx_vendors_slug         ON vendors(slug);
CREATE INDEX idx_vendors_user_id      ON vendors(user_id);
CREATE INDEX idx_products_slug        ON products(slug);
CREATE INDEX idx_products_vendor_id   ON products(vendor_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active   ON products(is_active);
CREATE INDEX idx_orders_buyer_id      ON orders(buyer_id);
CREATE INDEX idx_orders_status        ON orders(status);
CREATE INDEX idx_otp_phone            ON otp_codes(phone);
