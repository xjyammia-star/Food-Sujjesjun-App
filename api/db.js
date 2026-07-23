import pg from 'pg'

const { Pool } = pg

// Vercel+Neon injects these automatically when you connect via the integration
const pool = new Pool({
  host:     process.env.PGHOST,
  database: process.env.PGDATABASE || 'neondb',
  user:     process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port:     5432,
  ssl:      { rejectUnauthorized: false },
  max:      1, // serverless — keep connections minimal
})

export async function sql(query, params = []) {
  const client = await pool.connect()
  try {
    const result = await client.query(query, params)
    return result.rows
  } finally {
    client.release()
  }
}

export async function ensureSchema() {
  await sql(`
    CREATE TABLE IF NOT EXISTS favourites (
      id          SERIAL PRIMARY KEY,
      session_id  TEXT NOT NULL,
      recipe_name TEXT NOT NULL,
      recipe_data JSONB NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(session_id, recipe_name)
    )
  `)
}
