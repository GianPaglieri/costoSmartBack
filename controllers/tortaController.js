// controllers/tortaController.js

const tortaService = require('../services/tortaService');
const { obtenerUserIdDesdeRequest } = require('../middleware/authMiddleware');

exports.crearTorta = async (req, res) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req, res);
    if (!userId) return;
    const { nombre_torta, descripcion_torta } = req.body;
    const imagen = req.file ? `uploads/${req.file.filename}` : null;

    const torta = await tortaService.crearTorta({ nombre_torta, descripcion_torta, imagen, userId });

    res.json({ success: true, torta });
  } catch (error) {
    console.error('Error al crear la torta:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.obtenerTortas = async (req, res) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req, res);
    if (!userId) return;
    const tortas = await tortaService.obtenerTortasPorUsuario(userId);
    res.json(tortas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.obtenerTortasConPrecios = async (req, res) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req, res);
    if (!userId) return;

    const tortasConPrecio = await tortaService.obtenerTortasConPrecioPorUsuario(userId);
    res.json(tortasConPrecio);
  } catch (error) {
    console.error('Error al obtener las tortas con precio:', error);
    res.status(500).json({ error: 'Error al obtener las tortas con precio' });
  }
};

exports.editarTorta = async (req, res) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req, res);
    if (!userId) return;
    const { id } = req.params;
    const { nombre_torta, descripcion_torta } = req.body;
    const imagen = req.file ? `uploads/${req.file.filename}` : null;

    const torta = await tortaService.editarTorta({ id, nombre_torta, descripcion_torta, imagen, userId });

    res.json({ success: true, torta });
  } catch (error) {
    if (error.status === 403) {
      return res.status(403).json({ error: 'Torta no pertenece al usuario' });
    }
    if (error.status === 404) {
      return res.status(404).json({ error: 'Torta no encontrada' });
    }
    console.error('Error al editar la torta:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.eliminarTorta = async (req, res) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req, res);
    if (!userId) return;
    const { id } = req.params;

    await tortaService.eliminarTorta(id, userId);

    res.json({ success: true });
  } catch (error) {
    if (error.status === 403) {
      return res.status(403).json({ error: 'Torta no pertenece al usuario' });
    }
    if (error.status === 404) {
      return res.status(404).json({ error: 'Torta no encontrada' });
    }
    console.error('Error al eliminar la torta:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
