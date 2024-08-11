const Ingrediente = require('../models/Ingrediente');
const Receta = require('../models/Receta');

const actualizarStockIngredientes = async (idTorta) => {
  try {
    const recetas = await Receta.findAll({ where: { id_torta: idTorta } });

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

      const cantidadActualAntes = ingrediente.CantidadStock;

      if (cantidadActualAntes < cantidadRequerida) {
        throw new Error('No hay suficientes ingredientes en stock');
      }

      const nuevaCantidad = cantidadActualAntes - cantidadRequerida;

      await Ingrediente.update({ CantidadStock: nuevaCantidad }, { where: { id: idIngrediente } });

      const ingredienteActualizado = await Ingrediente.findByPk(idIngrediente);
      const cantidadActualDespues = ingredienteActualizado.CantidadStock;

    
    }

    console.log('Stock de ingredientes actualizado correctamente');
  } catch (error) {
    console.error('Error al actualizar el stock de ingredientes:', error);
    throw error;
  }
};

module.exports = { actualizarStockIngredientes };








