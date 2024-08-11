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
  // Verificar si el token existe en las cabeceras de la solicitud
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    throw new Error('Token de autenticación no proporcionado');
  }

  // Extraer el token de las cabeceras de la solicitud
  const token = req.headers.authorization.split(' ')[1];

  // Verificar y decodificar el token
  const decoded = jwt.verify(token, 'secreto');

  // Obtener el ID de usuario del token decodificado
  return decoded.userId;
};


exports.obtenerVentas = async (req, res) => {
  try {
    const userId = obtenerUserId(req); // Obtener el ID de usuario autenticado

    // Buscar todas las ventas asociadas al usuario autenticado
    const ventas = await Venta.findAll({
      include: [{
        model: Torta,
        attributes: [
          'ID_TORTA',
          [Sequelize.literal('Tortum.nombre_torta'), 'nombre_torta'],
        ],
        as: 'Tortum', // Utiliza el alias 'Tortum' que definiste en la asociación
        where: { ID_TORTA: Sequelize.col('Venta.ID_TORTA') }
      }],
      where: { id_usuario: userId } // Filtrar por el ID de usuario
    });

    // Formatear y enviar las ventas como respuesta
    const ventasConTorta = ventas.map((venta) => ({
      ID: venta.ID,
      ID_TORTA: venta.ID_TORTA,
      precio_torta: venta.precio_torta,
      fecha_venta: venta.fecha_venta, 
      Torta: venta.Tortum // Usa el mismo alias aquí
    }));

    res.json(ventasConTorta);
  } catch (error) {
    console.error('Error al obtener las ventas:', error);
    res.status(500).json({ error: 'Error al obtener las ventas' });
  }
};

