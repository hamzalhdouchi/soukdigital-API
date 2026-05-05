-- ═══════════════════════════════════════════════════════════════
-- Seed: Promo Codes (matches frontend Zustand cart store)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO promo_codes (code, discount_percent, max_uses, is_active) VALUES
  ('SOUK10',      10.00, NULL, true),
  ('ARTISAN20',   20.00, NULL, true),
  ('BIENVENUE15', 15.00, 1000, true);
