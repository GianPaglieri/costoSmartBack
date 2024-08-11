
const ListaPrecios = require('../models/ListaPrecios');
const Receta = require('../models/Receta');
const Venta = require('../models/Venta'); 
const Ingrediente = require('../models/Ingrediente');


const calcularGanancias = async (userId) => {
  try {
    
    const resultado = await Venta.sum('precio_torta', { where: { id_usuario: userId } });
    console.log('Iniciando cálculo de ganancias para el usuario con ID:', userId);

    const ganancias = resultado || 0; 
    console.log('Ganancias calculadas para el usuario:', ganancias);

    return ganancias;
  } catch (error) {
    console.error('Error en calcularGanancias:', error);
    throw new Error(`Error al calcular las ganancias: ${error.message}`);
  }
};
  module.exports = { calcularGanancias };