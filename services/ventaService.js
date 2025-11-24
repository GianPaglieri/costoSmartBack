const Receta = require('../models/Receta');
const Venta = require('../models/Venta');
const Torta = require('../models/Torta');
const Ingrediente = require('../models/Ingrediente');
const ListaPrecios = require('../models/ListaPrecios');
const { actualizarStockIngredientes } = require('../services/actualizacionStock');
const { calcularGanancias } = require('../services/gananciasService');
const Sequelize = require('sequelize');

const toNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const aggregateVentas = (ventas) => {
  const counts = new Map();
  const ingreso = ventas.reduce((acc, venta) => {
    const ingresoUnitario = toNumber(venta.precio_torta, 0);
    const idTorta = venta.ID_TORTA;
    if (idTorta !== null && idTorta !== undefined) {
      counts.set(idTorta, (counts.get(idTorta) || 0) + 1);
    }
    return acc + ingresoUnitario;
  }, 0);

  const uniqueIds = Array.from(counts.keys());
  return { ingreso, counts, ids: uniqueIds, cantidad: ventas.length };
};

const calcularCostos = (countsMap, costosPorTorta) => {
  let totalCosto = 0;
  for (const [idTorta, cantidad] of countsMap.entries()) {
    const costoUnitario = toNumber(costosPorTorta.get(idTorta)?.costo_total, 0);
    totalCosto += costoUnitario * cantidad;
  }
  return totalCosto;
};

