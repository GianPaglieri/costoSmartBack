const Torta = require('../models/Torta');

// Controlador para obtener todas las tortas
exports.obtenerTortas = (req, res) => {
  Torta.findAll()
    .then((tortas) => {
      res.json(tortas);
    })
    .catch((error) => {
      console.error('Error al obtener las tortas:', error);
      res.status(500).json({ error: 'Error al obtener las tortas' });
    });
};

// Controlador para crear una nueva torta
exports.crearTorta = (req, res) => {
  const { nombre_torta, descripcion_torta } = req.body;

  if (!nombre_torta || !descripcion_torta) {
    return res.status(400).json({ error: 'Faltan campos requeridos para crear la torta' });
  }

  Torta.create({
    nombre_torta,
    descripcion_torta,
  })
    .then(() => {
      console.log('Torta creada exitosamente');
      res.json({ success: true });
    })
    .catch((error) => {
      console.error('Error al crear la torta:', error);
      res.status(500).json({ error: 'Error al crear la torta' });
    });
};

exports.guardarTorta = (req, res) => {
  const { nombre_torta, descripcion_torta } = req.body;

  if (!nombre_torta || !descripcion_torta) {
    return res.status(400).json({ error: 'Faltan campos requeridos para crear la torta' });
  }

  Torta.create({
    nombre_torta,
    descripcion_torta,
  })
    .then(() => {
      console.log('Torta guardada exitosamente');
      res.json({ success: true });
    })
    .catch((error) => {
      console.error('Error al guardar la torta:', error);
      res.status(500).json({ error: 'Error al guardar la torta' });
    });
};

// Controlador para editar una torta existente
exports.editarTorta = (req, res) => {
  const { id } = req.params;
  const { nombre_torta, descripcion_torta } = req.body;

  if (!nombre_torta || !descripcion_torta) {
    return res.status(400).json({ error: 'Faltan campos requeridos para editar la torta' });
  }

  Torta.update(
    {
      nombre_torta,
      descripcion_torta,
    },
    {
      where: { ID_TORTA: id },
    }
  )
    .then(() => {
      console.log('Torta editada exitosamente');
      res.json({ success: true });
    })
    .catch((error) => {
      console.error('Error al editar la torta:', error);
      res.status(500).json({ error: 'Error al editar la torta' });
    });
};

// Controlador para eliminar una torta
exports.eliminarTorta = (req, res) => {
  const { id } = req.params;

  Torta.destroy({
    where: { ID_TORTA: id },
  })
    .then(() => {
      console.log('Torta eliminada exitosamente');
      res.json({ success: true });
    })
    .catch((error) => {
      console.error('Error al eliminar la torta:', error);
      res.status(500).json({ error: 'Error al eliminar la torta' });
    });
};








