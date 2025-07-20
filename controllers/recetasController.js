// controllers/recetaController.js

const recetaService = require('../services/recetaServices');
const { obtenerUserIdDesdeRequest } = require('../middleware/authMiddleware');

exports.obtenerRecetas = async (req, res) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req);
    const recetas = await recetaService.obtenerRecetasPorUsuario(userId);
    res.json(recetas);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.crearOEditarReceta = async (req, res) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req);
    const { ID_TORTA, ID_INGREDIENTE } = req.params;
    const { total_cantidad } = req.body;

    await recetaService.crearOEditarReceta({
      ID_TORTA,
      ID_INGREDIENTE,
      total_cantidad,
      userId
    });

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.agregarRelacion = async (req, res) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req);
    const { ID_TORTA, ID_INGREDIENTE, cantidad } = req.body;

    await recetaService.agregarRelacion({ ID_TORTA, ID_INGREDIENTE, cantidad, userId });

    res.json({ message: 'Nueva relación agregada exitosamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.eliminarAsignacion = async (req, res) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req);
    const { ID_TORTA, ID_INGREDIENTE } = req.params;

    await recetaService.eliminarAsignacion({ ID_TORTA, ID_INGREDIENTE, userId });

    res.json({ message: 'Asignación de receta eliminada exitosamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.eliminarReceta = async (req, res) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req);
    const { ID_TORTA } = req.params;

    await recetaService.eliminarReceta({ ID_TORTA, userId });

    res.json({ message: 'Receta eliminada exitosamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Creación automática de receta con ingrediente Packaging
exports.crearRecetaAutomatica = async (idTorta, userId) => {
  try {
    await recetaService.crearRecetaAutomatica(idTorta, userId);
  } catch (error) {
    throw new Error(error.message);
  }
};
