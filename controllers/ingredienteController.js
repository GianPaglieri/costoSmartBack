const ingredienteService = require('../services/ingredienteService');
const { obtenerUserIdDesdeRequest } = require('../middleware/authMiddleware');

exports.obtenerIngredientes = async (req, res) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req);
    const ingredientes = await ingredienteService.obtenerIngredientes(userId);
    res.json({ success: true, ingredientes });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.guardarIngrediente = async (req, res) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req);
    const { nombre, unidad_Medida, tamano_Paquete, costo, CantidadStock } = req.body;

    await ingredienteService.guardarIngrediente({ nombre, unidad_Medida, tamano_Paquete, costo, CantidadStock, userId });

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.editarIngrediente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, unidad_Medida, tamano_Paquete, costo, CantidadStock } = req.body;

    const userId = obtenerUserIdDesdeRequest(req);

    await ingredienteService.editarIngrediente({
      id,
      nombre,
      unidad_Medida,
      tamano_Paquete,
      costo,
      CantidadStock,
      userId
    });

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.obtenerIngredientesMenosStock = async (req, res) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req);
    const ingredientes = await ingredienteService.obtenerIngredientesMenosStock(userId);
    res.json(ingredientes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.eliminarIngrediente = async (req, res) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req);
    const { id } = req.params;

    await ingredienteService.eliminarIngrediente({ id, userId });

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