exports.registrarVenta = async (req, res) => {
  const { id_torta } = req.body;

  console.log('Datos recibidos en la solicitud:', req.body);
  if (typeof id_torta === 'undefined') {
    return res.status(400).json({ success: false, error: 'El campo id_torta es requerido' });
  }

  try {
    // Verificar si el token existe en las cabeceras de la solicitud
    const userId = obtenerUserId(req);
if (typeof userId === 'undefined') {
  return res.status(400).json({ success: false, error: 'El usuario no está autenticado' });
}
    console.log('Obteniendo el precio de la torta con id_torta:', id_torta);

    // Buscar el precio de la torta en lista_precios
    const precioTortaData = await ListaPrecios.findOne({ where: { id_torta } });

    if (!precioTortaData) {
      throw new Error('No se encontró el precio de la torta en lista_precios');
    }

    const precioTorta = precioTortaData.costo_total; // Obtiene el precio de la torta
    console.log(precioTorta);
    console.log('Creando nueva venta con id_torta:', id_torta);

    // Obtener la receta correspondiente al ID_TORTA
    const receta = await Receta.findOne({ where: { ID_TORTA: id_torta } });

    if (!receta) {
      throw new Error('No se encontró la receta');
    }

    // Verificar si hay suficientes ingredientes en stock
    const ingredientesSuficientes = await verificarStockIngredientes(receta.ID_TORTA, userId);

    if (!ingredientesSuficientes) {
      throw new Error('No hay suficientes ingredientes en stock para realizar la venta');
    }

    // Crea la venta con el precio de la torta y el ID del usuario autenticado
    const venta = await Venta.create({
      ID_TORTA: id_torta,
      precio_torta: precioTorta,
      fecha_venta: new Date(), // Agregamos la fecha actual
      id_usuario: userId // Asignamos el ID del usuario autenticado
    });

    console.log('Venta creada:', venta);

    res.json({ success: true, venta });
  } catch (error) {
    console.error('Error al registrar la venta:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const verificarStockIngredientes = async (idTorta, userId) => {
  try {
    const recetas = await Receta.findAll({ 
      where: { 
        id_torta: idTorta,
        id_usuario: userId // Agregar condición para filtrar por usuario autenticado
      } 
    });

    if (!recetas || recetas.length === 0) {
      throw new Error('No se encontraron recetas para la torta');
    }

    for (const receta of recetas) {
      const idIngrediente = receta.ID_INGREDIENTE;
      const cantidadRequerida = receta.cantidad;

      const ingrediente = await Ingrediente.findByPk(idIngrediente);

      if (!ingrediente) {
        throw new Error('No se encontró el ingrediente');
      }

      const cantidadActual = ingrediente.CantidadStock;

      if (cantidadActual < cantidadRequerida) {
        return false; // Retorna falso si no hay suficientes ingredientes en stock
      }
    }

    return true; // Retorna verdadero si hay suficientes ingredientes en stock
  } catch (error) {
    console.error('Error al verificar el stock de ingredientes:', error);
    throw error;
  }
};

exports.obtenerCantidadVentas = async (req, res) => {
  try {
    const userId = obtenerUserId(req); // Obtener el ID de usuario autenticado

    // Ahora que tenemos el ID de usuario autenticado, podemos filtrar las ventas por este ID
    const cantidadVentas = await Venta.count({ where: { id_usuario: userId } }); // Filtrar por el ID de usuario autenticado
    res.json({ cantidadVentas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener la cantidad de ventas.' });
  }
};

exports.obtenerGanancias = async (req, res) => {
  try {
    const userId = obtenerUserId(req); // Obtener el ID de usuario autenticado

    // Ahora que tenemos el ID de usuario autenticado, podemos calcular las ganancias asociadas a este usuario
    const ganancias = await calcularGanancias(userId); // Pasar el ID de usuario como argumento a la función calcularGanancias
    res.json({ ganancias });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener las ganancias.' });
  }
};

exports.obtenerCantidadVentasSemana = async (req, res) => {
  try {
    const userId = obtenerUserId(req); // Obtener el ID de usuario autenticado

    const today = new Date();
    console.log('Fecha actual:', today);

    const dayOfWeek = today.getDay(); // 0 para Domingo, 1 para Lunes, ..., 6 para Sábado
    console.log('Día de la semana actual:', dayOfWeek);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek); // Establecer el inicio de la semana en el día actual menos el día de la semana actual
    startOfWeek.setHours(0, 0, 0, 0); // Establecer la hora a las 00:00:00
    console.log('Inicio de la semana actual:', startOfWeek);

    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - dayOfWeek)); // Establecer el final de la semana en el día actual más los días restantes hasta el sábado
    endOfWeek.setHours(23, 59, 59, 999); // Establecer la hora a las 23:59:59
    console.log('Fin de la semana actual:', endOfWeek);

    const cantidadVentasSemana = await Venta.count({
      where: {
        id_usuario: userId, // Filtrar por el ID de usuario
        fecha_venta: {
          [Sequelize.Op.between]: [startOfWeek.toISOString().split('T')[0], endOfWeek.toISOString().split('T')[0]]
        }
      }
    });

    console.log('Cantidad de ventas de la semana actual:', cantidadVentasSemana);

    res.json({ cantidadVentasSemana });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener la cantidad de ventas de la semana.' });
  }
};

exports.obtenerPorcentajeVentas = async (req, res) => {
  try {
    const userId = obtenerUserId(req); // Obtener el ID de usuario autenticado

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 para Domingo, 1 para Lunes, ..., 6 para Sábado

    // Calcular las fechas de inicio y fin de la semana actual
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - dayOfWeek));
    endOfWeek.setHours(23, 59, 59, 999);

    // Calcular las fechas de inicio y fin de la semana anterior
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const endOfLastWeek = new Date(endOfWeek);
    endOfLastWeek.setDate(endOfLastWeek.getDate() - 7);

    // Contar las ventas de la semana actual
    const ventasSemanaActual = await Venta.count({
      where: {
        id_usuario: userId, // Filtrar por el ID de usuario
        fecha_venta: {
          [Sequelize.Op.between]: [startOfWeek.toISOString().split('T')[0], endOfWeek.toISOString().split('T')[0]]
        }
      }
    });

    // Contar las ventas de la semana anterior
    const ventasSemanaAnterior = await Venta.count({
      where: {
        id_usuario: userId, // Filtrar por el ID de usuario
        fecha_venta: {
          [Sequelize.Op.between]: [startOfLastWeek.toISOString().split('T')[0], endOfLastWeek.toISOString().split('T')[0]]
        }
      }
    });

    let porcentajeCambio = 0;
    if (ventasSemanaAnterior !== 0) {
      // Calcular el porcentaje de cambio y redondearlo a dos decimales
      porcentajeCambio = Math.round(((ventasSemanaActual - ventasSemanaAnterior) / ventasSemanaAnterior) * 100 * 100) / 100;
    } else if (ventasSemanaActual > 0) {
      // Si no hubo ventas en la semana anterior pero sí en la actual, indicar un aumento infinito
      porcentajeCambio = Infinity;
    }

    // Registrar la cantidad de ventas de la semana anterior en la consola
    console.log('Cantidad de ventas de la semana anterior:', ventasSemanaAnterior);

    res.json({ 
      ventasSemanaActual,
      ventasSemanaAnterior,
      porcentajeCambio 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener el porcentaje de cambio en las ventas.' });
  }
};