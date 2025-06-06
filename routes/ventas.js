const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');

router.post('/', ventasController.registrarVenta);
router.get('/', ventasController.obtenerVentas);
router.get('/cantidad', ventasController.obtenerCantidadVentas); // Nueva ruta para obtener la cantidad de ventas
router.get('/cantidad-semana', ventasController.obtenerCantidadVentasSemana); // Nueva ruta para obtener la cantidad de ventas de la semana actual
router.get('/porcentaje-ventas', ventasController.obtenerPorcentajeVentas); // Nueva ruta para obtener el porcentaje de cambio en las ventas
router.get('/ganancias', ventasController.obtenerGanancias);
module.exports = router;


