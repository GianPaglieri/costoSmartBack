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

  const verificacionStock = await verificarStockIngredientes(id_torta, userId);
  if (!verificacionStock.ok) {
    const error = new Error('Faltan ingredientes para concretar la venta');
    error.status = 400;
    error.code = 'INGREDIENTES_INSUFICIENTES';
    error.details = verificacionStock.faltantes;
    throw error;
  }

  const venta = await Venta.create({
    ID_TORTA: id_torta,
    precio_torta: precioTortaData.precio_lista,
    fecha_venta: new Date(),
    id_usuario: userId
  });

  await actualizarStockIngredientes(id_torta, userId);
  return venta;
};

// Verificación de stock antes de vender
const verificarStockIngredientes = async (idTorta, userId) => {
  const recetas = await Receta.findAll({
    where: { ID_TORTA: idTorta, id_usuario: userId },
    include: [
      {
        model: Ingrediente,
        attributes: ['id', 'nombre', 'CantidadStock', 'unidad_Medida']
      }
    ]
  });
  if (!recetas || recetas.length === 0) throw new Error('No se encontraron recetas para la torta');

  const faltantes = [];

  for (const receta of recetas) {
    let ingrediente = receta.Ingrediente;
    if (!ingrediente) {
      ingrediente = await Ingrediente.findOne({
        where: { id: receta.ID_INGREDIENTE, id_usuario: userId }
      });
    }

    if (!ingrediente) throw new Error('No se encontró el ingrediente');

    const requerido = Number(receta.cantidad) || 0;
    const disponible = Number(ingrediente.CantidadStock) || 0;
    const deficit = Math.max(requerido - disponible, 0);

    if (deficit > 0) {
      faltantes.push({
        id: ingrediente.id ?? receta.ID_INGREDIENTE,
        nombre: ingrediente.nombre,
        disponible,
        requerido,
        faltante: deficit,
        unidad: ingrediente.unidad_Medida
      });
    }
  }

  return {
    ok: faltantes.length === 0,
    faltantes
  };
};

// Cantidad de ventas
exports.obtenerCantidadVentas = async (userId, range) => {
  const where = { id_usuario: userId };
  if (range?.start && range?.end) {
    where.fecha_venta = { [Sequelize.Op.between]: [range.start, range.end] };
  }
  return await Venta.count({ where });
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
exports.obtenerGanancias = async (userId, range) => {
  return await calcularGanancias(userId, range);
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
