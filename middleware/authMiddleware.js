// middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
require('../config/env');

/**
 * Middleware para verificar el token de autenticación.
 * Responde con 401 si el token falta o es inválido.
 * En caso válido, asigna el userId decodificado a req.userId.
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticación no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token de autenticación inválido' });
  }
};

module.exports = { requireAuth };

