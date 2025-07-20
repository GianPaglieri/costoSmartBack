// controllers/tortaController.js

const tortaService = require('../services/tortaService');
const { obtenerUserIdDesdeRequest } = require('../middleware/authMiddleware');

exports.crearTorta = async (req, res) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req);
    const { nombre_torta, descripcion_torta } = req.body;
    const imagen = req.file ? `uploads/${req.file.filename}` : null;

    const torta = await tortaService.crearTorta({ nombre_torta, descripcion_torta, imagen, userId });

    res.json({ success: true, torta });
  } catch (error) {
    console.error('Error al crear la torta:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.obtenerTortas = async (req, res) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req);
    const tortas = await tortaService.obtenerTortasPorUsuario(userId);
    res.json(tortas);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.editarTorta = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_torta, descripcion_torta } = req.body;
    const imagen = req.file ? `uploads/${req.file.filename}` : null;

    const torta = await tortaService.editarTorta({ id, nombre_torta, descripcion_torta, imagen });

    res.json({ success: true, torta });
  } catch (error) {
    console.error('Error al editar la torta:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.eliminarTorta = async (req, res) => {
  try {
    const { id } = req.params;

    await tortaService.eliminarTorta(id);

    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar la torta:', error);
    res.status(400).json({ error: error.message });
  }
};
