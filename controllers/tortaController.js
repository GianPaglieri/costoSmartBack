// controllers/tortaController.js

const tortaService = require('../services/tortaService');
const { obtenerUserIdDesdeRequest } = require('../middleware/authMiddleware');

exports.crearTorta = async (req, res, next) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req, res);
    if (!userId) return;
    const { nombre_torta, descripcion_torta } = req.body;
    const imagen = req.file ? `uploads/${req.file.filename}` : null;

    const torta = await tortaService.crearTorta({ nombre_torta, descripcion_torta, imagen, userId });

    res.json({ success: true, torta });
  } catch (error) {
    next(error);
  }
};

exports.obtenerTortas = async (req, res, next) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req, res);
    if (!userId) return;
    const tortas = await tortaService.obtenerTortasPorUsuario(userId);
    res.json(tortas);
  } catch (error) {
    next(error);
  }
};

exports.obtenerTortasConPrecios = async (req, res, next) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req, res);
    if (!userId) return;

    const tortasConPrecio = await tortaService.obtenerTortasConPrecioPorUsuario(userId);
    res.json(tortasConPrecio);
  } catch (error) {
    next(error);
  }
};

exports.editarTorta = async (req, res, next) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req, res);
    if (!userId) return;
    const { id } = req.params;
    const { nombre_torta, descripcion_torta } = req.body;
    const imagen = req.file ? `uploads/${req.file.filename}` : null;

    const torta = await tortaService.editarTorta({ id, nombre_torta, descripcion_torta, imagen, userId });

    res.json({ success: true, torta });
  } catch (error) {
    next(error);
  }
};

exports.eliminarTorta = async (req, res, next) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req, res);
    if (!userId) return;
    const { id } = req.params;

    await tortaService.eliminarTorta(id, userId);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
