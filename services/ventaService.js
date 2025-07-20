const Receta = require('../models/Receta');
const Venta = require('../models/Venta');
const Torta = require('../models/Torta');
const Ingrediente = require('../models/Ingrediente');
const ListaPrecios = require('../models/ListaPrecios');
const { actualizarStockIngredientes } = require('../services/actualizacionStock');
const { calcularGanancias } = require('../services/gananciasService');
const Sequelize = require('sequelize');

// Obtener ventas
exports.obtenerVentas = async (userId) => {
  const ventas = await Venta.findAll({
    include: [{
      model: Torta,
      attributes: ['ID_TORTA', [Sequelize.literal('Tortum.nombre_torta'), 'nombre_torta']],
      as: 'Tortum',
      where: { ID_TORTA: Sequelize.col('Venta.ID_TORTA') }
    }],
    where: { id_usuario: userId }
  });

  return ventas.map((venta) => ({
    ID: venta.ID,
    ID_TORTA: venta.ID_TORTA,
    precio_torta: venta.precio_torta,
    fecha_venta: venta.fecha_venta, 
    Torta: venta.Tortum
  }));
};

// Registrar venta
exports.registrarVenta = async ({ id_torta, userId }) => {
  if (!id_torta) throw new Error('El campo id_torta es requerido');

  const precioTortaData = await ListaPrecios.findOne({
    where: { id_torta, id_usuario: userId }
  });
  if (!precioTortaData) throw new Error('No se encontró el precio de la torta en lista_precios');

  const receta = await Receta.findOne({
    where: { ID_TORTA: id_torta, id_usuario: userId }
  });
  if (!receta) throw new Error('No se encontró la receta');

  const ingredientesSuficientes = await verificarStockIngredientes(id_torta, userId);
  if (!ingredientesSuficientes) throw new Error('No hay suficientes ingredientes en stock para realizar la venta');

  const venta = await Venta.create({
    ID_TORTA: id_torta,
    precio_torta: precioTortaData.costo_total,
    fecha_venta: new Date(),
    id_usuario: userId
  });

  await actualizarStockIngredientes(id_torta, userId);
  return venta;
};

// Verificación de stock antes de vender
const verificarStockIngredientes = async (idTorta, userId) => {
  const recetas = await Receta.findAll({
    where: { id_torta: idTorta, id_usuario: userId }
  });
  if (!recetas || recetas.length === 0) throw new Error('No se encontraron recetas para la torta');

  for (const receta of recetas) {
    const ingrediente = await Ingrediente.findOne({
      where: { id: receta.ID_INGREDIENTE, id_usuario: userId }
    });
    if (!ingrediente) throw new Error('No se encontró el ingrediente');
    if (ingrediente.CantidadStock < receta.cantidad) return false;
  }

  return true;
};

// Cantidad de ventas
exports.obtenerCantidadVentas = async (userId) => {
  return await Venta.count({ where: { id_usuario: userId } });
};

// Cantidad ventas semana
exports.obtenerCantidadVentasSemana = async (userId, currentRange) => {
  return await Venta.count({
    where: {
      id_usuario: userId,
      fecha_venta: { [Sequelize.Op.between]: [currentRange.start, currentRange.end] }
    }
  });
};

// Obtener ganancias
exports.obtenerGanancias = async (userId) => {
  return await calcularGanancias(userId);
};

// Porcentaje de ventas semanales
exports.obtenerPorcentajeVentas = async (userId, current, last) => {
  const [ventasActual, ventasAnterior] = await Promise.all([
    Venta.count({
      where: { id_usuario: userId, fecha_venta: { [Sequelize.Op.between]: [current.start, current.end] } }
    }),
    Venta.count({
      where: { id_usuario: userId, fecha_venta: { [Sequelize.Op.between]: [last.start, last.end] } }
    })
  ]);

  let porcentaje;
  if (ventasAnterior === 0) {
    porcentaje = ventasActual > 0 ? '+∞%' : '0%';
  } else {
    const change = ((ventasActual - ventasAnterior) / ventasAnterior) * 100;
    porcentaje = `${Math.round(change)}%`;
    if (change > 0) porcentaje = `+${porcentaje}`;
  }

  return { ventasActual, ventasAnterior, porcentaje };
};
