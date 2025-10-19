const { Op } = require('sequelize');
const Venta = require('../models/Venta');
const ListaPrecios = require('../models/ListaPrecios');

const toNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const calcularGanancias = async (userId, range) => {
  try {
    const where = { id_usuario: userId };
    if (range?.start && range?.end) {
      where.fecha_venta = { [Op.between]: [range.start, range.end] };
    }

    const ventas = await Venta.findAll({
      where,
      attributes: ['ID_TORTA', 'precio_torta', 'fecha_venta']
    });

    if (ventas.length === 0) {
      return 0;
    }

    const tortaIds = [...new Set(ventas.map((venta) => venta.ID_TORTA).filter((id) => id != null))];

    let listaPrecios = [];
    if (tortaIds.length > 0) {
      listaPrecios = await ListaPrecios.findAll({
        where: {
          id_usuario: userId,
          id_torta: { [Op.in]: tortaIds }
        },
        attributes: ['id_torta', 'costo_total', 'precio_lista']
      });
    }

    const preciosPorTorta = new Map(
      listaPrecios.map((item) => [item.id_torta, item])
    );

    const totalGanancias = ventas.reduce((acumulado, venta) => {
      const infoTorta = preciosPorTorta.get(venta.ID_TORTA);

      const ingresoUnitario = toNumber(
        venta.precio_torta ?? infoTorta?.precio_lista,
        0
      );
      const costoUnitario = toNumber(infoTorta?.costo_total, 0);

      // Si no tenemos información de lista de precios y el ingreso es 0, no sumamos.
      if (!infoTorta && ingresoUnitario === 0) {
        return acumulado;
      }

      return acumulado + (ingresoUnitario - costoUnitario);
    }, 0);

    return Number.isFinite(totalGanancias) ? totalGanancias : 0;
  } catch (error) {
    console.error('Error en calcularGanancias:', error);
    throw new Error(`Error al calcular las ganancias: ${error.message}`);
  }
};

module.exports = { calcularGanancias };
