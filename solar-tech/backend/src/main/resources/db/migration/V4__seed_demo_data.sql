-- ============================================================
-- V4 — Demo seed data for SolarTech presentation
-- Passwords: Admin2024 (admin), Demo2024 (clients/commercial)
-- ============================================================

-- ── Users ────────────────────────────────────────────────────
INSERT INTO users (email, password, first_name, last_name, phone, is_active, email_verified) VALUES
('admin@solartech.fr',        '$2a$10$l7yPTbAVE/EC/embPyxIZ.rscEZWRGzTWqkFnueXFBcjr4Fx5oL.6', 'Admin',    'SolarTech', '+33 1 00 00 00 00', true, true),
('commercial@solartech.fr',   '$2a$10$Rv5KLRVM4FQDJSv8vFl4lOMObHHNMI25W1rLDhemDwmbgS1QwCQm6', 'Marc',     'Dubois',    '+33 6 11 22 33 44', true, true),
('thomas.martin@gmail.com',   '$2a$10$reiVasrl9UMZ9FyLnysoYe1zokgSbPdoqLqrpFZN.GtB3mi1YiDRq', 'Thomas',   'Martin',    '+33 6 12 34 56 78', true, true),
('sophie.bernard@gmail.com',  '$2a$10$reiVasrl9UMZ9FyLnysoYe1zokgSbPdoqLqrpFZN.GtB3mi1YiDRq', 'Sophie',   'Bernard',   '+33 6 23 45 67 89', true, true),
('pierre.leroy@hotmail.fr',   '$2a$10$reiVasrl9UMZ9FyLnysoYe1zokgSbPdoqLqrpFZN.GtB3mi1YiDRq', 'Pierre',   'Leroy',     '+33 6 34 56 78 90', true, true),
('camille.petit@orange.fr',   '$2a$10$reiVasrl9UMZ9FyLnysoYe1zokgSbPdoqLqrpFZN.GtB3mi1YiDRq', 'Camille',  'Petit',     '+33 6 45 67 89 01', true, true),
('julien.moreau@sfr.fr',      '$2a$10$reiVasrl9UMZ9FyLnysoYe1zokgSbPdoqLqrpFZN.GtB3mi1YiDRq', 'Julien',   'Moreau',    '+33 6 56 78 90 12', true, true),
('entreprise.verte@pro.fr',   '$2a$10$reiVasrl9UMZ9FyLnysoYe1zokgSbPdoqLqrpFZN.GtB3mi1YiDRq', 'Éco',      'Solutions', '+33 1 44 55 66 77', true, true);

-- Assign roles
INSERT INTO user_roles (user_id, role_id) VALUES
((SELECT id FROM users WHERE email='admin@solartech.fr'),       (SELECT id FROM roles WHERE name='ROLE_ADMIN')),
((SELECT id FROM users WHERE email='commercial@solartech.fr'),  (SELECT id FROM roles WHERE name='ROLE_COMMERCIAL')),
((SELECT id FROM users WHERE email='thomas.martin@gmail.com'),  (SELECT id FROM roles WHERE name='ROLE_CLIENT')),
((SELECT id FROM users WHERE email='sophie.bernard@gmail.com'), (SELECT id FROM roles WHERE name='ROLE_CLIENT')),
((SELECT id FROM users WHERE email='pierre.leroy@hotmail.fr'),  (SELECT id FROM roles WHERE name='ROLE_CLIENT')),
((SELECT id FROM users WHERE email='camille.petit@orange.fr'),  (SELECT id FROM roles WHERE name='ROLE_CLIENT')),
((SELECT id FROM users WHERE email='julien.moreau@sfr.fr'),     (SELECT id FROM roles WHERE name='ROLE_CLIENT')),
((SELECT id FROM users WHERE email='entreprise.verte@pro.fr'),  (SELECT id FROM roles WHERE name='ROLE_CLIENT'));

-- ── Brands ────────────────────────────────────────────────────
INSERT INTO brands (slug, name, description, logo_url, website_url, is_active) VALUES
('sunpower',     'SunPower',     'Leader mondial des panneaux solaires haute efficacité.',         'https://logo.clearbit.com/sunpower.com',     'https://www.sunpower.com',   true),
('huawei',       'Huawei Solar', 'Onduleurs intelligents et solutions de gestion d''énergie.',     'https://logo.clearbit.com/huawei.com',        'https://solar.huawei.com',   true),
('byd',          'BYD',          'Batteries LFP de nouvelle génération pour le stockage solaire.', 'https://logo.clearbit.com/byd.com',           'https://www.byd.com',        true),
('victron',      'Victron Energy','Solutions autonomes et off-grid professionnelles.',             'https://logo.clearbit.com/victronenergy.com', 'https://www.victronenergy.com', true),
('fronius',      'Fronius',      'Onduleurs européens réputés pour leur fiabilité.',               'https://logo.clearbit.com/fronius.com',       'https://www.fronius.com',    true),
('longi',        'LONGi Solar',  'Panneaux monocristallins à haut rendement.',                    'https://logo.clearbit.com/longi.com',         'https://www.longi.com',      true);

-- ── Categories ───────────────────────────────────────────────
INSERT INTO categories (slug, name, description, position, is_active) VALUES
('kits-solaires',    'Kits Solaires',    'Kits complets prêts à installer pour particuliers et professionnels.', 1, true),
('batteries',        'Batteries',        'Batteries lithium haute capacité pour stocker votre énergie solaire.',  2, true),
('onduleurs',        'Onduleurs',        'Onduleurs string et hybrides pour toutes les configurations.',          3, true),
('plug-and-play',    'Plug & Play',      'Solutions solaires sans installation, branchement immédiat.',           4, true),
('accessoires',      'Accessoires',      'Câbles, coffrets, supports et autres accessoires solaires.',             5, true);

