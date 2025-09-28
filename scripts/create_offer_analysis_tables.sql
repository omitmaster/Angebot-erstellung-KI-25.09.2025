-- Create tables for offer upload and price analysis system

-- Table for storing uploaded offers
CREATE TABLE IF NOT EXISTS uploaded_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'pdf', 'excel', 'gaeb', etc.
    file_size_bytes BIGINT,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID REFERENCES users(id),
    
    -- Analysis status
    analysis_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    analysis_started_at TIMESTAMP WITH TIME ZONE,
    analysis_completed_at TIMESTAMP WITH TIME ZONE,
    analysis_error TEXT,
    
    -- Metadata extracted from offer
    offer_title TEXT,
    offer_date DATE,
    customer_name TEXT,
    project_type VARCHAR(100),
    total_amount NUMERIC(12,2),
    currency VARCHAR(3) DEFAULT 'EUR',
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing extracted price data from offers
CREATE TABLE IF NOT EXISTS extracted_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploaded_offer_id UUID REFERENCES uploaded_offers(id) ON DELETE CASCADE,
    
    -- Position details
    position_number VARCHAR(50),
    description TEXT NOT NULL,
    unit VARCHAR(20),
    quantity NUMERIC(12,3),
    unit_price NUMERIC(12,2),
    total_price NUMERIC(12,2),
    
    -- Categorization
    category VARCHAR(100), -- 'labor', 'material', 'equipment', 'other'
    trade_category VARCHAR(100), -- 'electrical', 'plumbing', 'construction', etc.
    work_type VARCHAR(100), -- 'installation', 'repair', 'maintenance', etc.
    
    -- Quality indicators
    confidence_score NUMERIC(3,2) DEFAULT 0.0, -- 0.0 to 1.0
    extraction_method VARCHAR(50), -- 'ai_analysis', 'manual_entry', 'template_match'
    
    -- Market data
    market_price_min NUMERIC(12,2),
    market_price_max NUMERIC(12,2),
    market_price_avg NUMERIC(12,2),
    price_variance_pct NUMERIC(5,2), -- percentage variance from market average
    
    -- Regional and temporal factors
    region VARCHAR(100),
    price_date DATE,
    seasonal_factor NUMERIC(3,2) DEFAULT 1.0,
    
    -- Integration with existing pricebook
    matched_pricebook_item_id UUID REFERENCES pricebook_items(id),
    match_confidence NUMERIC(3,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for price analysis results and insights
CREATE TABLE IF NOT EXISTS price_analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploaded_offer_id UUID REFERENCES uploaded_offers(id) ON DELETE CASCADE,
    
    -- Analysis summary
    total_positions INTEGER,
    analyzed_positions INTEGER,
    matched_positions INTEGER,
    new_positions INTEGER,
    
    -- Price insights
    average_markup_pct NUMERIC(5,2),
    competitive_score NUMERIC(3,2), -- 0.0 to 1.0
    price_trend VARCHAR(20), -- 'above_market', 'at_market', 'below_market'
    
    -- Recommendations
    recommendations JSONB DEFAULT '[]',
    price_adjustments JSONB DEFAULT '[]',
    
    -- Quality metrics
    data_quality_score NUMERIC(3,2),
    completeness_pct NUMERIC(5,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking price updates to pricebook
CREATE TABLE IF NOT EXISTS price_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pricebook_item_id UUID REFERENCES pricebook_items(id),
    extracted_price_id UUID REFERENCES extracted_prices(id),
    
    -- Update details
    update_type VARCHAR(50), -- 'new_item', 'price_update', 'validation'
    old_price NUMERIC(12,2),
    new_price NUMERIC(12,2),
    price_change_pct NUMERIC(5,2),
    
    -- Approval workflow
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_uploaded_offers_status ON uploaded_offers(analysis_status);
CREATE INDEX IF NOT EXISTS idx_uploaded_offers_date ON uploaded_offers(upload_date);
CREATE INDEX IF NOT EXISTS idx_extracted_prices_offer ON extracted_prices(uploaded_offer_id);
CREATE INDEX IF NOT EXISTS idx_extracted_prices_category ON extracted_prices(trade_category, category);
CREATE INDEX IF NOT EXISTS idx_extracted_prices_confidence ON extracted_prices(confidence_score);
CREATE INDEX IF NOT EXISTS idx_price_updates_status ON price_updates(status);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_uploaded_offers_updated_at BEFORE UPDATE ON uploaded_offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_extracted_prices_updated_at BEFORE UPDATE ON extracted_prices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_price_analysis_results_updated_at BEFORE UPDATE ON price_analysis_results FOR EACH ROW EXECUTE FUNCTION update_price_analysis_results_updated_at_column();
CREATE TRIGGER update_price_updates_updated_at BEFORE UPDATE ON price_updates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
