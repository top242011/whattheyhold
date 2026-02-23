-- Enable UUID extension if not already enabled (should be, but safe to include)
create extension if not exists "uuid-ossp";

-- Analytics Sessions Table
create table if not exists analytics_sessions (
    id uuid primary key default uuid_generate_v4(),
    anonymous_id uuid not null, -- Generated client-side per device/browser
    locale text,
    device_type text,
    referrer text,
    created_at timestamptz default now()
);

-- Index for querying by anonymous_id
create index if not exists idx_analytics_sessions_anon_id on analytics_sessions(anonymous_id);
create index if not exists idx_analytics_sessions_created on analytics_sessions(created_at);

-- Analytics Events Table
create table if not exists analytics_events (
    id uuid primary key default uuid_generate_v4(),
    session_id uuid references analytics_sessions(id) on delete cascade,
    event_type text not null,
    event_data jsonb default '{}'::jsonb,
    created_at timestamptz default now()
);

-- Index for aggregating events
create index if not exists idx_analytics_events_session on analytics_events(session_id);
create index if not exists idx_analytics_events_type on analytics_events(event_type);
create index if not exists idx_analytics_events_created on analytics_events(created_at);

-- Row Level Security (RLS)
-- We want events to be insertable by anon key via the backend, 
-- but ONLY readable by authenticated admins or service roles.
-- For this MVP, we will allow backend to insert via REST API and anon key.

alter table analytics_sessions enable row level security;
alter table analytics_events enable row level security;

-- Only allow insert (no read/update/delete for public)
create policy "Allow anon insert analytics_sessions" on analytics_sessions for insert with check (true); 
create policy "Allow anon insert analytics_events" on analytics_events for insert with check (true);

-- No public read policies. The data is write-only from the frontend's perspective.