-- ── Products — Kits Solaires ─────────────────────────────────
INSERT INTO products (sku, slug, name, short_description, long_description, category_id, brand_id,
    product_type, installation_type, phase_type, base_power_kwc, panel_count, warranty_years,
    inverter_power_va, is_active, is_featured, version)
VALUES
('KIT-3KW-MONO', 'kit-solaire-3kwc-autoconsommation',
    'Kit Solaire 3 kWc — Autoconsommation',
    'Kit complet 3 kWc pour maison individuelle. Comprend panneaux monocristallins, onduleur Fronius et accessoires de pose.',
    'Idéal pour une maison de 100 à 150 m² avec une consommation annuelle de 3 000 à 5 000 kWh. Ce kit comprend 8 panneaux LONGi Solar 375 Wc, un onduleur Fronius Primo 3.0, le câblage DC/AC, le coffret de protection et les fixations pour toiture tuile ou ardoise. Production annuelle estimée : 3 200 kWh selon ensoleillement.',
    (SELECT id FROM categories WHERE slug='kits-solaires'),
    (SELECT id FROM brands WHERE slug='fronius'),
    'solar_kit', 'self_consumption', 'single_phase', 3.00, 8, 25, 3000.00,
    true, true, 0),

('KIT-6KW-TRI', 'kit-solaire-6kwc-triphasé',
    'Kit Solaire 6 kWc Triphasé',
    'Kit professionnel triphasé 6 kWc pour maison ou petite entreprise avec forte consommation.',
    'Ce kit triphasé haute puissance est conçu pour les maisons de 200 m² et plus ou les petits bâtiments professionnels. Il comprend 15 panneaux LONGi Solar 400 Wc, un onduleur Huawei SUN2000 6KTL, le câblage complet et les protections DC/AC. Adapté à un raccordement réseau avec injection du surplus.',
    (SELECT id FROM categories WHERE slug='kits-solaires'),
    (SELECT id FROM brands WHERE slug='huawei'),
    'solar_kit', 'self_consumption', 'three_phase', 6.00, 15, 25, 6000.00,
    true, true, 0),

('KIT-9KW-PRO', 'kit-solaire-9kwc-professionnel',
    'Kit Solaire 9 kWc Professionnel',
    'Solution complète 9 kWc pour PME, entrepôts ou grandes propriétés. Fort retour sur investissement.',
    'Le kit 9 kWc est la solution idéale pour les entreprises souhaitant réduire leur facture énergétique. Composé de 22 panneaux SunPower 415 Wc haute efficacité et d''un onduleur Fronius Symo 9.0-3, il garantit une production maximale même en cas de faible ensoleillement.',
    (SELECT id FROM categories WHERE slug='kits-solaires'),
    (SELECT id FROM brands WHERE slug='sunpower'),
    'solar_kit', 'self_consumption', 'three_phase', 9.00, 22, 25, 9000.00,
    true, false, 0),

('KIT-OFFGRID-5KW', 'kit-solaire-off-grid-5kwc',
    'Kit Solaire Off-Grid 5 kWc + Batterie',
    'Kit autonome complet avec batterie BYD 10 kWh pour site isolé sans raccordement réseau.',
    'La solution autonomie totale pour chalets, mas, refuges ou zones non électrifiées. Ce kit comprend 12 panneaux LONGi 415 Wc, un onduleur/chargeur Victron MultiPlus-II 5000VA, une batterie BYD Battery-Box 10.24 kWh et le régulateur MPPT Victron SmartSolar 150/70.',
    (SELECT id FROM categories WHERE slug='kits-solaires'),
    (SELECT id FROM brands WHERE slug='victron'),
    'solar_kit', 'off_grid', 'single_phase', 5.00, 12, 25, 5000.00,
    true, true, 0);

-- ── Products — Batteries ──────────────────────────────────────
INSERT INTO products (sku, slug, name, short_description, long_description, category_id, brand_id,
    product_type, installation_type, battery_capacity_kwh, warranty_years, is_active, is_featured, version)
VALUES
('BAT-BYD-5KWH', 'batterie-byd-5kwh',
    'Batterie BYD Battery-Box 5.12 kWh',
    'Batterie LFP modulaire 5.12 kWh. Extensible jusqu''à 51.2 kWh. Compatible avec la plupart des onduleurs hybrides.',
    'La BYD Battery-Box Premium HVS 5.12 est une batterie Lithium Fer Phosphate (LFP) à haute tension (200-550V). Sa chimie LFP garantit une sécurité maximale et une durée de vie supérieure à 6 000 cycles. Elle s''intègre parfaitement avec les onduleurs Huawei, Fronius et Victron.',
    (SELECT id FROM categories WHERE slug='batteries'),
    (SELECT id FROM brands WHERE slug='byd'),
    'lithium_battery', 'self_consumption', 5.12, 10,
    true, true, 0),

('BAT-BYD-10KWH', 'batterie-byd-10kwh',
    'Batterie BYD Battery-Box 10.24 kWh',
    'Batterie LFP 10.24 kWh pour stockage optimal de l''énergie solaire. Idéale pour l''autoconsommation nocturne.',
    'Doublez votre autonomie avec la BYD Battery-Box Premium HVS 10.24. Deux modules LFP de 5.12 kWh empilables et extensibles. Garantie 10 ans ou 6 000 cycles. Parfaite pour les foyers avec une consommation nocturne importante ou les zones à fréquentes coupures de courant.',
    (SELECT id FROM categories WHERE slug='batteries'),
    (SELECT id FROM brands WHERE slug='byd'),
    'lithium_battery', 'self_consumption', 10.24, 10,
    true, false, 0),

