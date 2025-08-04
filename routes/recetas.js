const express = require('express');
const router = express.Router();
const recetasController = require('../controllers/recetasController');
const { requireAuth } = require('../middleware/authMiddleware');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');

// Aplicar autenticación a todas las rutas
router.use(requireAuth);

// Ruta para obtener todas las recetas
router.get('/', recetasController.obtenerRecetas);

// Ruta para guardar una receta
router.post(
  '/',
  validate([
    body('ID_TORTA').isInt().toInt(),
    body('ID_INGREDIENTE').isInt().toInt(),
    body('cantidad').isFloat({ gt: 0 }).toFloat()
  ]),
  recetasController.agregarRelacion
); // Cambiado de guardarReceta a agregarRelacion

// Ruta para editar o crear una receta
router.put(
  '/:ID_TORTA/:ID_INGREDIENTE',
  validate([
    param('ID_TORTA').isInt().toInt(),
    param('ID_INGREDIENTE').isInt().toInt(),
    body('total_cantidad').isFloat({ gt: 0 }).toFloat()
  ]),
  recetasController.crearOEditarReceta
);

// Ruta para agregar una nueva relación
router.post(
  '/nueva-relacion',
  validate([
    body('ID_TORTA').isInt().toInt(),
    body('ID_INGREDIENTE').isInt().toInt(),
    body('cantidad').isFloat({ gt: 0 }).toFloat()
  ]),
  recetasController.agregarRelacion
);

// Ruta para eliminar la asignación de un ingrediente a una receta
router.delete(
  '/:ID_TORTA/:ID_INGREDIENTE',
  validate([param('ID_TORTA').isInt().toInt(), param('ID_INGREDIENTE').isInt().toInt()]),
  recetasController.eliminarAsignacion
);

// Ruta para eliminar una receta
router.delete(
  '/:ID_TORTA',
  validate([param('ID_TORTA').isInt().toInt()]),
  recetasController.eliminarReceta
);

module.exports = router;
