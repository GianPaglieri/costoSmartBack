const express = require('express');
const router = express.Router();
const ingredienteController = require('../controllers/ingredienteController');
const { requireAuth } = require('../middleware/authMiddleware');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');

// Aplicar autenticación a todas las rutas
router.use(requireAuth);

// Obtener todos los ingredientes
router.get('/', ingredienteController.obtenerIngredientes);

// Obtener ingredientes con menos stock
router.get('/menosstock', ingredienteController.obtenerIngredientesMenosStock);

// Crear nuevo ingrediente
router.post(
  '/',
  validate([
    body('nombre').trim().notEmpty().escape(),
    body('unidad_Medida').trim().notEmpty().escape(),
    body('tamano_Paquete').isFloat({ gt: 0 }).toFloat(),
    body('costo').isFloat({ gt: 0 }).toFloat(),
    body('CantidadStock').isInt({ min: 0 }).toInt()
  ]),
  ingredienteController.guardarIngrediente
);

// Editar ingrediente
router.put(
  '/:id',
  validate([
    param('id').isInt().toInt(),
    body('nombre').optional().trim().notEmpty().escape(),
    body('unidad_Medida').optional().trim().notEmpty().escape(),
    body('tamano_Paquete').optional().isFloat({ gt: 0 }).toFloat(),
    body('costo').optional().isFloat({ gt: 0 }).toFloat(),
    body('CantidadStock').optional().isInt({ min: 0 }).toInt()
  ]),
  ingredienteController.editarIngrediente
);

// Eliminar ingrediente
router.delete(
  '/:id',
  validate([param('id').isInt().toInt()]),
  ingredienteController.eliminarIngrediente
);

module.exports = router;