('BAT-VICTRON-12KWH', 'batterie-victron-12kwh',
    'Batterie Victron Energy Pylontech 12 kWh',
    'Pack batterie 12 kWh pour installations off-grid ou hybrides. Compatible Victron Quattro et MultiPlus.',
    'Le pack Victron + Pylontech US5000 offre 12 kWh de stockage pour vos installations autonomes ou hybrides. La communication BMS-CAN garantit une gestion intelligente de la charge/décharge. Idéal pour les sites isolés ou les professionnels cherchant une autonomie renforcée.',
    (SELECT id FROM categories WHERE slug='batteries'),
    (SELECT id FROM brands WHERE slug='victron'),
    'lithium_battery', 'off_grid', 12.00, 10,
    true, false, 0);

-- ── Products — Onduleurs ──────────────────────────────────────
INSERT INTO products (sku, slug, name, short_description, long_description, category_id, brand_id,
    product_type, installation_type, phase_type, inverter_power_va, warranty_years,
    is_active, is_featured, version)
VALUES
('OND-HUAWEI-5KW', 'onduleur-huawei-sun2000-5kw',
    'Onduleur Huawei SUN2000-5KTL-M2',
    'Onduleur string monophasé 5 kW avec monitoring AI intégré et optimisation MPPT avancée.',
    'L''onduleur Huawei SUN2000-5KTL-M2 est l''un des onduleurs les plus connectés du marché. Il intègre un optimiseur de puissance IA, une communication 4G/WiFi embarquée et un suivi de production en temps réel via l''application FusionSolar. Compatible avec les batteries Huawei LUNA2000.',
    (SELECT id FROM categories WHERE slug='onduleurs'),
    (SELECT id FROM brands WHERE slug='huawei'),
    'inverter', 'self_consumption', 'single_phase', 5000.00, 10,
    true, false, 0),

('OND-FRONIUS-10KW', 'onduleur-fronius-symo-10kw',
    'Onduleur Fronius Symo 10.0-3 Triphasé',
    'Onduleur triphasé 10 kW. Référence européenne en fiabilité. Garantie 10 ans incluse.',
    'Le Fronius Symo 10.0-3 est l''onduleur triphasé de référence pour les installations commerciales et résidentielles de grande puissance. Son interface de communication intégrée (Fronius Solar.web) permet un monitoring complet. Compatible avec toutes les batteries via interface SolarAPI.',
    (SELECT id FROM categories WHERE slug='onduleurs'),
    (SELECT id FROM brands WHERE slug='fronius'),
    'inverter', 'self_consumption', 'three_phase', 10000.00, 10,
    true, true, 0),

('OND-VICTRON-3KW', 'onduleur-chargeur-victron-3kva',
    'Onduleur/Chargeur Victron MultiPlus-II 3000VA',
    'Onduleur/chargeur monophasé 3000VA pour installations autonomes et hybrides. Compatible VE.Bus.',
    'Le Victron MultiPlus-II 3000VA combine un onduleur pur sinus, un chargeur de batterie et un transfert réseau ultra-rapide (< 20ms). Il peut fonctionner en mode autonome, hybride ou UPS. Programmable via l''interface Venus GX et l''application VictronConnect.',
    (SELECT id FROM categories WHERE slug='onduleurs'),
    (SELECT id FROM brands WHERE slug='victron'),
    'inverter', 'off_grid', 'single_phase', 3000.00, 5,
    true, false, 0);

-- ── Products — Plug & Play ────────────────────────────────────
INSERT INTO products (sku, slug, name, short_description, long_description, category_id, brand_id,
    product_type, installation_type, phase_type, base_power_kwc, panel_count, warranty_years,
    is_active, is_featured, version)
VALUES
('PNP-400W-BALCON', 'kit-plug-play-400w-balcon',
    'Kit Solaire Balcon 400 Wc Plug & Play',
    'Kit solaire plug & play pour balcon ou terrasse. Branchez sur une prise Schuko et produisez votre électricité immédiatement.',
    'Ce micro-kit solaire 400 Wc est la solution idéale pour les appartements et maisons sans possibilité d''installation en toiture. Livré avec 2 panneaux LONGi 200 Wc, un micro-onduleur APS, un câble de 5m et les fixations pour balcon/terrasse. Aucune déclaration obligatoire pour < 3 kWc.',
    (SELECT id FROM categories WHERE slug='plug-and-play'),
    (SELECT id FROM brands WHERE slug='longi'),
    'solar_kit', 'plug_and_play', 'single_phase', 0.40, 2, 10,
    true, true, 0),

('PNP-800W-TERRASSE', 'kit-plug-play-800w-terrasse',
    'Kit Solaire Terrasse 800 Wc Plug & Play',
    'Kit puissant 800 Wc pour terrasse ou jardin. Micro-onduleurs redondants pour maximiser la production.',
    'La version premium du kit balcon, avec 4 panneaux LONGi 200 Wc et 2 micro-onduleurs indépendants. La redondance des micro-onduleurs garantit que la panne d''un seul ne coupe pas toute la production. Production annuelle estimée : 700 à 900 kWh selon l''exposition.',
    (SELECT id FROM categories WHERE slug='plug-and-play'),
    (SELECT id FROM brands WHERE slug='longi'),
    'solar_kit', 'plug_and_play', 'single_phase', 0.80, 4, 10,
    true, false, 0);

-- ── Products — Accessoires ────────────────────────────────────
INSERT INTO products (sku, slug, name, short_description, long_description, category_id,
    product_type, warranty_years, is_active, is_featured, version)
VALUES
('ACC-CABLE-DC-10M', 'cable-solaire-dc-10m',
    'Câble Solaire DC 10m (6mm²)',
    'Câble solaire DC double isolation 6mm², résistant aux UV, homologué EN 50618. Longueur 10m.',
    'Câble solaire professionnel pour installation en extérieur. Double isolation XLPE résistante aux UV, à l''humidité et aux températures extrêmes (-40°C à +90°C). Connecteurs MC4 compatibles inclus. Certifié TÜV.',
    (SELECT id FROM categories WHERE slug='accessoires'),
    'accessory', 5, true, false, 0),

