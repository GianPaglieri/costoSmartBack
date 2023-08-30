const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');

router.post('/', ventasController.registrarVenta);
router.get('/cantidad', ventasController.obtenerCantidadVentas); // Nueva ruta para obtener la cantidad de ventas

module.exports = router;



