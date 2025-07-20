const ventaService = require('../services/ventaService');
const { obtenerUserIdDesdeRequest } = require('../middleware/authMiddleware');

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

exports.obtenerVentas = async (req, res) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req, res);
    if (!userId) return;
    const ventas = await ventaService.obtenerVentas(userId);
    res.json(ventas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.registrarVenta = async (req, res) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req, res);
    if (!userId) return;
    const { id_torta } = req.body;

    const venta = await ventaService.registrarVenta({ id_torta, userId });
    res.json({ success: true, venta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.obtenerCantidadVentas = async (req, res) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req, res);
    if (!userId) return;
    const cantidad = await ventaService.obtenerCantidadVentas(userId);
    res.json({ cantidadVentas: cantidad });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.obtenerCantidadVentasSemana = async (req, res) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req, res);
    if (!userId) return;
    const { current } = getLast7DaysRange();
    const cantidad = await ventaService.obtenerCantidadVentasSemana(userId, current);
    res.json({ cantidadVentas: cantidad });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.obtenerGanancias = async (req, res) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req, res);
    if (!userId) return;
    const ganancias = await ventaService.obtenerGanancias(userId);
    res.json({ ganancias });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.obtenerPorcentajeVentas = async (req, res) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req, res);
    if (!userId) return;
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
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
