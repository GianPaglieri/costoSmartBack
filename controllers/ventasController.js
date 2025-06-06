const { actualizarStockIngredientes } = require('../services/actualizacionStock');
const Receta = require('../models/Receta');
const Venta = require('../models/Venta');
const Torta = require('../models/Torta');
const Ingrediente = require('../models/Ingrediente');
const Usuario = require('../models/User');
const { calcularGanancias } = require('../services/gananciasService');
const ListaPrecios = require('../models/ListaPrecios');
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');

const obtenerUserId = (req) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    throw new Error('Token de autenticación no proporcionado');
  }

  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, 'secreto');
  return decoded.userId;
};

// Obtener el rango de los últimos 7 días y el período anterior
const getLast7DaysRange = () => {
  const now = new Date();
  const currentEnd = new Date(now);
  const currentStart = new Date(now);
  currentStart.setDate(currentStart.getDate() - 6); // Últimos 7 días (incluyendo hoy)
  currentStart.setHours(0, 0, 0, 0);
  currentEnd.setHours(23, 59, 59, 999);

  const lastPeriodStart = new Date(currentStart);
  lastPeriodStart.setDate(lastPeriodStart.getDate() - 7);
  const lastPeriodEnd = new Date(currentEnd);
  lastPeriodEnd.setDate(lastPeriodEnd.getDate() - 7);

  return {
    current: { start: currentStart, end: currentEnd },
    last: { start: lastPeriodStart, end: lastPeriodEnd }
  };
};

exports.obtenerVentas = async (req, res) => {
  try {
    const userId = obtenerUserId(req);

    const ventas = await Venta.findAll({
      include: [{
        model: Torta,
        attributes: ['ID_TORTA', [Sequelize.literal('Tortum.nombre_torta'), 'nombre_torta']],
        as: 'Tortum',
        where: { ID_TORTA: Sequelize.col('Venta.ID_TORTA') }
      }],
      where: { id_usuario: userId }
    });

    const ventasConTorta = ventas.map((venta) => ({
      ID: venta.ID,
      ID_TORTA: venta.ID_TORTA,
      precio_torta: venta.precio_torta,
      fecha_venta: venta.fecha_venta, 
      Torta: venta.Tortum
    }));

    res.json(ventasConTorta);
  } catch (error) {
    console.error('Error al obtener las ventas:', error);
    res.status(500).json({ error: 'Error al obtener las ventas' });
  }
};

exports.registrarVenta = async (req, res) => {
  const { id_torta } = req.body;

  if (typeof id_torta === 'undefined') {
    return res.status(400).json({ success: false, error: 'El campo id_torta es requerido' });
  }

  try {
    const userId = obtenerUserId(req);
    if (typeof userId === 'undefined') {
      return res.status(400).json({ success: false, error: 'El usuario no está autenticado' });
    }

    const precioTortaData = await ListaPrecios.findOne({ where: { id_torta } });
    if (!precioTortaData) {
      throw new Error('No se encontró el precio de la torta en lista_precios');
    }

    const receta = await Receta.findOne({ where: { ID_TORTA: id_torta } });
    if (!receta) {
      throw new Error('No se encontró la receta');
    }

    const ingredientesSuficientes = await verificarStockIngredientes(receta.ID_TORTA, userId);
    if (!ingredientesSuficientes) {
      throw new Error('No hay suficientes ingredientes en stock para realizar la venta');
    }

    const venta = await Venta.create({
      ID_TORTA: id_torta,
      precio_torta: precioTortaData.costo_total,
      fecha_venta: new Date(),
      id_usuario: userId
    });
    
    await actualizarStockIngredientes(id_torta, userId);
    res.json({ success: true, venta });
  } catch (error) {
    console.error('Error al registrar la venta:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const verificarStockIngredientes = async (idTorta, userId) => {
  try {
    const recetas = await Receta.findAll({ 
      where: { id_torta: idTorta, id_usuario: userId } 
    });

    if (!recetas || recetas.length === 0) {
      throw new Error('No se encontraron recetas para la torta');
    }

    for (const receta of recetas) {
      const ingrediente = await Ingrediente.findByPk(receta.ID_INGREDIENTE);
      if (!ingrediente) {
        throw new Error('No se encontró el ingrediente');
      }
      if (ingrediente.CantidadStock < receta.cantidad) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error al verificar el stock de ingredientes:', error);
    throw error;
  }
};

exports.obtenerCantidadVentas = async (req, res) => {
  try {
    const userId = obtenerUserId(req);
    const cantidadVentas = await Venta.count({ where: { id_usuario: userId } });
    res.json({ cantidadVentas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener la cantidad de ventas.' });
  }
};

exports.obtenerGanancias = async (req, res) => {
  try {
    const userId = obtenerUserId(req);
    const ganancias = await calcularGanancias(userId);
    res.json({ ganancias });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener las ganancias.' });
  }
};

exports.obtenerCantidadVentasSemana = async (req, res) => {
  try {
    const userId = obtenerUserId(req);
    const { current } = getLast7DaysRange();
    
    const cantidadVentas = await Venta.count({
      where: {
        id_usuario: userId,
        fecha_venta: { 
          [Sequelize.Op.between]: [current.start, current.end] 
        }
      }
    });

    res.json({ cantidadVentas });
  } catch (error) {
    console.error('Error al obtener ventas semanales:', error);
    res.status(500).json({ error: 'Error al obtener la cantidad de ventas' });
  }
};

exports.obtenerPorcentajeVentas = async (req, res) => {
  try {
    const userId = obtenerUserId(req);
    const { current, last } = getLast7DaysRange();

    const [ventasActual, ventasAnterior] = await Promise.all([
      Venta.count({
        where: {
          id_usuario: userId,
          fecha_venta: { [Sequelize.Op.between]: [current.start, current.end] }
        }
      }),
      Venta.count({
        where: {
          id_usuario: userId,
          fecha_venta: { [Sequelize.Op.between]: [last.start, last.end] }
        }
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

    res.json({
      ventasActual,
      ventasAnterior,
      porcentajeCambio: porcentaje,
      rangos: {
        actual: {
          start: current.start.toISOString(),
          end: current.end.toISOString()
        },
        anterior: {
          start: last.start.toISOString(),
          end: last.end.toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Error al calcular porcentaje de ventas:', error);
    res.status(500).json({ error: 'Error al calcular porcentaje de ventas' });
  }
};