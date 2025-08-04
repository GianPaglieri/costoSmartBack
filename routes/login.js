const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/userController');

// Ruta para el inicio de sesión de usuarios
router.post('/login', loginUser);

module.exports = router;
