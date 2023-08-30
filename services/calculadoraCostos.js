const Receta = require('../models/Receta');
const ListaPrecios = require('../models/ListaPrecios');
const Ingrediente = require('../models/Ingrediente');

const calcularCostoTotalReceta = async (idTorta) => {
  try {
    console.log('Calculando costo total de la receta...');

    const recetas = await Receta.findAll({ where: { ID_TORTA: idTorta } });

    if (recetas.length === 0) {
      throw new Error('No se encontró la receta');
    }

    let costoTotal = 0;

    for (const receta of recetas) {
      const ingredienteId = receta.ID_INGREDIENTE;
      const ingrediente = await Ingrediente.findOne({ where: { id: ingredienteId } });

      if (!ingrediente) {
        throw new Error(`No se encontró el ingrediente con ID ${ingredienteId}`);
      }

      const cantidad = receta.cantidad || 0;
      const tamanoPaquete = ingrediente.tamano_Paquete || 1;

      const costoIngrediente = parseFloat(ingrediente.costo);
      const costoPorUnidad = costoIngrediente / tamanoPaquete;

      costoTotal += costoPorUnidad * cantidad;
    }

    console.log('Costo total calculado:', costoTotal);

    return costoTotal;
  } catch (error) {
    throw new Error(`Error al calcular el costo total de la receta: ${error.message}`);
  }
};

const actualizarListaPrecios = async () => {
  try {
    console.log('Iniciando migración de lista_precios...');

    const recetas = await Receta.findAll();

    console.log('Recetas encontradas:', recetas);

    for (const receta of recetas) {
      const costoTotal = await calcularCostoTotalReceta(receta.ID_TORTA);

      console.log('Costo total calculado para la receta:', costoTotal);

      const listaPrecioExistente = await ListaPrecios.findOne({
        where: { id_torta: receta.ID_TORTA },
      });

      if (listaPrecioExistente) {
        await ListaPrecios.update(
          { costo_total: costoTotal },
          { where: { id_torta: receta.ID_TORTA } }
        );

        console.log('Lista de precios actualizada para la receta:', receta.ID_TORTA);
      } else {
        await ListaPrecios.create({
          id_torta: receta.ID_TORTA,
          nombre_torta: receta.nombre_torta,
          costo_total: costoTotal,
        });

        console.log('Nueva entrada creada en lista_precios para la receta:', receta.ID_TORTA);
      }
    }

    console.log('Migración de lista_precios completada');
  } catch (error) {
    console.error('Error al migrar los datos de lista_precios:', error);
  }
};

module.exports = { calcularCostoTotalReceta, actualizarListaPrecios };







