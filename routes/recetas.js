    const express = require('express');
    const router = express.Router();
    const recetasController = require('../controllers/recetasController');

    // Ruta para obtener todas las recetas
    router.get('/', recetasController.obtenerRecetas);

    // Ruta para guardar una receta
    router.post('/', recetasController.guardarReceta);

    // Ruta para editar o crear una receta
    router.put('/:ID_TORTA/:ID_INGREDIENTE', recetasController.editarOcrearReceta);

    // Ruta para agregar una nueva relación
    router.post('/nueva-relacion', recetasController.agregarRelacion);

    module.exports = router;


