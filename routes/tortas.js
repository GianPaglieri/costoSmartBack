const express = require('express');
const router = express.Router();
const tortaController = require('../controllers/tortaController');
const upload = require('../multerConfig');
const { requireAuth } = require('../middleware/authMiddleware');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');


// Aplicar autenticación a todas las rutas
router.use(requireAuth);

// Ruta para obtener todas las tortas del usuario (usando el controller normal)
router.get('/', tortaController.obtenerTortas);

// Ruta para obtener todas las tortas con sus precios
router.get('/tortas-con-precios', tortaController.obtenerTortasConPrecios);

// 👇 Cambiamos guardarTorta por crearTorta (según el nuevo controller)
router.post(
  '/',
  upload.single('imagen'),
  validate([
    body('nombre_torta').trim().notEmpty().escape(),
    body('descripcion_torta').optional().trim().escape()
  ]),
  tortaController.crearTorta
);

router.put(
  '/:id',
  upload.single('imagen'),
  validate([
    param('id').isInt().toInt(),
    body('nombre_torta').optional().trim().notEmpty().escape(),
    body('descripcion_torta').optional().trim().escape()
  ]),
  tortaController.editarTorta
);

router.delete(
  '/:id',
  validate([param('id').isInt().toInt()]),
  tortaController.eliminarTorta
);

module.exports = router;