('ACC-COFFRET-DC', 'coffret-protection-dc',
    'Coffret de Protection DC avec Parafoudre',
    'Coffret de protection DC avec parafoudre type 2, fusibles et sectionneur. Pour installations jusqu''à 15 kWc.',
    'Ce coffret de protection DC intègre tous les éléments de sécurité obligatoires : fusibles 15A par string, sectionneur DC, parafoudre type 2 (40kA) et indicateur de défaut. Indice IP65. Conforme aux normes NF C 15-100 et IEC 62548.',
    (SELECT id FROM categories WHERE slug='accessoires'),
    'accessory', 5, true, false, 0),

('ACC-MONITORING', 'boitier-monitoring-wifi',
    'Boîtier Monitoring WiFi Universel',
    'Boîtier de monitoring compatible avec tous les onduleurs. Suivi de production en temps réel sur smartphone.',
    'Ce boîtier monitoring universel se connecte via RS485 ou Modbus à votre onduleur et transmet les données en temps réel via WiFi. Compatible avec l''application SolarTech disponible sur iOS et Android. Historique illimité, alertes personnalisables, export CSV.',
    (SELECT id FROM categories WHERE slug='accessoires'),
    'accessory', 2, true, false, 0);

-- ── Product Variants ─────────────────────────────────────────
-- Kit 3kWc
INSERT INTO product_variants (product_id, reference, label, price_ht, price_ttc, currency, is_default, is_active, version)
VALUES
((SELECT id FROM products WHERE sku='KIT-3KW-MONO'), 'KIT-3KW-MONO-STD', 'Standard — Pose incluse', 4800.00, 5760.00, 'EUR', true, true, 0),
((SELECT id FROM products WHERE sku='KIT-3KW-MONO'), 'KIT-3KW-MONO-FOUR', 'Fourniture seule', 3200.00, 3840.00, 'EUR', false, true, 0);

-- Kit 6kWc
INSERT INTO product_variants (product_id, reference, label, price_ht, price_ttc, currency, is_default, is_active, version)
VALUES
((SELECT id FROM products WHERE sku='KIT-6KW-TRI'), 'KIT-6KW-TRI-STD', 'Standard — Pose incluse', 8500.00, 10200.00, 'EUR', true, true, 0),
((SELECT id FROM products WHERE sku='KIT-6KW-TRI'), 'KIT-6KW-TRI-FOUR', 'Fourniture seule', 5800.00, 6960.00, 'EUR', false, true, 0);

-- Kit 9kWc
INSERT INTO product_variants (product_id, reference, label, price_ht, price_ttc, currency, is_default, is_active, version)
VALUES
((SELECT id FROM products WHERE sku='KIT-9KW-PRO'), 'KIT-9KW-PRO-STD', 'Standard — Pose incluse', 13500.00, 16200.00, 'EUR', true, true, 0),
((SELECT id FROM products WHERE sku='KIT-9KW-PRO'), 'KIT-9KW-PRO-FOUR', 'Fourniture seule', 9200.00, 11040.00, 'EUR', false, true, 0);

-- Kit Off-Grid 5kWc
INSERT INTO product_variants (product_id, reference, label, price_ht, price_ttc, currency, is_default, is_active, version)
VALUES
((SELECT id FROM products WHERE sku='KIT-OFFGRID-5KW'), 'KIT-OG-STD', 'Complet avec batterie 10 kWh', 12800.00, 15360.00, 'EUR', true, true, 0),
((SELECT id FROM products WHERE sku='KIT-OFFGRID-5KW'), 'KIT-OG-BAT5', 'Complet avec batterie 5 kWh', 9500.00, 11400.00, 'EUR', false, true, 0);

-- Batterie BYD 5 kWh
INSERT INTO product_variants (product_id, reference, label, price_ht, price_ttc, currency, is_default, is_active, version)
VALUES
((SELECT id FROM products WHERE sku='BAT-BYD-5KWH'), 'BAT-BYD-5-STD', '5.12 kWh — 1 module', 2800.00, 3360.00, 'EUR', true, true, 0);

-- Batterie BYD 10 kWh
INSERT INTO product_variants (product_id, reference, label, price_ht, price_ttc, currency, is_default, is_active, version)
VALUES
((SELECT id FROM products WHERE sku='BAT-BYD-10KWH'), 'BAT-BYD-10-STD', '10.24 kWh — 2 modules', 5200.00, 6240.00, 'EUR', true, true, 0);

-- Batterie Victron 12 kWh
INSERT INTO product_variants (product_id, reference, label, price_ht, price_ttc, currency, is_default, is_active, version)
VALUES
((SELECT id FROM products WHERE sku='BAT-VICTRON-12KWH'), 'BAT-VIC-12-STD', '12 kWh pack complet', 6900.00, 8280.00, 'EUR', true, true, 0);

-- Onduleur Huawei 5kW
INSERT INTO product_variants (product_id, reference, label, price_ht, price_ttc, currency, is_default, is_active, version)
VALUES
((SELECT id FROM products WHERE sku='OND-HUAWEI-5KW'), 'OND-HW-5K-STD', '5 kW — Pose incluse', 1850.00, 2220.00, 'EUR', true, true, 0),
((SELECT id FROM products WHERE sku='OND-HUAWEI-5KW'), 'OND-HW-5K-FOUR', '5 kW — Fourniture seule', 950.00, 1140.00, 'EUR', false, true, 0);

