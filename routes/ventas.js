const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

router.post('/', ventaController.registrarVenta);
router.get('/', ventaController.obtenerVentas);
router.get('/cantidad', ventaController.obtenerCantidadVentas);
router.get('/cantidad-semana', ventaController.obtenerCantidadVentasSemana);
router.get('/porcentaje-ventas', ventaController.obtenerPorcentajeVentas);
router.get('/ganancias', ventaController.obtenerGanancias);

module.exports = router;
