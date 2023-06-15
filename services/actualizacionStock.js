const Ingrediente = require('../models/Ingrediente');
const receta = require('../models/Receta');

const db = require('../database/connection');

const actualizarStockIngredientes = async (idtorta) => {
  try {
    const recetas = await receta.findAll({ where: { id_torta: idtorta } });

    if (!recetas || recetas.length === 0) {
      throw new Error('No se encontraron recetas para la receta');
    }

    for (const receta of recetas) {
      const idIngrediente = receta.id_ingrediente;
      const cantidadRequerida = receta.cantidad_ingrediente;

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

      console.log(`Stock del ingrediente con ID ${idIngrediente} antes de la venta: ${cantidadActualAntes}`);
      console.log(`Stock del ingrediente con ID ${idIngrediente} después de la venta: ${cantidadActualDespues}`);
    }

    console.log('Stock de ingredientes actualizado correctamente');
  } catch (error) {
    console.error('Error al actualizar el stock de ingredientes:', error);
    throw error;
  }
};

module.exports = { actualizarStockIngredientes };






