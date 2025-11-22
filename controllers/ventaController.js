const ventaService = require('../services/ventaService');

const RANGE_DAY_MAP = {
  '7': 7,
  '30': 30,
};

const normalizeRangeKey = (range) => {
  if (!range) return '7';
  const key = String(range).toLowerCase();
  if (key === 'all') return 'all';
  return RANGE_DAY_MAP[key] ? key : '7';
};

const buildRangeWindow = (days) => {
  const currentEnd = new Date();
  currentEnd.setHours(23, 59, 59, 999);
  const currentStart = new Date(currentEnd);
  currentStart.setDate(currentStart.getDate() - (days - 1));
  currentStart.setHours(0, 0, 0, 0);

  const lastEnd = new Date(currentEnd);
  lastEnd.setDate(lastEnd.getDate() - days);
  const lastStart = new Date(currentStart);
  lastStart.setDate(lastStart.getDate() - days);

  return {
    current: { start: currentStart, end: currentEnd },
    last: { start: lastStart, end: lastEnd },
  };
};

const getRangeWindows = (rangeParam) => {
  const key = normalizeRangeKey(rangeParam);
  if (key === 'all') {
    return { key, current: null, last: null };
  }
  const days = RANGE_DAY_MAP[key] || RANGE_DAY_MAP['7'];
  const windows = buildRangeWindow(days);
  return { key, ...windows };
};

const serializeRange = (range) => {
  if (!range?.start || !range?.end) {
    return null;
  }
  return {
    inicio: range.start.toISOString(),
    fin: range.end.toISOString(),
  };
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
    const { current, last, key } = getRangeWindows(req.query.range);
    const cantidad = await ventaService.obtenerCantidadVentas(userId, current);
    const rangoActual = serializeRange(current);
    const rangoAnterior = serializeRange(last);
    res.json({
      cantidadVentas: cantidad,
      rangoActual,
      rangoAnterior,
      rango: rangoActual,
      range: key,
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenerCantidadVentasSemana = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { current, last, key } = getRangeWindows(req.query.range || '7');
    const cantidad = await ventaService.obtenerCantidadVentasSemana(userId, current);
    const rangoActual = serializeRange(current);
    const rangoAnterior = serializeRange(last);
    res.json({
      cantidadVentas: cantidad,
      rangoActual,
      rangoAnterior,
      rango: rangoActual,
      range: key,
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenerGanancias = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { current, last, key } = getRangeWindows(req.query.range);
    const ganancias = await ventaService.obtenerGanancias(userId, current);
    const rangoActual = serializeRange(current);
    const rangoAnterior = serializeRange(last);
    res.json({
      ganancias,
      rangoActual,
      rangoAnterior,
      rango: rangoActual,
      range: key,
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenerPorcentajeVentas = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { current, last, key } = getRangeWindows(req.query.range);
    const datos = await ventaService.obtenerPorcentajeVentas(userId, current, last);

    const rangoActual = serializeRange(current);
    const rangoAnterior = serializeRange(last);
    res.json({
      ventasActual: datos.ventasActual,
      ventasAnterior: datos.ventasAnterior,
      porcentajeCambio: datos.porcentaje,
      rangoActual,
      rangoAnterior,
      rango: rangoActual,
      range: key,
    });
  } catch (error) {
    next(error);
  }
};
