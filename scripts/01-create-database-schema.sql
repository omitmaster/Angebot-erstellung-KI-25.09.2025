-- Angebots- & Prozessmeister Database Schema
-- Based on German specification requirements

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users and Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'vertrieb', 'projektleitung', 'bauleitung')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    source VARCHAR(100),
    tags TEXT[],
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Intake Management
CREATE TABLE intakes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('email', 'whatsapp', 'phone', 'web')),
    email_raw TEXT,
    attachments JSONB DEFAULT '[]',
    transcript TEXT,
    branch VARCHAR(100),
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'analyzed', 'processed', 'archived')),
    customer_id UUID REFERENCES customers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    title VARCHAR(255) NOT NULL,
    site_address TEXT,
    status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'quoted', 'contracted', 'in_progress', 'completed', 'cancelled')),
    clickup_id VARCHAR(100),
    hubspot_id VARCHAR(100),
    folder_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price Book Items
CREATE TABLE pricebook_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    default_qty_formula TEXT,
    base_minutes DECIMAL(10,2) NOT NULL,
    base_material_cost DECIMAL(10,2) NOT NULL,
    markup_material_pct DECIMAL(5,2) DEFAULT 30.00,
    overhead_pct DECIMAL(5,2) DEFAULT 10.00,
    region_factor DECIMAL(5,2) DEFAULT 1.00,
    variant_group VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LV Templates
CREATE TABLE lv_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    json_schema JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offers
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id),
    version INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'declined')),
    subtotal_labor DECIMAL(12,2) DEFAULT 0,
    subtotal_material DECIMAL(12,2) DEFAULT 0,
    risk_pct DECIMAL(5,2) DEFAULT 15.00,
    discount_pct DECIMAL(5,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'EUR',
    pdf_url TEXT,
    gaeb_url TEXT,
    excel_url TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    decided_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offer Positions
CREATE TABLE offer_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    item_ref UUID REFERENCES pricebook_items(id),
    description TEXT NOT NULL,
    qty DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    minutes DECIMAL(10,2) NOT NULL,
    labor_rate DECIMAL(8,2) DEFAULT 84.00,
    material_cost DECIMAL(10,2) NOT NULL,
    risk_pct DECIMAL(5,2) DEFAULT 15.00,
    margin_pct DECIMAL(5,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follow-ups
CREATE TABLE followups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_id UUID NOT NULL REFERENCES offers(id),
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('email', 'sms')),
    step_no INTEGER NOT NULL,
    due_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'replied', 'skipped')),
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contracts
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_id UUID NOT NULL REFERENCES offers(id),
    boldsign_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'cancelled')),
    signed_doc_url TEXT,
    signed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materials
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id),
    supplier VARCHAR(255),
    sku VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    qty DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    price_estimate DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'ordered', 'delivered')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id),
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp')),
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('in', 'out')),
    text TEXT,
    media_url TEXT,
    transcript TEXT,
    actor VARCHAR(50) NOT NULL CHECK (actor IN ('user', 'bot')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id),
    folder VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    kind VARCHAR(50) CHECK (kind IN ('pdf', 'excel', 'gaeb', 'image', 'audio')),
    size_bytes BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    labor_rate_eur_per_hour DECIMAL(8,2) DEFAULT 84.00,
    default_risk_pct DECIMAL(5,2) DEFAULT 15.00,
    default_material_markup_pct DECIMAL(5,2) DEFAULT 30.00,
    default_overhead_pct DECIMAL(5,2) DEFAULT 10.00,
    region_factor JSONB DEFAULT '{"hamburg": 1.00, "berlin": 0.96, "muenchen": 1.12}',
    sms_sender_id VARCHAR(50),
    email_from VARCHAR(255),
    whatsapp_number VARCHAR(50),
    feature_clickup BOOLEAN DEFAULT false,
    feature_hubspot BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_intakes_status ON intakes(status);
CREATE INDEX idx_intakes_channel ON intakes(channel);
CREATE INDEX idx_projects_customer_id ON projects(customer_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_offers_project_id ON offers(project_id);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_offer_positions_offer_id ON offer_positions(offer_id);
CREATE INDEX idx_followups_offer_id ON followups(offer_id);
CREATE INDEX idx_followups_due_at ON followups(due_at);
CREATE INDEX idx_materials_project_id ON materials(project_id);
CREATE INDEX idx_messages_project_id ON messages(project_id);
CREATE INDEX idx_files_project_id ON files(project_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_intakes_updated_at BEFORE UPDATE ON intakes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricebook_items_updated_at BEFORE UPDATE ON pricebook_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lv_templates_updated_at BEFORE UPDATE ON lv_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offer_positions_updated_at BEFORE UPDATE ON offer_positions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_followups_updated_at BEFORE UPDATE ON followups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
