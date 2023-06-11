const Ingrediente = require('../models/Ingrediente');

// Controlador para obtener todos los ingredientes
exports.obtenerIngredientes = (req, res) => {
  Ingrediente.findAll({
    attributes: ['id', 'nombre', 'unidad_Medida', 'tamano_Paquete', 'costo', 'CantidadStock']
  })
    .then((ingredientes) => {
      res.json(ingredientes);
    })
    .catch((error) => {
      console.error('Error al obtener los ingredientes:', error);
      res.status(500).json({ error: 'Error al obtener los ingredientes' });
    });
};

// Controlador para guardar un nuevo ingrediente
exports.guardarIngrediente = (req, res) => {
  const { nombre, unidad_Medida, tamano_Paquete, costo, CantidadStock } = req.body;
  console.log('Datos del ingrediente:', req.body);
  Ingrediente.create({
    nombre,
    unidad_Medida,
    tamano_Paquete,
    costo,
    CantidadStock,
  })
    .then(() => {
      console.log('Ingrediente guardado exitosamente');
      res.json({ success: true });
    })
    .catch((error) => {
      console.error('Error al guardar el ingredientea:', error, req.body);
      console.log('Datos del ingrediente:', req.body);
      res.status(500).json({ error: 'Error al guardar el ingredientes' , error , reqbody});
    });
};





