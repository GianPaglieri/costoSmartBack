const ListaPrecios = require('../models/ListaPrecios');
const Receta = require('../models/Receta');
const Torta = require('../models/Torta');

const { calcularCostoTotalReceta, calcularPrecioLista } = require('../services/calculadoraCostos');

exports.actualizarCostoTotalReceta = async (req, res, next) => {
  try {
    const { idTorta } = req.body;
    const userId = req.userId;

    const receta = await Receta.findOne({
      where: { ID_TORTA: idTorta, id_usuario: userId },
    });

    if (!receta) {
      throw new Error('No se encontro la receta');
    }

    const torta = await Torta.findOne({ where: { ID_TORTA: idTorta, id_usuario: userId } });
    if (!torta) {
      throw new Error('Torta no encontrada');
    }

    const costoTotal = await calcularCostoTotalReceta(idTorta, userId);
    const precioLista = calcularPrecioLista(costoTotal, torta.porcentaje_ganancia);

    await ListaPrecios.upsert({
      id_torta: torta.ID_TORTA,
      nombre_torta: torta.nombre_torta,
      costo_total: costoTotal,
      precio_lista: precioLista,
      id_usuario: userId,
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

    const listaPreciosConImagen = await Promise.all(
      listaPrecios.map(async (item) => {
        const torta = await Torta.findOne({ where: { ID_TORTA: item.id_torta, id_usuario: userId } });

        return {
          ...item.toJSON(),
          imagen_torta: torta ? torta.imagen : null,
          porcentaje_ganancia: torta ? torta.porcentaje_ganancia : null,
        };
      })
    );

    res.json(listaPreciosConImagen);
  } catch (error) {
    next(error);
  }
};