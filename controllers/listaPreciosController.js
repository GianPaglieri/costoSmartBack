const Sequelize = require('sequelize');
const ListaPrecios = require('../models/ListaPrecios');
const Receta = require('../models/Receta');
const Torta = require('../models/Torta');
const Ingrediente = require('../models/Ingrediente');

const { calcularCostoTotalReceta } = require('../services/calculadoraCostos');



exports.actualizarCostoTotalReceta = async (req, res, next) => {
  try {
    const { idTorta } = req.body;
    const userId = req.userId;

    const receta = await Receta.findOne({
      where: { ID_TORTA: idTorta, id_usuario: userId }
    });

    if (!receta) {
      throw new Error('No se encontró la receta');
    }

    const costoTotal = await calcularCostoTotalReceta(idTorta, userId);

    await ListaPrecios.upsert({
      id_torta: receta.ID_TORTA,
      nombre_torta: receta.nombre_torta,
      costo_total: costoTotal,
      id_usuario: userId
    });

    res.status(200).json({ message: 'Costo total de la receta actualizado correctamente' });
  } catch (error) {
    next(error);
  }
};

exports.obtenerListaPreciosConImagen = async (req, res, next) => {
  try {
    const userId = req.userId;

    const listaPrecios = await ListaPrecios.findAll({ where: { id_usuario: userId } });

    const listaPreciosConImagen = await Promise.all(listaPrecios.map(async (item) => {
      const torta = await Torta.findOne({ where: { ID_TORTA: item.id_torta } });

      return {
        ...item.toJSON(),
        imagen_torta: torta.imagen
      };
    }));

    res.json(listaPreciosConImagen);
  } catch (error) {
    next(error);
  }
};
