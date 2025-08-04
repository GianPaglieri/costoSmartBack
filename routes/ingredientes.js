const express = require('express');
const router = express.Router();
const ingredienteController = require('../controllers/ingredienteController');
const { requireAuth } = require('../middleware/authMiddleware');

// Aplicar autenticación a todas las rutas
router.use(requireAuth);

// Obtener todos los ingredientes
router.get('/', ingredienteController.obtenerIngredientes);

// Obtener ingredientes con menos stock
router.get('/menosstock', ingredienteController.obtenerIngredientesMenosStock);

// Crear nuevo ingrediente
router.post('/', ingredienteController.guardarIngrediente);

// Editar ingrediente
router.put('/:id', ingredienteController.editarIngrediente);

// Eliminar ingrediente
router.delete('/:id', ingredienteController.eliminarIngrediente);

module.exports = router;
