const Venta = require('../models/Venta');

const calcularGanancias = async (userId) => {
  try {
    const resultado = await Venta.sum('precio_torta', { where: { id_usuario: userId } });
    const ganancias = resultado || 0;
    return ganancias;
  } catch (error) {
    console.error('Error en calcularGanancias:', error);
    throw new Error(`Error al calcular las ganancias: ${error.message}`);
  }
};

module.exports = { calcularGanancias };
