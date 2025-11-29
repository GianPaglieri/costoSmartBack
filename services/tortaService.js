// services/tortaService.js

const Torta = require('../models/Torta');
const Receta = require('../models/Receta');
const ListaPrecios = require('../models/ListaPrecios');
const Venta = require('../models/Venta');
const { calcularCostoTotalReceta, actualizarListaPrecios, calcularPrecioLista } = require('../services/calculadoraCostos');
const recetaService = require('../services/recetaServices');

const normalizarMargen = (valor) => {
  if (valor === undefined || valor === null || valor === '') {
    return 0;
  }

  const margen = Number(valor);
  if (Number.isNaN(margen) || margen < 0) {
    throw new Error('Porcentaje de ganancia invalido');
  }

  return margen;
};

exports.crearTorta = async ({ nombre_torta, descripcion_torta, imagen, porcentaje_ganancia, userId }) => {
  if (!nombre_torta || !descripcion_torta) {
    throw new Error('Faltan campos requeridos para crear la torta');
  }

  const margen = normalizarMargen(porcentaje_ganancia);

  const tortaNueva = await Torta.create({
    nombre_torta,
    descripcion_torta,
    imagen,
    porcentaje_ganancia: margen,
    id_usuario: userId,
  });

  // Crear receta automatica al crear la torta
  await recetaService.crearRecetaAutomatica(tortaNueva.ID_TORTA, userId);

  // Calcular costo total luego de tener receta base
  const costoRecetaAutomatica = await calcularCostoTotalReceta(
    tortaNueva.ID_TORTA,
    userId
  );
  const precioLista = calcularPrecioLista(costoRecetaAutomatica, tortaNueva.porcentaje_ganancia);

  // Crear o actualizar lista de precios
  const [listaPrecio, creado] = await ListaPrecios.findOrCreate({
    where: { id_torta: tortaNueva.ID_TORTA, id_usuario: userId },
    defaults: {
      nombre_torta: tortaNueva.nombre_torta,
      costo_total: costoRecetaAutomatica,
      precio_lista: precioLista,
      id_usuario: userId,
    },
  });

  if (!creado) {
    await listaPrecio.update({
      nombre_torta: tortaNueva.nombre_torta,
      costo_total: costoRecetaAutomatica,
      precio_lista: precioLista,
    });
  }

  return tortaNueva;
};

exports.obtenerTortasPorUsuario = async (userId) => {
  return await Torta.findAll({
    where: { id_usuario: userId },
    order: [['ID_TORTA', 'ASC']],
  });
};

exports.obtenerTortasConPrecioPorUsuario = async (userId) => {
  const tortas = await Torta.findAll({ where: { id_usuario: userId } });
  const preciosTortas = await ListaPrecios.findAll({ where: { id_usuario: userId } });

  return tortas.map((torta) => {
    const precioTorta = preciosTortas.find((precio) => precio.id_torta === torta.ID_TORTA);

    return {
      ID_TORTA: torta.ID_TORTA,
      nombre_torta: torta.nombre_torta,
      descripcion_torta: torta.descripcion_torta,
      imagen: torta.imagen,
      porcentaje_ganancia: torta.porcentaje_ganancia,
      costo_total: precioTorta ? precioTorta.costo_total : null,
      precio_lista: precioTorta ? precioTorta.precio_lista : null,
      precio: precioTorta ? precioTorta.precio_lista : null,
    };
  });
};

exports.editarTorta = async ({ id, nombre_torta, descripcion_torta, imagen, porcentaje_ganancia, userId }) => {
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

  const margen = porcentaje_ganancia !== undefined ? normalizarMargen(porcentaje_ganancia) : torta.porcentaje_ganancia;

  await torta.update({
    nombre_torta: nombre_torta || torta.nombre_torta,
    descripcion_torta: descripcion_torta || torta.descripcion_torta,
    imagen: imagen || torta.imagen,
    porcentaje_ganancia: margen,
  });

  await ListaPrecios.update(
    {
      nombre_torta: torta.nombre_torta,
    },
    { where: { id_torta: id, id_usuario: userId } }
  );

  await actualizarListaPrecios(torta.nombre_torta, userId);

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
  await Venta.destroy({ where: { ID_TORTA: id, id_usuario: userId } });
  await Torta.destroy({ where: { ID_TORTA: id, id_usuario: userId } });
};
