// middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.obtenerUserIdDesdeRequest = (req) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    throw new Error('Token de autenticación no proporcionado');
  }
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.userId;
};
