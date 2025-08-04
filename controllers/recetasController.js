// controllers/recetaController.js

const recetaService = require('../services/recetaServices');

exports.obtenerRecetas = async (req, res, next) => {
  try {
    const userId = req.userId;
    const recetas = await recetaService.obtenerRecetasPorUsuario(userId);
    res.json(recetas);
  } catch (error) {
    next(error);
  }
};

exports.crearOEditarReceta = async (req, res, next) => {
  try {
    const userId = req.userId;
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
    next(error);
  }
};

exports.agregarRelacion = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { ID_TORTA, ID_INGREDIENTE, cantidad } = req.body;

    await recetaService.agregarRelacion({ ID_TORTA, ID_INGREDIENTE, cantidad, userId });

    res.json({ message: 'Nueva relación agregada exitosamente' });
  } catch (error) {
    next(error);
  }
};

exports.eliminarAsignacion = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { ID_TORTA, ID_INGREDIENTE } = req.params;

    await recetaService.eliminarAsignacion({ ID_TORTA, ID_INGREDIENTE, userId });

    res.json({ message: 'Asignación de receta eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
};

exports.eliminarReceta = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { ID_TORTA } = req.params;

    await recetaService.eliminarReceta({ ID_TORTA, userId });

    res.json({ message: 'Receta eliminada exitosamente' });
  } catch (error) {
    next(error);
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
