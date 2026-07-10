export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt } = req.body
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' })

  try {
    const serviceAccount = JSON.parse(process.env.VITE_GOOGLE_SERVICE_ACCOUNT_JSON)
    const projectId = process.env.VITE_GOOGLE_CLOUD_PROJECT_ID
    const accessToken = await getAccessToken(serviceAccount)

    // Try models and regions in order until one works
    const attempts = [
      { location: 'us-central1', model: 'imagen-3.0-generate-002' },
      { location: 'us-central1', model: 'imagen-3.0-fast-generate-001' },
      { location: 'us-central1', model: 'imagegeneration@006' },
      { location: 'asia-southeast1', model: 'imagen-3.0-generate-002' },
      { location: 'asia-southeast1', model: 'imagegeneration@006' },
      { location: 'asia-east1', model: 'imagegeneration@006' },
    ]

    let lastError = null

    for (const { location, model } of attempts) {
      const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predict`

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
            safetyFilterLevel: 'block_few',
            personGeneration: 'allow_adult',
          },
        }),
      })

      if (imageRes.ok) {
        const data = await imageRes.json()
        const b64 = data.predictions?.[0]?.bytesBase64Encoded
        if (b64) {
          console.log(`Success with ${location}/${model}`)
          return res.status(200).json({ image: `data:image/png;base64,${b64}` })
        }
      } else {
        const errText = await imageRes.text()
        console.error(`Failed ${location}/${model}:`, errText)
        lastError = errText
      }
    }

    return res.status(500).json({ error: 'All Imagen attempts failed', detail: lastError })

  } catch (err) {
    console.error('generate-image error:', err)
    return res.status(500).json({ error: err.message })
  }
}

async function getAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000)

  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }

  const b64Header = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const b64Payload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const signingInput = `${b64Header}.${b64Payload}`

  const privateKeyPem = serviceAccount.private_key
  const pemContents = privateKeyPem
    .replace('-----BEGIN RSA PRIVATE KEY-----', '')
    .replace('-----END RSA PRIVATE KEY-----', '')
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\n/g, '')
    .trim()

  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0))

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signingInput)
  )

  const b64Sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  const jwt = `${signingInput}.${b64Sig}`

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })

  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) throw new Error('Failed to get access token: ' + JSON.stringify(tokenData))
  return tokenData.access_token
}