-- Onduleur Fronius 10kW
INSERT INTO product_variants (product_id, reference, label, price_ht, price_ttc, currency, is_default, is_active, version)
VALUES
((SELECT id FROM products WHERE sku='OND-FRONIUS-10KW'), 'OND-FR-10K-STD', '10 kW — Pose incluse', 3200.00, 3840.00, 'EUR', true, true, 0),
((SELECT id FROM products WHERE sku='OND-FRONIUS-10KW'), 'OND-FR-10K-FOUR', '10 kW — Fourniture seule', 1800.00, 2160.00, 'EUR', false, true, 0);

-- Onduleur Victron 3kVA
INSERT INTO product_variants (product_id, reference, label, price_ht, price_ttc, currency, is_default, is_active, version)
VALUES
((SELECT id FROM products WHERE sku='OND-VICTRON-3KW'), 'OND-VIC-3K-STD', '3000VA — Pose incluse', 1650.00, 1980.00, 'EUR', true, true, 0),
((SELECT id FROM products WHERE sku='OND-VICTRON-3KW'), 'OND-VIC-3K-FOUR', '3000VA — Fourniture seule', 850.00, 1020.00, 'EUR', false, true, 0);

-- Plug & Play 400W
INSERT INTO product_variants (product_id, reference, label, price_ht, price_ttc, currency, is_default, is_active, version)
VALUES
((SELECT id FROM products WHERE sku='PNP-400W-BALCON'), 'PNP-400-STD', '400 Wc — Kit complet', 490.00, 588.00, 'EUR', true, true, 0);

-- Plug & Play 800W
INSERT INTO product_variants (product_id, reference, label, price_ht, price_ttc, currency, is_default, is_active, version)
VALUES
((SELECT id FROM products WHERE sku='PNP-800W-TERRASSE'), 'PNP-800-STD', '800 Wc — Kit complet', 890.00, 1068.00, 'EUR', true, true, 0);

-- Câble DC
INSERT INTO product_variants (product_id, reference, label, price_ht, price_ttc, currency, is_default, is_active, version)
VALUES
((SELECT id FROM products WHERE sku='ACC-CABLE-DC-10M'), 'ACC-CABLE-10-STD', '10m — 6mm²', 45.00, 54.00, 'EUR', true, true, 0),
((SELECT id FROM products WHERE sku='ACC-CABLE-DC-10M'), 'ACC-CABLE-25-STD', '25m — 6mm²', 95.00, 114.00, 'EUR', false, true, 0);

-- Coffret DC
INSERT INTO product_variants (product_id, reference, label, price_ht, price_ttc, currency, is_default, is_active, version)
VALUES
((SELECT id FROM products WHERE sku='ACC-COFFRET-DC'), 'ACC-COFF-STD', '2 strings — jusqu''à 10 kWc', 185.00, 222.00, 'EUR', true, true, 0),
((SELECT id FROM products WHERE sku='ACC-COFFRET-DC'), 'ACC-COFF-PRO', '4 strings — jusqu''à 15 kWc', 285.00, 342.00, 'EUR', false, true, 0);

-- Monitoring
INSERT INTO product_variants (product_id, reference, label, price_ht, price_ttc, currency, is_default, is_active, version)
VALUES
((SELECT id FROM products WHERE sku='ACC-MONITORING'), 'ACC-MON-STD', 'Boîtier WiFi + abonnement 1 an', 129.00, 154.80, 'EUR', true, true, 0);

-- ── Product Images (Unsplash / Pexels public images) ─────────
INSERT INTO product_images (product_id, url, alt_text, position, is_primary) VALUES
-- Kit 3kWc
((SELECT id FROM products WHERE sku='KIT-3KW-MONO'), 'https://images.pexels.com/photos/9875414/pexels-photo-9875414.jpeg', 'Kit solaire 3kWc sur toiture résidentielle', 0, true),
((SELECT id FROM products WHERE sku='KIT-3KW-MONO'), 'https://images.pexels.com/photos/9875417/pexels-photo-9875417.jpeg', 'Panneaux monocristallins vue de près', 1, false),

-- Kit 6kWc
((SELECT id FROM products WHERE sku='KIT-6KW-TRI'), 'https://images.pexels.com/photos/9875441/pexels-photo-9875441.jpeg', 'Kit 6kWc installation triphasée', 0, true),

-- Kit 9kWc Pro
((SELECT id FROM products WHERE sku='KIT-9KW-PRO'), 'https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg', 'Kit professionnel 9kWc grande toiture', 0, true),

-- Kit Off-Grid
((SELECT id FROM products WHERE sku='KIT-OFFGRID-5KW'), 'https://images.pexels.com/photos/9893729/pexels-photo-9893729.jpeg', 'Installation off-grid autonome', 0, true),

-- Batterie BYD 5kWh
((SELECT id FROM products WHERE sku='BAT-BYD-5KWH'), 'https://images.pexels.com/photos/9875447/pexels-photo-9875447.jpeg', 'Batterie BYD 5kWh montage mural', 0, true),

-- Batterie BYD 10kWh
((SELECT id FROM products WHERE sku='BAT-BYD-10KWH'), 'https://images.pexels.com/photos/9875447/pexels-photo-9875447.jpeg', 'Batterie BYD 10kWh double module', 0, true),

-- Onduleur Huawei
((SELECT id FROM products WHERE sku='OND-HUAWEI-5KW'), 'https://images.pexels.com/photos/9875432/pexels-photo-9875432.jpeg', 'Onduleur Huawei SUN2000 5kW', 0, true),

-- Onduleur Fronius
((SELECT id FROM products WHERE sku='OND-FRONIUS-10KW'), 'https://images.pexels.com/photos/9875432/pexels-photo-9875432.jpeg', 'Onduleur Fronius Symo 10kW', 0, true),

-- Plug & Play 400W
((SELECT id FROM products WHERE sku='PNP-400W-BALCON'), 'https://images.pexels.com/photos/9875441/pexels-photo-9875441.jpeg', 'Kit balcon plug and play 400W', 0, true),

