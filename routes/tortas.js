const express = require('express');
const router = express.Router();
const tortaController = require('../controllers/tortaController');
const upload = require('../multerConfig');
const { requireAuth } = require('../middleware/authMiddleware');


// Aplicar autenticación a todas las rutas
router.use(requireAuth);

// Ruta para obtener todas las tortas del usuario (usando el controller normal)
router.get('/', tortaController.obtenerTortas);

// Ruta para obtener todas las tortas con sus precios
router.get('/tortas-con-precios', tortaController.obtenerTortasConPrecios);

// 👇 Cambiamos guardarTorta por crearTorta (según el nuevo controller)
router.post('/', upload.single('imagen'), tortaController.crearTorta);
router.put('/:id', upload.single('imagen'), tortaController.editarTorta);
router.delete('/:id', tortaController.eliminarTorta);

module.exports = router;
