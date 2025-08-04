const express = require('express');
const router = express.Router();
const recetasController = require('../controllers/recetasController');
const { requireAuth } = require('../middleware/authMiddleware');

// Aplicar autenticación a todas las rutas
router.use(requireAuth);

// Ruta para obtener todas las recetas
router.get('/', recetasController.obtenerRecetas);

// Ruta para guardar una receta
router.post('/', recetasController.agregarRelacion); // Cambiado de guardarReceta a agregarRelacion

// Ruta para editar o crear una receta
router.put('/:ID_TORTA/:ID_INGREDIENTE', recetasController.crearOEditarReceta);

// Ruta para agregar una nueva relación
router.post('/nueva-relacion', recetasController.agregarRelacion);

// Ruta para eliminar la asignación de un ingrediente a una receta
router.delete('/:ID_TORTA/:ID_INGREDIENTE', recetasController.eliminarAsignacion);

// Ruta para eliminar una receta
router.delete('/:ID_TORTA', recetasController.eliminarReceta);

module.exports = router;
