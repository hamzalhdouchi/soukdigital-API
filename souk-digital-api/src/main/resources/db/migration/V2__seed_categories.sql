-- ═══════════════════════════════════════════════════════════════
-- Seed: 6 Moroccan Categories (matches frontend mock data)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO categories (id, name, name_ar, slug, emoji, image_url, sort_order) VALUES
  (gen_random_uuid(), 'Artisanat',     'الصناعة التقليدية', 'artisanat',     '🏺', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 1),
  (gen_random_uuid(), 'Mode & Textile','الموضة والنسيج',   'mode',           '👗', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400', 2),
  (gen_random_uuid(), 'Beauté',        'الجمال',            'beaute',         '✨', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', 3),
  (gen_random_uuid(), 'Maison & Déco', 'المنزل والديكور',  'maison',         '🏠', 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400', 4),
  (gen_random_uuid(), 'Électronique',  'الإلكترونيات',      'electronique',   '📱', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400', 5),
  (gen_random_uuid(), 'Alimentation',  'المواد الغذائية',  'alimentation',   '🌿', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', 6);
