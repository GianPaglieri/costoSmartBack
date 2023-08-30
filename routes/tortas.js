const express = require('express');
const router = express.Router();
const tortasController = require('../controllers/tortasController');

// Ruta para obtener todas las tortas
router.get('/', tortasController.obtenerTortas);



module.exports = router;

