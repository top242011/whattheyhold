import os
import psycopg2

URL = "postgresql://postgres:1819900406525Th%40@db.mzvqhtwtnqnbrussgsiq.supabase.co:5432/postgres"

conn = psycopg2.connect(URL)
cur = conn.cursor()

try:
    cur.execute("ALTER TABLE IF EXISTS funds ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;")
    cur.execute("ALTER TABLE IF EXISTS thai_funds ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;")
    
    cur.execute("""
    CREATE OR REPLACE FUNCTION increment_fund_view(p_ticker text)
    RETURNS void AS $$
    BEGIN
        UPDATE funds SET view_count = view_count + 1 WHERE ticker = p_ticker;
    END;
    $$ LANGUAGE plpgsql;
    """)

    cur.execute("""
    CREATE OR REPLACE FUNCTION increment_thai_fund_view(p_proj_id text)
    RETURNS void AS $$
    BEGIN
        UPDATE thai_funds SET view_count = view_count + 1 WHERE proj_id = p_proj_id;
    END;
    $$ LANGUAGE plpgsql;
    """)
    conn.commit()
    print("Success")
except Exception as e:
    print("Error:", e)
finally:
    cur.close()
    conn.close()
