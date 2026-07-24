// Neon HTTP API using DATABASE_URL for auth

async function neonSql(query, params = []) {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('Missing DATABASE_URL env var')
  }

  // Parse connection string to get host
  const url = new URL(connectionString)
  const host = url.hostname
  const endpoint = `https://${host}/sql`

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Neon-Connection-String': connectionString,
    },
    body: JSON.stringify({ query, params }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Neon HTTP error ${res.status}: ${text}`)
  }

  const data = await res.json()
  return data.rows ?? []
}

export { neonSql as sql }
