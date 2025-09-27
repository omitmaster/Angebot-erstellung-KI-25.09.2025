-- Complete database reset script
-- This will delete ALL data and reset the system to a clean state

-- Disable RLS temporarily for cleanup
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.handwerker_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.kunde_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.offers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.offer_positions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.intakes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.files DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.followups DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pricebook_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lv_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

-- Delete all data from all tables (in correct order to respect foreign keys)
DELETE FROM public.followups;
DELETE FROM public.files;
DELETE FROM public.materials;
DELETE FROM public.messages;
DELETE FROM public.offer_positions;
DELETE FROM public.contracts;
DELETE FROM public.offers;
DELETE FROM public.intakes;
DELETE FROM public.projects;
DELETE FROM public.customers;
DELETE FROM public.handwerker_profiles;
DELETE FROM public.kunde_profiles;
DELETE FROM public.profiles;
DELETE FROM public.pricebook_items;
DELETE FROM public.lv_templates;
DELETE FROM public.settings;
DELETE FROM public.users;

-- Reset sequences
ALTER SEQUENCE IF EXISTS public.followups_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.files_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.materials_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.messages_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.offer_positions_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.contracts_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.offers_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.intakes_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.projects_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.customers_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.handwerker_profiles_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.kunde_profiles_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.profiles_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.pricebook_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.lv_templates_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.settings_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.users_id_seq RESTART WITH 1;

-- Re-enable RLS
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.handwerker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.kunde_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.offer_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pricebook_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lv_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;

-- Create default settings entry for the system
INSERT INTO public.settings (
  id,
  labor_rate_eur_per_hour,
  default_risk_pct,
  default_material_markup_pct,
  default_overhead_pct,
  email_from,
  sms_sender_id,
  whatsapp_number,
  region_factor,
  feature_clickup,
  feature_hubspot,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  45.00,
  5.0,
  15.0,
  10.0,
  'noreply@handwerk-app.de',
  'HandwerkApp',
  '+49123456789',
  '{"default": 1.0, "munich": 1.2, "berlin": 1.15, "hamburg": 1.1}'::jsonb,
  false,
  false,
  NOW(),
  NOW()
);

-- Add some basic pricebook items for common construction work
INSERT INTO public.pricebook_items (
  id,
  code,
  title,
  branch,
  unit,
  base_minutes,
  base_material_cost,
  markup_material_pct,
  overhead_pct,
  region_factor,
  variant_group,
  default_qty_formula,
  is_active,
  created_at,
  updated_at
) VALUES 
(gen_random_uuid(), 'DAC001', 'Dachziegel entfernen', 'Dachdeckerei', 'm²', 15, 0.00, 0.0, 10.0, 1.0, 'demolition', '1', true, NOW(), NOW()),
(gen_random_uuid(), 'DAC002', 'Dachziegel verlegen', 'Dachdeckerei', 'm²', 45, 25.00, 15.0, 10.0, 1.0, 'roofing', '1', true, NOW(), NOW()),
(gen_random_uuid(), 'BAD001', 'Fliesen entfernen', 'Sanitär', 'm²', 20, 0.00, 0.0, 10.0, 1.0, 'demolition', '1', true, NOW(), NOW()),
(gen_random_uuid(), 'BAD002', 'Fliesen verlegen', 'Sanitär', 'm²', 60, 35.00, 15.0, 10.0, 1.0, 'tiling', '1', true, NOW(), NOW()),
(gen_random_uuid(), 'ELE001', 'Steckdose installieren', 'Elektrik', 'Stk', 30, 15.00, 20.0, 10.0, 1.0, 'electrical', '1', true, NOW(), NOW()),
(gen_random_uuid(), 'MAL001', 'Wand streichen', 'Malerei', 'm²', 8, 2.50, 25.0, 10.0, 1.0, 'painting', '1', true, NOW(), NOW());

-- Add basic LV templates
INSERT INTO public.lv_templates (
  id,
  name,
  branch,
  json_schema,
  created_at,
  updated_at
) VALUES 
(gen_random_uuid(), 'Standard Dachsanierung', 'Dachdeckerei', 
 '{"sections": [{"title": "Vorarbeiten", "items": ["Gerüst aufstellen", "Alte Ziegel entfernen"]}, {"title": "Hauptarbeiten", "items": ["Unterspannbahn verlegen", "Neue Ziegel verlegen"]}, {"title": "Nacharbeiten", "items": ["Gerüst abbauen", "Baustelle räumen"]}]}'::jsonb, 
 NOW(), NOW()),
(gen_random_uuid(), 'Standard Badsanierung', 'Sanitär', 
 '{"sections": [{"title": "Vorarbeiten", "items": ["Alte Fliesen entfernen", "Rohre prüfen"]}, {"title": "Hauptarbeiten", "items": ["Neue Fliesen verlegen", "Sanitärobjekte installieren"]}, {"title": "Nacharbeiten", "items": ["Fugen versiegeln", "Endkontrolle"]}]}'::jsonb, 
 NOW(), NOW());

-- Success message
SELECT 'Database successfully reset! All data cleared and system ready for new users.' as status;
