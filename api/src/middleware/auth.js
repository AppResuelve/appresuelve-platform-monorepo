import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'platform-dev-secret'

export function generateToken(email) {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' })
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  try {
    req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}