-- Plug & Play 800W
((SELECT id FROM products WHERE sku='PNP-800W-TERRASSE'), 'https://images.pexels.com/photos/9875414/pexels-photo-9875414.jpeg', 'Kit terrasse plug and play 800W', 0, true),

-- Accessoires
((SELECT id FROM products WHERE sku='ACC-MONITORING'), 'https://images.pexels.com/photos/9875432/pexels-photo-9875432.jpeg', 'Boîtier monitoring WiFi', 0, true);

-- ── Stock Items ───────────────────────────────────────────────
INSERT INTO stock_items (variant_id, quantity, reserved_quantity, low_stock_threshold, allow_backorder)
SELECT id,
    CASE WHEN reference LIKE '%FOUR%' OR reference LIKE '%STD%' THEN
        (FLOOR(RANDOM()*40+10))::INT
    ELSE 5 END,
    0, 3, false
FROM product_variants;

-- ── Addresses for demo clients ────────────────────────────────
INSERT INTO addresses (user_id, type, first_name, last_name, address_line1, city, postal_code, country, is_default) VALUES
((SELECT id FROM users WHERE email='thomas.martin@gmail.com'),  'shipping', 'Thomas', 'Martin',  '12 rue des Lilas',         'Lyon',       '69003', 'FR', true),
((SELECT id FROM users WHERE email='sophie.bernard@gmail.com'), 'shipping', 'Sophie', 'Bernard', '8 avenue Jean Jaurès',     'Bordeaux',   '33000', 'FR', true),
((SELECT id FROM users WHERE email='pierre.leroy@hotmail.fr'),  'shipping', 'Pierre', 'Leroy',   '3 chemin du Moulin',       'Toulouse',   '31000', 'FR', true),
((SELECT id FROM users WHERE email='camille.petit@orange.fr'),  'shipping', 'Camille','Petit',   '25 boulevard Haussmann',   'Paris',      '75009', 'FR', true),
((SELECT id FROM users WHERE email='julien.moreau@sfr.fr'),     'shipping', 'Julien', 'Moreau',  '7 rue de la République',   'Marseille',  '13001', 'FR', true),
((SELECT id FROM users WHERE email='entreprise.verte@pro.fr'),  'shipping', 'Éco',    'Solutions','45 zone industrielle Nord','Nantes',     '44000', 'FR', true);

-- ── Orders ────────────────────────────────────────────────────
INSERT INTO orders (reference, user_id, status, currency, subtotal_ht, tax_amount, shipping_amount,
    discount_amount, total_ttc, shipping_method,
    shipping_first_name, shipping_last_name, shipping_address, shipping_city, shipping_postal_code, shipping_country,
    version, created_at)
VALUES
('CMD-202501-1001',
    (SELECT id FROM users WHERE email='thomas.martin@gmail.com'),
    'delivered', 'EUR', 4800.00, 960.00, 0.00, 0.00, 5760.00, 'Livraison + installation',
    'Thomas','Martin','12 rue des Lilas','Lyon','69003','FR', 0,
    NOW() - INTERVAL '45 days'),

('CMD-202502-1002',
    (SELECT id FROM users WHERE email='sophie.bernard@gmail.com'),
    'shipped', 'EUR', 8500.00, 1700.00, 0.00, 0.00, 10200.00, 'Livraison + installation',
    'Sophie','Bernard','8 avenue Jean Jaurès','Bordeaux','33000','FR', 0,
    NOW() - INTERVAL '12 days'),

('CMD-202503-1003',
    (SELECT id FROM users WHERE email='pierre.leroy@hotmail.fr'),
    'processing', 'EUR', 3200.00, 640.00, 0.00, 0.00, 3840.00, 'Livraison standard',
    'Pierre','Leroy','3 chemin du Moulin','Toulouse','31000','FR', 0,
    NOW() - INTERVAL '5 days'),

('CMD-202503-1004',
    (SELECT id FROM users WHERE email='camille.petit@orange.fr'),
    'confirmed', 'EUR', 490.00, 98.00, 9.90, 0.00, 597.90, 'Colissimo',
    'Camille','Petit','25 boulevard Haussmann','Paris','75009','FR', 0,
    NOW() - INTERVAL '2 days'),

('CMD-202503-1005',
    (SELECT id FROM users WHERE email='julien.moreau@sfr.fr'),
    'pending', 'EUR', 12800.00, 2560.00, 0.00, 500.00, 14860.00, 'Livraison + installation',
    'Julien','Moreau','7 rue de la République','Marseille','13001','FR', 0,
    NOW() - INTERVAL '1 day'),

('CMD-202503-1006',
    (SELECT id FROM users WHERE email='entreprise.verte@pro.fr'),
    'confirmed', 'EUR', 13500.00, 2700.00, 0.00, 1000.00, 15200.00, 'Livraison + installation',
    'Éco','Solutions','45 zone industrielle Nord','Nantes','44000','FR', 0,
    NOW()),

('CMD-202501-0099',
    (SELECT id FROM users WHERE email='thomas.martin@gmail.com'),
    'cancelled', 'EUR', 890.00, 178.00, 9.90, 0.00, 1077.90, 'Colissimo',
    'Thomas','Martin','12 rue des Lilas','Lyon','69003','FR', 0,
    NOW() - INTERVAL '60 days'),

('CMD-202412-0055',
    (SELECT id FROM users WHERE email='sophie.bernard@gmail.com'),
    'delivered', 'EUR', 2800.00, 560.00, 0.00, 0.00, 3360.00, 'Livraison standard',
    'Sophie','Bernard','8 avenue Jean Jaurès','Bordeaux','33000','FR', 0,
    NOW() - INTERVAL '90 days');

