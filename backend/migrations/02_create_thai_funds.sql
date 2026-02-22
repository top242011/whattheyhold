-- Thai Funds (from SEC Open Data API)
CREATE TABLE IF NOT EXISTS thai_funds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proj_id TEXT UNIQUE NOT NULL,
    proj_name_th TEXT,
    proj_name_en TEXT,
    proj_abbr_name TEXT,
    amc_name_th TEXT,
    amc_name_en TEXT,
    fund_type TEXT,
    policy_desc TEXT,
    is_feeder_fund BOOLEAN DEFAULT FALSE,
    feederfund_master_fund TEXT,
    feederfund_country TEXT,
    master_fund_ticker TEXT,
    risk_level TEXT,
    nav_per_unit NUMERIC(12, 4),
    total_nav NUMERIC(18, 2),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_thai_funds_proj_id ON thai_funds(proj_id);
CREATE INDEX IF NOT EXISTS idx_thai_funds_feeder ON thai_funds(is_feeder_fund) WHERE is_feeder_fund = TRUE;

-- Feeder → Master Fund mapping (curated + auto-detected)
CREATE TABLE IF NOT EXISTS feeder_master_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thai_fund_proj_id TEXT REFERENCES thai_funds(proj_id) ON DELETE CASCADE,
    master_fund_name TEXT NOT NULL,
    master_fund_ticker TEXT,
    master_fund_isin TEXT,
    confidence TEXT DEFAULT 'auto',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feeder_mapping_proj ON feeder_master_mapping(thai_fund_proj_id);

-- Thai Fund Holdings (quarterly portfolio from SEC)
CREATE TABLE IF NOT EXISTS thai_fund_holdings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thai_fund_proj_id TEXT REFERENCES thai_funds(proj_id) ON DELETE CASCADE,
    period TEXT NOT NULL,
    issuer TEXT,
    issue_code TEXT,
    isin_code TEXT,
    asset_type TEXT,
    value NUMERIC(18, 2),
    percent_nav NUMERIC(8, 4),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_thai_holdings_proj ON thai_fund_holdings(thai_fund_proj_id);
CREATE INDEX IF NOT EXISTS idx_thai_holdings_period ON thai_fund_holdings(period);

-- RLS Policies
ALTER TABLE thai_funds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read thai_funds" ON thai_funds FOR SELECT USING (true);
CREATE POLICY "Allow anon insert thai_funds" ON thai_funds FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update thai_funds" ON thai_funds FOR UPDATE USING (true);

ALTER TABLE feeder_master_mapping ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read feeder_master_mapping" ON feeder_master_mapping FOR SELECT USING (true);
CREATE POLICY "Allow anon insert feeder_master_mapping" ON feeder_master_mapping FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update feeder_master_mapping" ON feeder_master_mapping FOR UPDATE USING (true);

ALTER TABLE thai_fund_holdings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read thai_fund_holdings" ON thai_fund_holdings FOR SELECT USING (true);
CREATE POLICY "Allow anon insert thai_fund_holdings" ON thai_fund_holdings FOR INSERT WITH CHECK (true);
