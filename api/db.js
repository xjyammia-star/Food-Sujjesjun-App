// Neon HTTP API — no npm package needed, table created manually in Neon dashboard

async function neonSql(query, params = []) {
  const host     = process.env.PGHOST
  const user     = process.env.PGUSER
  const password = process.env.PGPASSWORD
  const database = process.env.PGDATABASE || 'neondb'

  if (!host || !user || !password) {
    throw new Error(`Missing Neon env vars — PGHOST:${!!host} PGUSER:${!!user} PGPASSWORD:${!!password}`)
  }

  const url = `https://${host}/sql`
  const credentials = Buffer.from(`${user}:${password}`).toString('base64')

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Basic ${credentials}`,
    },
    body: JSON.stringify({ query, params, database }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Neon HTTP error ${res.status}: ${text}`)
  }

  const data = await res.json()
  return data.rows ?? []
}

export { neonSql as sql }