-- ── Order Items ───────────────────────────────────────────────
INSERT INTO order_items (order_id, product_variant_id, product_name, variant_label, product_snapshot, quantity, unit_price_ht, unit_price_ttc)
VALUES
-- CMD-202501-1001 : Kit 3kWc
((SELECT id FROM orders WHERE reference='CMD-202501-1001'),
 (SELECT id FROM product_variants WHERE reference='KIT-3KW-MONO-STD'),
 'Kit Solaire 3 kWc — Autoconsommation', 'Standard — Pose incluse', '{}', 1, 4800.00, 5760.00),

-- CMD-202502-1002 : Kit 6kWc
((SELECT id FROM orders WHERE reference='CMD-202502-1002'),
 (SELECT id FROM product_variants WHERE reference='KIT-6KW-TRI-STD'),
 'Kit Solaire 6 kWc Triphasé', 'Standard — Pose incluse', '{}', 1, 8500.00, 10200.00),

-- CMD-202503-1003 : Kit 3kWc fourniture seule
((SELECT id FROM orders WHERE reference='CMD-202503-1003'),
 (SELECT id FROM product_variants WHERE reference='KIT-3KW-MONO-FOUR'),
 'Kit Solaire 3 kWc — Autoconsommation', 'Fourniture seule', '{}', 1, 3200.00, 3840.00),

-- CMD-202503-1004 : Plug & Play 400W
((SELECT id FROM orders WHERE reference='CMD-202503-1004'),
 (SELECT id FROM product_variants WHERE reference='PNP-400-STD'),
 'Kit Solaire Balcon 400 Wc Plug & Play', '400 Wc — Kit complet', '{}', 1, 490.00, 588.00),

-- CMD-202503-1005 : Kit Off-Grid + câble
((SELECT id FROM orders WHERE reference='CMD-202503-1005'),
 (SELECT id FROM product_variants WHERE reference='KIT-OG-STD'),
 'Kit Solaire Off-Grid 5 kWc + Batterie', 'Complet avec batterie 10 kWh', '{}', 1, 12800.00, 15360.00),

-- CMD-202503-1006 : Kit 9kWc Pro
((SELECT id FROM orders WHERE reference='CMD-202503-1006'),
 (SELECT id FROM product_variants WHERE reference='KIT-9KW-PRO-STD'),
 'Kit Solaire 9 kWc Professionnel', 'Standard — Pose incluse', '{}', 1, 13500.00, 16200.00),

-- CMD-202501-0099 : Plug & Play 800W (annulée)
((SELECT id FROM orders WHERE reference='CMD-202501-0099'),
 (SELECT id FROM product_variants WHERE reference='PNP-800-STD'),
 'Kit Solaire Terrasse 800 Wc Plug & Play', '800 Wc — Kit complet', '{}', 1, 890.00, 1068.00),

-- CMD-202412-0055 : Batterie BYD 5kWh
((SELECT id FROM orders WHERE reference='CMD-202412-0055'),
 (SELECT id FROM product_variants WHERE reference='BAT-BYD-5-STD'),
 'Batterie BYD Battery-Box 5.12 kWh', '5.12 kWh — 1 module', '{}', 1, 2800.00, 3360.00);

-- ── Quotes ────────────────────────────────────────────────────
INSERT INTO quotes (reference, user_id, status, first_name, last_name, email, phone, company,
    installation_type, consumption_kwh, location, budget, message, admin_notes, created_at)
VALUES
('QT-202503-4421', NULL, 'new',
    'Alexandre', 'Dupont', 'alexandre.dupont@gmail.com', '+33 6 78 90 12 34', NULL,
    'self_consumption', 4200.00, 'Montpellier (34)', 8000.00,
    'Bonjour, je souhaite installer des panneaux solaires sur ma maison. Surface toiture disponible : environ 30m². Orientation Sud. Je consomme environ 4 200 kWh/an. Budget autour de 8 000€. Pouvez-vous me proposer une solution ?',
    NULL, NOW() - INTERVAL '1 hour'),

('QT-202503-3892', (SELECT id FROM users WHERE email='thomas.martin@gmail.com'), 'in_review',
    'Thomas', 'Martin', 'thomas.martin@gmail.com', '+33 6 12 34 56 78', NULL,
    'self_consumption', 5500.00, 'Lyon (69)', 12000.00,
    'Suite à ma commande de kit 3kWc, je souhaite ajouter une batterie de stockage pour maximiser mon autoconsommation. Quelle batterie recommandez-vous pour mon installation existante ?',
    'Client existant — vérifier compatibilité avec son onduleur Fronius Primo 3.0. Proposer BYD 5 ou 10 kWh.', NOW() - INTERVAL '3 days'),

('QT-202503-3155', NULL, 'sent',
    'Marie', 'Fontaine', 'marie.fontaine@hotmail.fr', '+33 6 45 12 78 90', 'Gîte Les Pins',
    'off_grid', 1800.00, 'Alpes-de-Haute-Provence (04)', 15000.00,
    'Nous gérons un gîte rural non raccordé au réseau. Nous avons besoin d''une installation autonome complète. Consommation estimée : 1 800 kWh/an. Site ensoleillé (> 1 700 h/an). Budget maximum 15 000€.',
    'Devis envoyé le 12/03 : Kit off-grid 5kWc + batterie Victron 12kWh. Attente retour client.', NOW() - INTERVAL '8 days'),

('QT-202503-2744', NULL, 'accepted',
    'Christophe', 'Vidal', 'christophe.vidal@orange.fr', '+33 6 11 22 33 44', 'Vidal SARL',
    'self_consumption', 18000.00, 'Marseille (13)', 35000.00,
    'Notre entrepôt de 800m² consomme 18 000 kWh/an. Toiture bac acier, orientation Sud-Est. Nous souhaitons réduire notre facture EDF de 60%. Pouvez-vous nous proposer une installation avec revente du surplus ?',
    'Devis accepté. Installation prévue le 28/03. Acompte reçu.', NOW() - INTERVAL '15 days'),

