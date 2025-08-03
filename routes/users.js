const express = require('express');
const router = express.Router();
const { createUser, getUsers, requestPasswordReset, resetPassword } = require('../controllers/userController');
const { obtenerUserIdDesdeRequest } = require('../middleware/authMiddleware');

// Middleware sencillo para exigir autenticación
const requireAuth = (req, res, next) => {
  const userId = obtenerUserIdDesdeRequest(req, res);
  if (!userId) return;
  req.userId = userId;
  next();
};

// Define las rutas usando las funciones importadas directamente
router.get('/', requireAuth, getUsers);
router.post('/register', createUser);

router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

module.exports = router;