// Obtener ventas (opcionalmente filtradas por rango)
exports.obtenerVentas = async (userId, range) => {
  const ventas = await Venta.findAll({
    include: [{
      model: Torta,
      attributes: ['ID_TORTA', [Sequelize.literal('Tortum.nombre_torta'), 'nombre_torta']],
      as: 'Tortum',
      where: { ID_TORTA: Sequelize.col('Venta.ID_TORTA') }
    }],
    where: {
      id_usuario: userId,
      ...(range?.start && range?.end
        ? { fecha_venta: { [Sequelize.Op.between]: [range.start, range.end] } }
        : {}),
    }
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
  const where = { id_usuario: userId };
  if (currentRange?.start && currentRange?.end) {
    where.fecha_venta = { [Sequelize.Op.between]: [currentRange.start, currentRange.end] };
  }
  return await Venta.count({ where });
};

// Obtener ganancias
exports.obtenerGanancias = async (userId, range) => {
  return await calcularGanancias(userId, range);
};

// Porcentaje de ventas semanales
exports.obtenerPorcentajeVentas = async (userId, current, last) => {
  const buildWhere = (range) => {
    const where = { id_usuario: userId };
    if (range?.start && range?.end) {
      where.fecha_venta = { [Sequelize.Op.between]: [range.start, range.end] };
    }
    return where;
  };

  const ventasActual = await Venta.count({ where: buildWhere(current) });

  let ventasAnterior = null;
  if (last?.start && last?.end) {
    ventasAnterior = await Venta.count({ where: buildWhere(last) });
  }

  let porcentaje = null;
  if (typeof ventasAnterior === 'number') {
    if (ventasAnterior === 0) {
      porcentaje = ventasActual > 0 ? null : 0;
    } else {
      const change = ((ventasActual - ventasAnterior) / ventasAnterior) * 100;
      porcentaje = Number.isFinite(change) ? Math.round(change * 100) / 100 : null;
    }
  }

  return { ventasActual, ventasAnterior, porcentaje };
};

exports.obtenerResumen = async (userId, currentRange, previousRange) => {
  // Traer ventas actuales y anteriores
  const [ventasActualesRaw, ventasAnterioresRaw] = await Promise.all([
    Venta.findAll({
      where: {
        id_usuario: userId,
        ...(currentRange?.start && currentRange?.end
          ? { fecha_venta: { [Sequelize.Op.between]: [currentRange.start, currentRange.end] } }
          : {}),
      },
      attributes: ['ID_TORTA', 'precio_torta'],
    }),
    previousRange?.start && previousRange?.end
      ? Venta.findAll({
          where: {
            id_usuario: userId,
            fecha_venta: { [Sequelize.Op.between]: [previousRange.start, previousRange.end] },
          },
          attributes: ['ID_TORTA', 'precio_torta'],
        })
      : [],
  ]);

  const aggActual = aggregateVentas(ventasActualesRaw);
  const aggAnterior = aggregateVentas(ventasAnterioresRaw);

  // Buscar costos para las tortas involucradas
  const idsTortas = Array.from(new Set([...aggActual.ids, ...aggAnterior.ids]));
  const costosPorTorta = new Map();
  const tortasPorId = new Map();
  if (idsTortas.length > 0) {
    const precios = await ListaPrecios.findAll({
      where: { id_usuario: userId, id_torta: { [Sequelize.Op.in]: idsTortas } },
      attributes: ['id_torta', 'costo_total', 'precio_lista'],
    });
    precios.forEach((p) => {
      costosPorTorta.set(p.id_torta, { costo_total: toNumber(p.costo_total, 0), precio_lista: toNumber(p.precio_lista, 0) });
    });

    const tortas = await Torta.findAll({
      where: { id_usuario: userId, ID_TORTA: { [Sequelize.Op.in]: idsTortas } },
      attributes: ['ID_TORTA', 'nombre_torta', 'imagen'],
    });
    tortas.forEach((t) => {
      const idNum = toNumber(t.ID_TORTA, t.ID_TORTA);
      tortasPorId.set(idNum, {
        id: idNum,
        nombre: t.nombre_torta,
        imagen: t.imagen,
      });
    });
  }

  const costoActual = calcularCostos(aggActual.counts, costosPorTorta);
  const costoAnterior = calcularCostos(aggAnterior.counts, costosPorTorta);
  const margenActual = aggActual.ingreso - costoActual;
  const margenAnterior = aggAnterior.ingreso - costoAnterior;

  const delta = (curr, prev) => {
    if (prev === null || prev === undefined) return null;
    if (prev === 0) return curr > 0 ? null : 0;
    const change = ((curr - prev) / prev) * 100;
    return Number.isFinite(change) ? Math.round(change * 100) / 100 : null;
  };

  // Distribución y top tortas (solo rango actual)
  const totalVentasActual = aggActual.cantidad || 0;
  const distribucion = Array.from(aggActual.counts.entries())
    .map(([id, count]) => {
      const info = tortasPorId.get(toNumber(id, id)) || {};
      const name = info.nombre || `Torta ${id}`;
      const costoUnit = toNumber(costosPorTorta.get(id)?.costo_total, 0);
      const precioLista = toNumber(costosPorTorta.get(id)?.precio_lista, 0);
      return {
        idTorta: toNumber(id, id),
        nombre: name,
        imagen: info.imagen || null,
        ventas: count,
        ingresos: precioLista * count,
        costo: costoUnit * count,
        participacion: totalVentasActual > 0 ? Math.round((count / totalVentasActual) * 1000) / 10 : 0,
      };
    })
    .sort((a, b) => b.ventas - a.ventas);

  const topTortas = distribucion.slice(0, 5);

  return {
    rangoActual: currentRange || null,
    rangoAnterior: previousRange || null,
    ventasActual: aggActual.cantidad,
    ventasAnterior: aggAnterior.cantidad,
    ingresosActual: aggActual.ingreso,
    ingresosAnterior: aggAnterior.ingreso,
    costosActual: costoActual,
    costosAnterior: costoAnterior,
    margenActual,
    margenAnterior,
    porcentajeVentas: delta(aggActual.cantidad, aggAnterior.cantidad),
    porcentajeIngresos: delta(aggActual.ingreso, aggAnterior.ingreso),
    porcentajeMargen: delta(margenActual, margenAnterior),
    distribucion,
    topTortas,
  };
};
