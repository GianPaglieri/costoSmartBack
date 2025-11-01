const express = require('express');
const { body } = require('express-validator');

const {
  createUser,
  getUsers,
  requestPasswordReset,
  resetPassword,
  loginUser,
  changePassword,
} = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/', requireAuth, getUsers);

router.post(
  '/register',
  validate([
    body('nombre').trim().notEmpty().escape(),
    body('email').isEmail().normalizeEmail(),
    body('contrasena').isLength({ min: 6 }).trim(),
  ]),
  createUser
);

router.post(
  '/login',
  // Validaciones relajadas temporalmente: permitir cualquier email/contraseña
  validate([body('email').trim(), body('contrasena').trim()]),
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
    body('newPassword').isLength({ min: 6 }).trim(),
  ]),
  resetPassword
);

router.post(
  '/change-password',
  requireAuth,
  validate([
    body('currentPassword').trim().notEmpty(),
    body('newPassword').isLength({ min: 6 }).trim(),
  ]),
  changePassword
);

module.exports = router;
