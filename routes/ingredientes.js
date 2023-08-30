const express = require('express');
const router = express.Router();
const ingredientesController = require('../controllers/ingredientesController');
const listaPreciosController = require('../controllers/listaPreciosController');



// Rutas para los ingredientes
router.get('/', ingredientesController.obtenerIngredientes);
// Ruta para obtener los 5 ingredientes con menos stock
router.get('/menosstock', ingredientesController.obtenerIngredientesMenosStock);

router.post('/', ingredientesController.guardarIngrediente);
router.put('/:id', ingredientesController.editarIngrediente);
router.delete('/:id', ingredientesController.eliminarIngrediente);


// Ruta para actualizar el costo total de una receta
router.put('/recetas/:idTorta/actualizar-costototal', listaPreciosController.actualizarCostoTotalReceta);
router.get('/menosstock', ingredientesController.obtenerIngredientesMenosStock);

module.exports = router;


