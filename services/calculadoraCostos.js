const Receta = require('../models/Receta');
const ListaPrecios = require('../models/ListaPrecios');
const Ingrediente = require('../models/Ingrediente');


const calcularCostoTotalReceta = async (idTorta) => {
  try {
   

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

      const cantidad = receta.cantidad || 1; // Si no hay cantidad, asumir 1 por defecto
      const tamanoPaquete = ingrediente.tamano_Paquete || 1;

      const costoIngrediente = parseFloat(ingrediente.costo);
      const costoPorUnidad = costoIngrediente / tamanoPaquete;

      costoTotal += costoPorUnidad * cantidad;
    }

    

    return costoTotal;
  } catch (error) {
    throw new Error(`Error al calcular el costo total de la receta: ${error.message}`);
  }
};

const actualizarListaPrecios = async (nombreTorta, idUsuario) => {
  try {
    
    const recetas = await Receta.findAll();

    for (const receta of recetas) {
      const costoTotal = await calcularCostoTotalReceta(receta.ID_TORTA);

      const listaPrecioExistente = await ListaPrecios.findOne({
        where: { id_torta: receta.ID_TORTA },
      });

      if (listaPrecioExistente) {
        await ListaPrecios.update(
          { costo_total: costoTotal },
          { where: { id_torta: receta.ID_TORTA } }
        );
      } else {
        await ListaPrecios.create({
          id_torta: receta.ID_TORTA,
          nombre_torta: nombreTorta,
          costo_total: costoTotal,
          id_usuario: idUsuario
        });

        console.log('Nueva entrada creada en lista_precios para la receta:', receta.ID_TORTA);
      }
    }
  } catch (error) {
    console.error('Error al migrar los datos de lista de precios:', error);
  }
};

module.exports = { calcularCostoTotalReceta, actualizarListaPrecios };