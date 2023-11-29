const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Receta = require('../models/Receta');
const Torta = require('../models/Torta');
const Ingrediente = require('../models/Ingrediente');



exports.obtenerRecetas = (req, res) => {
  Receta.findAll({
    include: [
      {
        model: Torta,
        attributes: ['nombre_torta'], // Puedes seleccionar los atributos que desees
      },
      {
        model: Ingrediente,
        attributes: ['Nombre'],
      },
    ],
  })
    .then((recetas) => {
      res.json(recetas);
    })
    .catch((error) => {
      console.error('Error al obtener las recetas:', error);
      res.status(500).json({ error: 'Error al obtener las recetas' });
    });
};

exports.guardarReceta = (req, res) => {
  const { ID_TORTA, nombre_receta, ID_INGREDIENTE, cantidad } = req.body;

  if (!ID_TORTA || !nombre_receta || !ID_INGREDIENTE || !cantidad) {
    return res.status(400).json({ error: 'Faltan campos requeridos para crear la receta' });
  }

  Receta.create({
    ID_TORTA,
    nombre_receta,
    ID_INGREDIENTE,
    cantidad,
  })
    .then(() => {
      console.log('Receta guardada exitosamente');
      res.json({ success: true });
    })
    .catch((error) => {
      console.error('Error al guardar la receta:', error);
      res.status(500).json({ error: 'Error al guardar la receta' });
    });
};

exports.editarOcrearReceta = async (req, res) => {
  try {
    const { ID_TORTA, ID_INGREDIENTE } = req.params;
    const { cantidad } = req.body;

    console.log('ID_TORTA:', ID_TORTA);
    console.log('ID_INGREDIENTE:', ID_INGREDIENTE);
    console.log('cantidad:', cantidad);

    let receta = await Receta.findOne({
      where: { ID_TORTA, ID_INGREDIENTE },
    });

    if (receta) {
      receta.cantidad = cantidad;
      await receta.save();
    } else {
      receta = await Receta.create({
        ID_TORTA,
        ID_INGREDIENTE,
        cantidad,
      });
    }

    res.json({ message: 'Receta editada o creada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* exports.agregarRelacion = async (req, res) => {
  try {
    const { ID_TORTA, ID_INGREDIENTE, cantidad } = req.body;

    await Receta.create({
      ID_TORTA,
      ID_INGREDIENTE,
      cantidad,
    });

    res.json({ message: 'Nueva relación agregada exitosamente' });
  } catch (error) {
    console.error('Error al agregar una nueva relación:', error);
    res.status(500).json({ error: error.message });
  }
}; */

exports.eliminarReceta = async (req, res) => {
  try {
    const { id } = req.params;

    const receta = await Receta.findByPk(id);
    if (!receta) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    await receta.destroy();

    await ListaPrecios.destroy({
      where: { ID_TORTA: id },
    });

    res.json({ message: 'Receta eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar la receta:', error);
    res.status(500).json({ error: error.message });
  }
};


