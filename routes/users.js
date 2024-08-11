const express = require('express');
const router = express.Router();
const { createUser, getUsers, requestPasswordReset, resetPassword } = require('../controllers/userController');

// Define las rutas usando las funciones importadas directamente
router.get('/', getUsers);
router.post('/register', createUser);

router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

module.exports = router;