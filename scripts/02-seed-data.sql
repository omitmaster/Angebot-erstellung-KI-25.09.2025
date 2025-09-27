-- Seed data for Angebots- & Prozessmeister
-- Demo data as specified in German requirements

-- Insert default admin user
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@handwerk.de', '$2b$10$example_hash', 'System Administrator', 'admin'),
('hans@handwerk.de', '$2b$10$example_hash', 'Hans Müller', 'vertrieb'),
('petra@handwerk.de', '$2b$10$example_hash', 'Petra Schmidt', 'projektleitung');

-- Insert pricebook items (15 items as specified)
INSERT INTO pricebook_items (branch, code, title, unit, base_minutes, base_material_cost, markup_material_pct, overhead_pct, region_factor, is_active) VALUES
-- Maler
('Maler', 'MAL001', 'Wandfläche streichen (2 Anstriche)', 'm²', 15.0, 3.50, 30.0, 10.0, 1.0, true),
('Maler', 'MAL002', 'Decke streichen (2 Anstriche)', 'm²', 18.0, 3.80, 30.0, 10.0, 1.0, true),
('Maler', 'MAL003', 'Tapezieren Raufaser', 'm²', 25.0, 2.20, 30.0, 10.0, 1.0, true),

-- Boden
('Boden', 'BOD001', 'Laminat verlegen inkl. Trittschalldämmung', 'm²', 35.0, 18.50, 30.0, 10.0, 1.0, true),
('Boden', 'BOD002', 'Fliesen verlegen 30x30cm', 'm²', 45.0, 25.00, 30.0, 10.0, 1.0, true),
('Boden', 'BOD003', 'Parkett schleifen und versiegeln', 'm²', 60.0, 8.50, 30.0, 10.0, 1.0, true),

-- Fassade
('Fassade', 'FAS001', 'WDVS 14cm Dämmung inkl. Putz', 'm²', 120.0, 45.00, 30.0, 10.0, 1.0, true),
('Fassade', 'FAS002', 'Fassadenanstrich 2-fach', 'm²', 25.0, 4.20, 30.0, 10.0, 1.0, true),
('Fassade', 'FAS003', 'Gerüst stellen und abbauen', 'm²', 8.0, 2.80, 30.0, 10.0, 1.0, true),

-- Elektrik
('Elektrik', 'ELE001', 'Steckdose setzen inkl. Zuleitung', 'Stk', 45.0, 12.50, 30.0, 10.0, 1.0, true),
('Elektrik', 'ELE002', 'Lichtschalter setzen inkl. Zuleitung', 'Stk', 40.0, 8.50, 30.0, 10.0, 1.0, true),

-- Sanitär
('Sanitär', 'SAN001', 'WC komplett inkl. Montage', 'Stk', 180.0, 280.00, 30.0, 10.0, 1.0, true),
('Sanitär', 'SAN002', 'Waschtisch inkl. Armatur montieren', 'Stk', 120.0, 350.00, 30.0, 10.0, 1.0, true),

-- Tischler
('Tischler', 'TIS001', 'Innentür inkl. Zarge und Beschlag', 'Stk', 240.0, 180.00, 30.0, 10.0, 1.0, true),
('Tischler', 'TIS002', 'Einbauschrank nach Maß', 'm²', 180.0, 120.00, 30.0, 10.0, 1.0, true);

-- Insert LV template for WDVS (as specified)
INSERT INTO lv_templates (name, branch, json_schema) VALUES
('WDVS Standard', 'Fassade', '{
  "positions": [
    {
      "code": "01.001",
      "title": "Gerüst stellen",
      "unit": "m²",
      "description": "Arbeitsgerüst bis 7m Höhe"
    },
    {
      "code": "02.001", 
      "title": "Untergrund vorbereiten",
      "unit": "m²",
      "description": "Fassade reinigen und grundieren"
    },
    {
      "code": "03.001",
      "title": "WDVS kleben und dübeln", 
      "unit": "m²",
      "description": "14cm EPS-Dämmung vollflächig verkleben"
    },
    {
      "code": "04.001",
      "title": "Armierungsschicht",
      "unit": "m²", 
      "description": "Armierungsmörtel mit Gewebe"
    },
    {
      "code": "05.001",
      "title": "Oberputz auftragen",
      "unit": "m²",
      "description": "Mineralischer Oberputz 2mm"
    }
  ]
}');

-- Insert default settings
INSERT INTO settings (
  labor_rate_eur_per_hour,
  default_risk_pct,
  default_material_markup_pct, 
  default_overhead_pct,
  region_factor,
  email_from,
  feature_clickup,
  feature_hubspot
) VALUES (
  84.00,
  15.00,
  30.00,
  10.00,
  '{"hamburg": 1.00, "berlin": 0.96, "muenchen": 1.12}',
  'angebote@handwerk.de',
  false,
  false
);

-- Insert sample customers
INSERT INTO customers (name, person, email, phone, address, source, created_by) VALUES
('Müller Bau GmbH', 'Thomas Müller', 'info@mueller-bau.de', '+49 40 12345678', 'Musterstraße 123, 20095 Hamburg', 'Website', (SELECT id FROM users WHERE email = 'hans@handwerk.de')),
('Schmidt Immobilien', 'Petra Schmidt', 'schmidt@immobilien-gmbh.de', '+49 30 87654321', 'Beispielweg 456, 10115 Berlin', 'Empfehlung', (SELECT id FROM users WHERE email = 'hans@handwerk.de')),
('Familie Weber', 'Klaus Weber', 'k.weber@email.de', '+49 89 11223344', 'Teststraße 789, 80331 München', 'Telefon', (SELECT id FROM users WHERE email = 'hans@handwerk.de'));

-- Insert sample intakes
INSERT INTO intakes (channel, email_raw, transcript, branch, status, customer_id) VALUES
('email', 'Guten Tag, wir benötigen ein Angebot für die Sanierung unseres Daches. Das Haus ist ca. 150m² Grundfläche...', null, 'Dach', 'new', (SELECT id FROM customers WHERE name = 'Müller Bau GmbH')),
('whatsapp', null, 'Hallo, ich brauche ein Angebot für mein Badezimmer. Es soll komplett renoviert werden, neue Fliesen, neue Sanitärobjekte...', 'Sanitär', 'analyzed', (SELECT id FROM customers WHERE name = 'Familie Weber')),
('email', 'Anbei finden Sie das Leistungsverzeichnis für unser neues Bürogebäude. Bitte erstellen Sie uns ein Angebot...', null, 'Komplett', 'processed', (SELECT id FROM customers WHERE name = 'Schmidt Immobilien'));

-- Insert sample projects
INSERT INTO projects (customer_id, title, site_address, status) VALUES
((SELECT id FROM customers WHERE name = 'Müller Bau GmbH'), 'Dachsanierung Einfamilienhaus', 'Musterstraße 123, 20095 Hamburg', 'planning'),
((SELECT id FROM customers WHERE name = 'Familie Weber'), 'Badezimmer Komplettrenovierung', 'Teststraße 789, 80331 München', 'quoted'),
((SELECT id FROM customers WHERE name = 'Schmidt Immobilien'), 'Bürogebäude Neubau', 'Beispielweg 456, 10115 Berlin', 'contracted');
