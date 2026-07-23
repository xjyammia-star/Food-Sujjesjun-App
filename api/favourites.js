import { sql } from './db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-session-id')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const sessionId = req.headers['x-session-id']
  if (!sessionId) return res.status(400).json({ error: 'Missing x-session-id header' })

  try {
    // GET — load all favourites for this session
    if (req.method === 'GET') {
      const rows = await sql(
        `SELECT recipe_data FROM favourites WHERE session_id = $1 ORDER BY created_at ASC`,
        [sessionId]
      )
      return res.status(200).json({ favourites: rows.map(r => r.recipe_data) })
    }

    // POST — toggle favourite
    if (req.method === 'POST') {
      const { recipe } = req.body
      if (!recipe?.name) return res.status(400).json({ error: 'Missing recipe' })

      const existing = await sql(
        `SELECT id FROM favourites WHERE session_id = $1 AND recipe_name = $2`,
        [sessionId, recipe.name]
      )

      if (existing.length > 0) {
        await sql(
          `DELETE FROM favourites WHERE session_id = $1 AND recipe_name = $2`,
          [sessionId, recipe.name]
        )
        return res.status(200).json({ action: 'removed' })
      } else {
        await sql(
          `INSERT INTO favourites (session_id, recipe_name, recipe_data) VALUES ($1, $2, $3)`,
          [sessionId, recipe.name, JSON.stringify(recipe)]
        )
        return res.status(200).json({ action: 'added' })
      }
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (err) {
    console.error('[FAV] Error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
