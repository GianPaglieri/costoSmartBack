const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');
const { requireAuth } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');

router.use(requireAuth);

router.post(
  '/',
  validate([body('id_torta').isInt().toInt()]),
  ventaController.registrarVenta
);
router.get('/', ventaController.obtenerVentas);
router.get('/cantidad', ventaController.obtenerCantidadVentas);
router.get('/cantidad-semana', ventaController.obtenerCantidadVentasSemana);
router.get('/porcentaje-ventas', ventaController.obtenerPorcentajeVentas);
router.get('/ganancias', ventaController.obtenerGanancias);

module.exports = router;
