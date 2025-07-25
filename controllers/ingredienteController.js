const ingredienteService = require('../services/ingredienteService');
const { obtenerUserIdDesdeRequest } = require('../middleware/authMiddleware');

exports.obtenerIngredientes = async (req, res) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req, res);
    if (!userId) return;
    const ingredientes = await ingredienteService.obtenerIngredientes(userId);
    res.json({ success: true, ingredientes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.guardarIngrediente = async (req, res) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req, res);
    if (!userId) return;
    const { nombre, unidad_Medida, tamano_Paquete, costo, CantidadStock } = req.body;

    await ingredienteService.guardarIngrediente({ nombre, unidad_Medida, tamano_Paquete, costo, CantidadStock, userId });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.editarIngrediente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, unidad_Medida, tamano_Paquete, costo, CantidadStock } = req.body;

    const userId = obtenerUserIdDesdeRequest(req, res);
    if (!userId) return;

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
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.obtenerIngredientesMenosStock = async (req, res) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req, res);
    if (!userId) return;
    const ingredientes = await ingredienteService.obtenerIngredientesMenosStock(userId);
    res.json(ingredientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.eliminarIngrediente = async (req, res) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req, res);
    if (!userId) return;
    const { id } = req.params;

    await ingredienteService.eliminarIngrediente({ id, userId });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
