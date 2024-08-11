const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');



// Ruta para el inicio de sesión de usuarios
router.post('/login', loginController.loginUser);

module.exports = router;