// middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.obtenerUserIdDesdeRequest = (req, res) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    if (res) {
      res.status(401).json({ error: 'Token de autenticación no proporcionado' });
    }
    return null;
  }

  const token = req.headers.authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    if (res) {
      res.status(401).json({ error: 'Token de autenticación inválido' });
    }
    return null;
  }
};
