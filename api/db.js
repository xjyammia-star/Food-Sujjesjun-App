// Neon serverless HTTP — no npm package needed
// Parses DATABASE_URL and sends queries via Neon's HTTPS endpoint

function getNeonConfig() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('Missing DATABASE_URL')

  // postgresql://user:password@host/dbname
  const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^/]+)\/(.+)/)
  if (!match) throw new Error('Invalid DATABASE_URL format')

  const [, user, password, host, dbname] = match
  return { user, password, host, dbname: dbname.split('?')[0] }
}

export async function sql(query, params = []) {
  const { user, password, host, dbname } = getNeonConfig()
  const endpoint = `https://${host}/sql`

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + Buffer.from(`${user}:${password}`).toString('base64'),
      'Neon-Connection-String': process.env.DATABASE_URL,
    },
    body: JSON.stringify({ query, params }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Neon query failed: ${err}`)
  }

  const data = await res.json()
  return data.rows ?? []
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
