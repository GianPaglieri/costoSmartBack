const Receta = require('../models/Receta');
const Torta = require('../models/Torta');
const Ingrediente = require('../models/Ingrediente');
const ListaPrecios = require('../models/ListaPrecios');
const { calcularCostoTotalReceta } = require('../services/calculadoraCostos');

// Controlador para obtener todas las recetas
exports.obtenerRecetas = (req, res) => {
  Receta.findAll({
    
  })
    .then((recetas) => {
      res.json(recetas);
    })
    .catch((error) => {
      console.error('Error al obtener las recetas:', error);
      res.status(500).json({ error: 'Error al obtener las recetas' });
    });
};

// Funcion para crear una nueva receta
exports.crearReceta = async (req, res) => {
  try {
    const { ID_TORTA, nombre_torta, id_ingrediente, cantidad } = req.body;

    // Crea la receta en la tabla receta
    const nuevaReceta = await Receta.create({
      ID_TORTA,
      nombre_torta,
      id_ingrediente,
      cantidad,
    });

    // Calcula el costo total de la receta
    const costoTotal = await calcularCostoTotalReceta(nuevaReceta.id);

    // Crea una entrada en la tabla ListaPrecios con el costo total de la receta
    await ListaPrecios.create({
      ID_TORTA: nuevaReceta.id,
      nombre_torta: nuevaReceta.nombre_torta,
      costo_total: costoTotal,
    });

    res.status(201).json({ message: 'Receta creada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
