const ventaService = require('../services/ventaService');

// Obtener rango de fechas
const getLast7DaysRange = () => {
  const now = new Date();
  const currentEnd = new Date(now);
  const currentStart = new Date(now);
  currentStart.setDate(currentStart.getDate() - 6);
  currentStart.setHours(0, 0, 0, 0);
  currentEnd.setHours(23, 59, 59, 999);

  const lastPeriodStart = new Date(currentStart);
  lastPeriodStart.setDate(lastPeriodStart.getDate() - 7);
  const lastPeriodEnd = new Date(currentEnd);
  lastPeriodEnd.setDate(lastPeriodEnd.getDate() - 7);

  return { current: { start: currentStart, end: currentEnd }, last: { start: lastPeriodStart, end: lastPeriodEnd } };
};

exports.obtenerVentas = async (req, res, next) => {
  try {
    const userId = req.userId;
    const ventas = await ventaService.obtenerVentas(userId);
    res.json(ventas);
  } catch (error) {
    next(error);
  }
};

exports.registrarVenta = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { id_torta } = req.body;

    const venta = await ventaService.registrarVenta({ id_torta, userId });
    res.json({ success: true, venta });
  } catch (error) {
    next(error);
  }
};

exports.obtenerCantidadVentas = async (req, res, next) => {
  try {
    const userId = req.userId;
    const cantidad = await ventaService.obtenerCantidadVentas(userId);
    res.json({ cantidadVentas: cantidad });
  } catch (error) {
    next(error);
  }
};

exports.obtenerCantidadVentasSemana = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { current } = getLast7DaysRange();
    const cantidad = await ventaService.obtenerCantidadVentasSemana(userId, current);
    res.json({ cantidadVentas: cantidad });
  } catch (error) {
    next(error);
  }
};

exports.obtenerGanancias = async (req, res, next) => {
  try {
    const userId = req.userId;
    const ganancias = await ventaService.obtenerGanancias(userId);
    res.json({ ganancias });
  } catch (error) {
    next(error);
  }
};

exports.obtenerPorcentajeVentas = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { current, last } = getLast7DaysRange();
    const datos = await ventaService.obtenerPorcentajeVentas(userId, current, last);

    res.json({
      ventasActual: datos.ventasActual,
      ventasAnterior: datos.ventasAnterior,
      porcentajeCambio: datos.porcentaje,
      rangos: {
        actual: { start: current.start.toISOString(), end: current.end.toISOString() },
        anterior: { start: last.start.toISOString(), end: last.end.toISOString() }
      }
    });
  } catch (error) {
    next(error);
  }
};
