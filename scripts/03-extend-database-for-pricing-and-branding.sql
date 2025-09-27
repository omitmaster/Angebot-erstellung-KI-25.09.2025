-- Erweiterte Datenbankstruktur für Preisdatenbank und Briefkopf-Verwaltung
-- Extension für die KI-basierte Angebotserstellung

-- Tabelle für hochgeladene Angebots-PDFs (Preisdatenbank)
CREATE TABLE offer_history_pdfs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Extrahierte Metadaten
    customer_name VARCHAR(255),
    project_type VARCHAR(100),
    total_amount DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'EUR',
    offer_date DATE,
    
    -- KI-Analyse Ergebnisse
    extracted_positions JSONB DEFAULT '[]', -- Array von Positionen mit Preisen
    ai_analysis_status VARCHAR(50) DEFAULT 'pending' CHECK (ai_analysis_status IN ('pending', 'processing', 'completed', 'failed')),
    ai_analysis_result JSONB DEFAULT '{}',
    
    -- Indexierung für Suche
    search_keywords TEXT[], -- Für schnelle Suche
    branch_tags VARCHAR(100)[], -- Gewerk-Tags
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für Briefkopf-Verwaltung
CREATE TABLE company_branding (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    is_active BOOLEAN DEFAULT false, -- Nur ein aktiver Briefkopf
    
    -- Firmeninformationen
    company_name VARCHAR(255) NOT NULL,
    company_address TEXT,
    company_phone VARCHAR(50),
    company_email VARCHAR(255),
    company_website VARCHAR(255),
    tax_number VARCHAR(100),
    vat_number VARCHAR(100),
    
    -- Logo und Briefkopf
    logo_url TEXT,
    letterhead_url TEXT, -- Vollständiger Briefkopf als Bild
    logo_position VARCHAR(20) DEFAULT 'top-left' CHECK (logo_position IN ('top-left', 'top-center', 'top-right')),
    
    -- Farben und Styling
    primary_color VARCHAR(7) DEFAULT '#1e40af', -- Hex-Farbe
    secondary_color VARCHAR(7) DEFAULT '#10b981',
    text_color VARCHAR(7) DEFAULT '#1f2937',
    
    -- Schriftarten
    font_family VARCHAR(100) DEFAULT 'Arial',
    font_size_body INTEGER DEFAULT 11,
    font_size_heading INTEGER DEFAULT 16,
    
    -- Layout-Einstellungen
    margin_top_mm INTEGER DEFAULT 25,
    margin_bottom_mm INTEGER DEFAULT 20,
    margin_left_mm INTEGER DEFAULT 20,
    margin_right_mm INTEGER DEFAULT 20,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für KI-Preisanalyse Cache
CREATE TABLE ai_pricing_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Suchkriterien (Hash für eindeutige Identifikation)
    search_hash VARCHAR(64) NOT NULL UNIQUE, -- MD5 Hash der Suchkriterien
    search_criteria JSONB NOT NULL, -- Original Suchkriterien
    
    -- Gefundene Preise
    found_prices JSONB NOT NULL DEFAULT '[]', -- Array von gefundenen Preisen
    confidence_score DECIMAL(3,2) DEFAULT 0.00, -- 0.00 - 1.00
    
    -- Metadaten
    source_pdfs UUID[] DEFAULT '{}', -- Referenzen zu offer_history_pdfs
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Cache-Verwaltung
    hit_count INTEGER DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für Microsoft 365 Integration
CREATE TABLE microsoft365_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    is_active BOOLEAN DEFAULT false,
    
    -- OAuth Konfiguration
    tenant_id VARCHAR(255),
    client_id VARCHAR(255),
    client_secret_encrypted TEXT, -- Verschlüsselt gespeichert
    
    -- Email-Konfiguration
    sender_email VARCHAR(255),
    sender_name VARCHAR(255),
    
    -- SharePoint/OneDrive Konfiguration
    sharepoint_site_url TEXT,
    document_library VARCHAR(255) DEFAULT 'Angebote',
    
    -- Teams Integration
    teams_webhook_url TEXT,
    default_channel VARCHAR(255),
    
    -- Letzte Synchronisation
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(50) DEFAULT 'disconnected' CHECK (sync_status IN ('disconnected', 'connected', 'error')),
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Erweiterte Settings Tabelle um neue Funktionen
ALTER TABLE settings ADD COLUMN IF NOT EXISTS ai_pricing_enabled BOOLEAN DEFAULT true;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS ai_confidence_threshold DECIMAL(3,2) DEFAULT 0.70;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS auto_generate_offers BOOLEAN DEFAULT false;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS pdf_template_style VARCHAR(50) DEFAULT 'professional';

-- Indizes für bessere Performance
CREATE INDEX idx_offer_history_pdfs_branch_tags ON offer_history_pdfs USING GIN(branch_tags);
CREATE INDEX idx_offer_history_pdfs_search_keywords ON offer_history_pdfs USING GIN(search_keywords);
CREATE INDEX idx_offer_history_pdfs_ai_status ON offer_history_pdfs(ai_analysis_status);
CREATE INDEX idx_offer_history_pdfs_upload_date ON offer_history_pdfs(upload_date DESC);

CREATE INDEX idx_company_branding_active ON company_branding(is_active) WHERE is_active = true;

CREATE INDEX idx_ai_pricing_cache_search_hash ON ai_pricing_cache(search_hash);
CREATE INDEX idx_ai_pricing_cache_last_used ON ai_pricing_cache(last_used DESC);

CREATE INDEX idx_microsoft365_config_active ON microsoft365_config(is_active) WHERE is_active = true;

-- Trigger für updated_at
CREATE TRIGGER update_offer_history_pdfs_updated_at BEFORE UPDATE ON offer_history_pdfs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_branding_updated_at BEFORE UPDATE ON company_branding FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_pricing_cache_updated_at BEFORE UPDATE ON ai_pricing_cache FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_microsoft365_config_updated_at BEFORE UPDATE ON microsoft365_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger um sicherzustellen, dass nur ein aktiver Briefkopf existiert
CREATE OR REPLACE FUNCTION ensure_single_active_branding()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_active = true THEN
        -- Deaktiviere alle anderen aktiven Briefköpfe
        UPDATE company_branding SET is_active = false WHERE id != NEW.id AND is_active = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_active_branding_trigger
    BEFORE INSERT OR UPDATE ON company_branding
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_active_branding();

-- Ähnlicher Trigger für Microsoft 365 Konfiguration
CREATE OR REPLACE FUNCTION ensure_single_active_microsoft365()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_active = true THEN
        UPDATE microsoft365_config SET is_active = false WHERE id != NEW.id AND is_active = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_active_microsoft365_trigger
    BEFORE INSERT OR UPDATE ON microsoft365_config
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_active_microsoft365();
