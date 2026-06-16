export function apiKeyAuth(req, res, next) {
  const apiKey = req.headers['x-api-key']

  if (!apiKey) {
    return res.status(401).json({ error: 'API key requerida (X-API-Key header)' })
  }

  const expectedKey = process.env.PLATFORM_API_KEY

  if (!expectedKey) {
    return res.status(500).json({ error: 'PLATFORM_API_KEY no configurada en el servidor' })
  }

  if (apiKey !== expectedKey) {
    return res.status(403).json({ error: 'API key inválida' })
  }

  next()
}
