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

exports.guardarIngrediente = (req, res) => {
  const { nombre, unidad_Medida, tamano_Paquete, costo, CantidadStock } = req.body;
  console.log('Datos del ingrediente:', req.body);

  if (!nombre || !unidad_Medida || !tamano_Paquete || !costo || !CantidadStock) {
    return res.status(400).json({ error: 'Faltan campos requeridos para guardar el ingrediente' });
  }

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
      console.error('Error al guardar el ingrediente:', error);
      res.status(500).json({ error: 'Error al guardar el ingrediente' });
    });
};

exports.editarIngrediente = (req, res) => {
  const { id } = req.params; // Obtener el ID del ingrediente de los parámetros de la URL
  const { nombre, unidad_Medida, tamano_Paquete, costo, CantidadStock } = req.body;
  console.log('Datos del ingrediente:', req.body);

  if (!nombre || !unidad_Medida || !tamano_Paquete || !costo || !CantidadStock) {
    return res.status(400).json({ error: 'Faltan campos requeridos para editar el ingrediente' });
  }

  Ingrediente.update(
    {
      nombre,
      unidad_Medida,
      tamano_Paquete,
      costo,
      CantidadStock,
    },
    {
      where: { id },
    }
  )
    .then(() => {
      console.log('Ingrediente editado exitosamente');
      res.json({ success: true });
    })
    .catch((error) => {
      console.error('Error al editar el ingrediente:', error);
      res.status(500).json({ error: 'Error al editar el ingrediente' });
    });
};
exports.obtenerIngredientesMenosStock = (req, res) => {
  Ingrediente.findAll({
    attributes: ['id', 'nombre', 'unidad_Medida', 'tamano_Paquete', 'costo', 'CantidadStock'],
    order: [['CantidadStock', 'ASC']], // Ordenar por cantidad de stock de menor a mayor
    limit: 5, // Limitar a 5 resultados
  })
    .then((ingredientes) => {
      res.json(ingredientes);
    })
    .catch((error) => {
      console.error('Error al obtener los ingredientes con menos stock:', error);
      res.status(500).json({ error: 'Error al obtener los ingredientes con menos stock' });
    });
};
exports.eliminarIngrediente = (req, res) => {
  const { id } = req.params; // Obtener el ID del ingrediente de los parámetros de la URL

  Ingrediente.destroy({
    where: { id },
  })
    .then(() => {
      console.log('Ingrediente eliminado exitosamente');
      res.json({ success: true });
    })
    .catch((error) => {
      console.error('Error al eliminar el ingrediente:', error);
      res.status(500).json({ error: 'Error al eliminar el ingrediente' });
    });
};







