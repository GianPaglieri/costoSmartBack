
const ListaPrecios = require('../models/ListaPrecios');
const Receta = require('../models/Receta');
const Venta = require('../models/Venta'); // Agrega esta línea
const Ingrediente = require('../models/Ingrediente');


const calcularGanancias = async () => {
    try {
      // Utiliza Sequelize para calcular la suma de precio_torta
      const resultado = await Venta.sum('precio_torta');
      console.log('Iniciando cálculo de ganancias...');

      const ganancias = resultado || 0; 
      console.log('Ganancias calculadas:', ganancias);

      return ganancias;
    } catch (error) {
      console.error('Error en calcularGanancias:', error);
      throw new Error(`Error al calcular las ganancias: ${error.message}`);
    }
};
  
  module.exports = { calcularGanancias };