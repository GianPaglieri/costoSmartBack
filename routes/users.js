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
  validate([body('nombre').trim().notEmpty().escape()]),
  createUser
);

router.post('/login', loginUser);

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
    body('currentPassword')
      .trim()
      .notEmpty()
      .withMessage('Ingresa tu contrasena actual'),
    body('newPassword')
      .trim()
      .isLength({ min: 6 })
      .withMessage('La nueva contrasena debe tener al menos 6 caracteres'),
  ]),
  changePassword
);

module.exports = router;
