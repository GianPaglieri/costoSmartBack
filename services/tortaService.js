// services/tortaService.js

const Torta = require('../models/Torta');
const Receta = require('../models/Receta');
const ListaPrecios = require('../models/ListaPrecios');
const { calcularCostoTotalReceta, actualizarListaPrecios } = require('../services/calculadoraCostos');
const recetaService = require('../services/recetaServices');


exports.crearTorta = async ({ nombre_torta, descripcion_torta, imagen, userId }) => {
  if (!nombre_torta || !descripcion_torta) {
    throw new Error('Faltan campos requeridos para crear la torta');
  }

  const tortaNueva = await Torta.create({
    nombre_torta,
    descripcion_torta,
    imagen,
    id_usuario: userId
  });

    // Crear receta automática al crear la torta
  await recetaService.crearRecetaAutomatica(tortaNueva.ID_TORTA, userId);

  // Calcular costo total luego de tener receta base
  const costoRecetaAutomatica = await calcularCostoTotalReceta(
    tortaNueva.ID_TORTA,
    userId
  );

  // Crear o actualizar lista de precios
  const [listaPrecio, created] = await ListaPrecios.findOrCreate({
    where: { id_torta: tortaNueva.ID_TORTA, id_usuario: userId },
    defaults: {
      nombre_torta: tortaNueva.nombre_torta,
      costo_total: costoRecetaAutomatica,
      id_usuario: userId,
    },
  });

  if (!created) {
    await ListaPrecios.update(
      { costo_total: costoRecetaAutomatica },
      { where: { id_torta: tortaNueva.ID_TORTA, id_usuario: userId } }
      );
  }

  return tortaNueva;
};

exports.obtenerTortasPorUsuario = async (userId) => {
  return await Torta.findAll({
    where: { id_usuario: userId },
    order: [['ID_TORTA', 'ASC']]
  });
};

exports.obtenerTortasConPrecioPorUsuario = async (userId) => {
  const tortas = await Torta.findAll({ where: { id_usuario: userId } });
  const preciosTortas = await ListaPrecios.findAll({ where: { id_usuario: userId } });

  return tortas.map((torta) => {
    const precioTorta = preciosTortas.find(
      (precio) => precio.id_torta === torta.ID_TORTA
    );

    return {
      ID_TORTA: torta.ID_TORTA,
      nombre_torta: torta.nombre_torta,
      descripcion_torta: torta.descripcion_torta,
      imagen: torta.imagen,
      precio: precioTorta ? precioTorta.costo_total : null,
    };
  });
};

exports.editarTorta = async ({ id, nombre_torta, descripcion_torta, imagen, userId }) => {
  const torta = await Torta.findOne({ where: { ID_TORTA: id } });

  if (!torta) {
    const error = new Error('Torta no encontrada');
    error.status = 404;
    throw error;
  }

  if (torta.id_usuario !== userId) {
    const error = new Error('No autorizado');
    error.status = 403;
    throw error;
  }

  await torta.update({
    nombre_torta: nombre_torta || torta.nombre_torta,
    descripcion_torta: descripcion_torta || torta.descripcion_torta,
    imagen: imagen || torta.imagen
  });

  await ListaPrecios.update(
    {
      nombre_torta,
      imagen_torta: imagen
    },
    { where: { id_torta: id, id_usuario: userId } }
  );

  return torta;
};

exports.eliminarTorta = async (id, userId) => {
  const torta = await Torta.findOne({ where: { ID_TORTA: id } });

  if (!torta) {
    const error = new Error('Torta no encontrada');
    error.status = 404;
    throw error;
  }

  if (torta.id_usuario !== userId) {
    const error = new Error('No autorizado');
    error.status = 403;
    throw error;
  }

  await Receta.destroy({ where: { ID_TORTA: id, id_usuario: userId } });
  await ListaPrecios.destroy({ where: { id_torta: id, id_usuario: userId } });
  await Torta.destroy({ where: { ID_TORTA: id, id_usuario: userId } });
};
