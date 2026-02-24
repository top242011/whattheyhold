const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:1819900406525Th%40@db.mzvqhtwtnqnbrussgsiq.supabase.co:5432/postgres"
});

async function run() {
    try {
        await client.connect();

        await client.query("ALTER TABLE IF EXISTS funds ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;");
        await client.query("ALTER TABLE IF EXISTS thai_funds ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;");

        await client.query(`
      CREATE OR REPLACE FUNCTION increment_fund_view(p_ticker text)
      RETURNS void AS $$
      BEGIN
          UPDATE funds SET view_count = view_count + 1 WHERE ticker = p_ticker;
      END;
      $$ LANGUAGE plpgsql;
    `);

        await client.query(`
      CREATE OR REPLACE FUNCTION increment_thai_fund_view(p_proj_id text)
      RETURNS void AS $$
      BEGIN
          UPDATE thai_funds SET view_count = view_count + 1 WHERE proj_id = p_proj_id;
      END;
      $$ LANGUAGE plpgsql;
    `);

        console.log("Success");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}

run();
