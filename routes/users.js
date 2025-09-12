const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createUser,
  getUsers,
  requestPasswordReset,
  resetPassword,
  loginUser,
} = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// Define las rutas usando las funciones importadas directamente
router.get('/', requireAuth, getUsers);

router.post(
  '/register',
  validate([
    body('nombre').trim().notEmpty().escape(),
    body('email').isEmail().normalizeEmail(),
    body('contrasena').isLength({ min: 6 }).trim()
  ]),
  createUser
);

router.post(
  '/login',
  // Validaciones relajadas temporalmente: permitir cualquier email/contraseña
  validate([
    body('email').trim(),
    body('contrasena').trim()
  ]),
  loginUser
);

router.post(
  '/request-password-reset',
  validate([body('email').isEmail().normalizeEmail()]),
  requestPasswordReset
);

router.post(
  '/reset-password',
  validate([
    body('token').trim().notEmpty().escape(),
    body('newPassword').isLength({ min: 6 }).trim()
  ]),
  resetPassword
);

module.exports = router;