('QT-202502-8821', NULL, 'converted',
    'Émilie', 'Laurent', 'emilie.laurent@gmail.com', '+33 6 55 44 33 22', NULL,
    'plug_and_play', 2400.00, 'Paris (75)', 1000.00,
    'Je vis en appartement au 3ème étage avec balcon orienté Sud. Je consomme environ 2 400 kWh/an. Intéressée par un kit plug & play pour mon balcon.',
    'Converti en commande CMD-202503-1004. Cliente satisfaite.', NOW() - INTERVAL '30 days'),

('QT-202502-7612', NULL, 'rejected',
    'Robert', 'Gauthier', 'robert.gauthier@sfr.fr', '+33 6 99 88 77 66', NULL,
    'self_consumption', 3000.00, 'Normandie (76)', 5000.00,
    'Maison avec toiture ombragée par des arbres. Est-ce quand même rentable ?',
    'Site non adapté : ombrage trop important, rentabilité insuffisante. Conseillé de revenir après élagage.', NOW() - INTERVAL '20 days'),

('QT-202503-5103', NULL, 'new',
    'Nathalie', 'Chevalier', 'nathalie.chevalier@gmail.com', '+33 6 77 88 99 00', 'École Primaire Les Tournesols',
    'self_consumption', 22000.00, 'Toulouse (31)', 40000.00,
    'Notre école publique souhaite équiper sa toiture de 600m² en panneaux solaires dans le cadre d''un projet pédagogique et écologique. Budget voté par la mairie : 40 000€. Pouvez-vous nous proposer une solution ?',
    NULL, NOW() - INTERVAL '30 minutes'),

('QT-202503-4897', (SELECT id FROM users WHERE email='julien.moreau@sfr.fr'), 'in_review',
    'Julien', 'Moreau', 'julien.moreau@sfr.fr', '+33 6 56 78 90 12', NULL,
    'off_grid', 3500.00, 'Marseille (13)', 20000.00,
    'Je souhaite installer un système autonome pour ma résidence secondaire en Provence. Pas de réseau EDF sur le terrain. Besoin de couvrir : pompe à eau, frigo, éclairage, VMC. Séjours de 2 à 3 semaines en été.',
    'En cours d''analyse. Probablement kit off-grid 5kWc avec batterie 12kWh.', NOW() - INTERVAL '2 days'),

('QT-202503-4201', NULL, 'sent',
    'Patrick', 'Rousseau', 'patrick.rousseau@pro.fr', '+33 1 44 55 66 88', 'Rousseau & Associés Architectes',
    'self_consumption', 45000.00, 'La Défense (92)', 80000.00,
    'Cabinet d''architectes cherche à certifier BBC son immeuble de bureaux (1 200m²). Nous souhaitons une étude complète : panneaux en toiture + ombrières parking. Consommation annuelle : 45 000 kWh. Budget : 80 000€.',
    'Étude technique envoyée. Réunion de présentation prévue.', NOW() - INTERVAL '6 days'),

('QT-202503-3300', NULL, 'new',
    'Isabelle', 'Mercier', 'isabelle.mercier@gmail.com', '+33 6 22 33 44 55', NULL,
    'mobility', 2800.00, 'Bordeaux (33)', 6000.00,
    'Je possède un camping-car et je cherche à être autonome en énergie pour de longs voyages. J''ai de la place pour 4 panneaux sur le toit. Besoin : frigo 12V, éclairage LED, TV, chargeur USB.',
    NULL, NOW() - INTERVAL '4 hours');

-- ── Quote Items ───────────────────────────────────────────────
INSERT INTO quote_items (quote_id, product_id, variant_id, product_name, variant_label, quantity, unit_price_ht) VALUES
-- Devis Thomas (in_review) : batterie BYD 10kWh
((SELECT id FROM quotes WHERE reference='QT-202503-3892'),
 (SELECT id FROM products WHERE sku='BAT-BYD-10KWH'),
 (SELECT id FROM product_variants WHERE reference='BAT-BYD-10-STD'),
 'Batterie BYD Battery-Box 10.24 kWh', '10.24 kWh — 2 modules', 1, 5200.00),

-- Devis gîte (sent) : kit off-grid
((SELECT id FROM quotes WHERE reference='QT-202503-3155'),
 (SELECT id FROM products WHERE sku='KIT-OFFGRID-5KW'),
 (SELECT id FROM product_variants WHERE reference='KIT-OG-STD'),
 'Kit Solaire Off-Grid 5 kWc + Batterie', 'Complet avec batterie 10 kWh', 1, 12800.00),

-- Devis Vidal SARL (accepted) : kit 9kWc × 2
((SELECT id FROM quotes WHERE reference='QT-202503-2744'),
 (SELECT id FROM products WHERE sku='KIT-9KW-PRO'),
 (SELECT id FROM product_variants WHERE reference='KIT-9KW-PRO-STD'),
 'Kit Solaire 9 kWc Professionnel', 'Standard — Pose incluse', 2, 13500.00),

-- Devis balcon (converted) : plug & play 400W
((SELECT id FROM quotes WHERE reference='QT-202502-8821'),
 (SELECT id FROM products WHERE sku='PNP-400W-BALCON'),
 (SELECT id FROM product_variants WHERE reference='PNP-400-STD'),
 'Kit Solaire Balcon 400 Wc Plug & Play', '400 Wc — Kit complet', 1, 490.00),

-- Devis Julien (in_review) : kit off-grid
((SELECT id FROM quotes WHERE reference='QT-202503-4897'),
 (SELECT id FROM products WHERE sku='KIT-OFFGRID-5KW'),
 (SELECT id FROM product_variants WHERE reference='KIT-OG-BAT5'),
 'Kit Solaire Off-Grid 5 kWc + Batterie', 'Complet avec batterie 5 kWh', 1, 9500.00);
