export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt } = req.body
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' })

  // Support both variable names
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT || process.env.VITE_GOOGLE_SERVICE_ACCOUNT_JSON || ''
  const projectId = process.env.VITE_GOOGLE_CLOUD_PROJECT_ID || ''

  if (!serviceAccountJson || !projectId) {
    console.error('[IMG] Missing config - serviceAccount:', !!serviceAccountJson, 'projectId:', !!projectId)
    return res.status(500).json({ error: 'Server not configured' })
  }

  try {
    const accessToken = await getAccessToken(serviceAccountJson)

    const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagen-4.0-fast-generate-001:predict`

    console.log('[IMG] Calling Imagen 4 Fast...')

    const imageRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: '4:3',
          safetyFilterLevel: 'block_some',
          personGeneration: 'allow_adult',
        },
      }),
    })

    if (!imageRes.ok) {
      const err = await imageRes.text()
      console.error('[IMG] Imagen error:', imageRes.status, err.substring(0, 300))
      return res.status(500).json({ error: 'Imagen API failed', detail: err })
    }

    const data = await imageRes.json()
    const b64 = data.predictions?.[0]?.bytesBase64Encoded

    if (!b64) {
      console.warn('[IMG] No image returned:', JSON.stringify(data).substring(0, 200))
      return res.status(500).json({ error: 'No image returned' })
    }

    console.log('[IMG] ✅ Success!')
    return res.status(200).json({ image: `data:image/png;base64,${b64}` })

  } catch (err) {
    console.error('[IMG] Error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}

async function getAccessToken(serviceAccountJson) {
  const sa = JSON.parse(serviceAccountJson)
  const now = Math.floor(Date.now() / 1000)

  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }

  // Use Node.js crypto (available in Vercel serverless, more reliable than Web Crypto)
  const crypto = await import('crypto')
  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url')
  const headerPayload = `${encode(header)}.${encode(payload)}`
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(headerPayload)
  const signature = sign.sign(sa.private_key, 'base64url')
  const jwt = `${headerPayload}.${signature}`

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })

  if (!tokenRes.ok) throw new Error(`Token error: ${await tokenRes.text()}`)
  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) throw new Error('No access token: ' + JSON.stringify(tokenData))
  return tokenData.access_token
}
