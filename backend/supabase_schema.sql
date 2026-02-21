-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Funds Table
create table if not exists funds (
    id uuid primary key default uuid_generate_v4(),
    ticker text unique not null,
    name text not null,
    price numeric(12, 4),
    currency text default 'USD',
    updated_at timestamptz default now()
);

-- Holdings Table
create table if not exists holdings (
    id uuid primary key default uuid_generate_v4(),
    fund_id uuid references funds(id) on delete cascade,
    ticker text not null,
    name text not null,
    pct numeric(8, 4) not null,
    country_code text, -- ISO 3166-1 alpha-3
    updated_at timestamptz default now()
);
create index if not exists idx_holdings_fund on holdings(fund_id);

-- Country Weights Table (Pre-calculated for map)
create table if not exists country_weights (
    id uuid primary key default uuid_generate_v4(),
    fund_id uuid references funds(id) on delete cascade,
    country_code text not null,
    weight_pct numeric(8, 4) not null,
    updated_at timestamptz default now()
);
create index if not exists idx_country_weights_fund on country_weights(fund_id);

-- Sector Weights Table
create table if not exists sector_weights (
    id uuid primary key default uuid_generate_v4(),
    fund_id uuid references funds(id) on delete cascade,
    sector text not null,
    weight_pct numeric(8, 4) not null,
    updated_at timestamptz default now()
);
create index if not exists idx_sector_weights_fund on sector_weights(fund_id);

-- Row Level Security (RLS)
-- Allow public read access
alter table funds enable row level security;
create policy "Allow public read funds" on funds for select using (true);
create policy "Allow anon insert funds" on funds for insert with check (true); 
create policy "Allow anon update funds" on funds for update using (true);

alter table holdings enable row level security;
create policy "Allow public read holdings" on holdings for select using (true);
create policy "Allow anon insert holdings" on holdings for insert with check (true);

alter table country_weights enable row level security;
create policy "Allow public read country_weights" on country_weights for select using (true);
create policy "Allow anon insert country_weights" on country_weights for insert with check (true);

alter table sector_weights enable row level security;
create policy "Allow public read sector_weights" on sector_weights for select using (true);
create policy "Allow anon insert sector_weights" on sector_weights for insert with check (true);

-- NOTE: For production, INSERT/UPDATE should be restricted to service_role only.
-- Since we are running the scrivener from the backend with the ANON key for this MVP (unless user provides service key),
-- we are enabling anon write access for demonstration. Ideally we use Service Role Key for writes.
