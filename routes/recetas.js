const express = require('express');
const router = express.Router();
const recetasController = require('../controllers/recetasController');

// Ruta para obtener todas las tortas
router.get('/', recetasController.obtenerRecetas);



module.exports = router;
