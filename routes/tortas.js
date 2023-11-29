const express = require('express');
const router = express.Router();
const tortasController = require('../controllers/tortasController');

// Ruta para obtener todas las tortas
router.get('/', tortasController.obtenerTortas);
router.post('/', tortasController.guardarTorta);
router.put('/:id', tortasController.editarTorta);
router.delete('/:id', tortasController.eliminarTorta);



module.exports = router;

