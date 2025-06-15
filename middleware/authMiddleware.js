// middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');

exports.obtenerUserIdDesdeRequest = (req) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    throw new Error('Token de autenticación no proporcionado');
  }
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, 'secreto');
  return decoded.userId;
};
