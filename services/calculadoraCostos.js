const { Op } = require('sequelize');
const Receta = require('../models/Receta');
const ListaPrecios = require('../models/ListaPrecios');
const Ingrediente = require('../models/Ingrediente');
const Torta = require('../models/Torta');

const calcularCostoTotalReceta = async (idTorta, userId) => {
  try {
    const recetas = await Receta.findAll({
      where: { ID_TORTA: idTorta, id_usuario: userId },
    });

    if (recetas.length === 0) {
      throw new Error('No se encontro la receta');
    }

    let costoTotal = 0;

    for (const receta of recetas) {
      const ingredienteId = receta.ID_INGREDIENTE;
      const ingrediente = await Ingrediente.findOne({
        where: { id: ingredienteId, id_usuario: userId },
      });

      if (!ingrediente) {
        throw new Error('No se encontro el ingrediente con ID ' + ingredienteId);
      }

      const cantidad = receta.cantidad || 1; // Si no hay cantidad, asumir 1 por defecto
      const tamanoPaquete = ingrediente.tamano_Paquete || 1;

      const costoIngrediente = parseFloat(ingrediente.costo);
      const costoPorUnidad = costoIngrediente / tamanoPaquete;

      costoTotal += costoPorUnidad * cantidad;
    }

    return costoTotal;
  } catch (error) {
    throw new Error('Error al calcular el costo total de la receta: ' + error.message);
  }
};

const calcularPrecioLista = (costoTotal, porcentaje = 0) => {
  const margen = Number(porcentaje) || 0;
  return costoTotal * (1 + margen / 100);
};

const actualizarListaPrecios = async (nombreTorta, idUsuario) => {
  try {
    const recetas = await Receta.findAll({ where: { id_usuario: idUsuario } });

    const tortaIds = [...new Set(recetas.map((receta) => receta.ID_TORTA))];
    if (tortaIds.length === 0) {
      return;
    }

    const tortas = await Torta.findAll({
      where: {
        ID_TORTA: { [Op.in]: tortaIds },
        id_usuario: idUsuario,
      },
    });
    const tortaMap = new Map(tortas.map((torta) => [torta.ID_TORTA, torta]));

    for (const tortaId of tortaIds) {
      const costoTotal = await calcularCostoTotalReceta(tortaId, idUsuario);
      const torta = tortaMap.get(tortaId);
      const porcentaje = torta ? torta.porcentaje_ganancia : 0;
      const precioLista = calcularPrecioLista(costoTotal, porcentaje);
      const nombre = torta ? torta.nombre_torta : nombreTorta;

      const [registro, creado] = await ListaPrecios.findOrCreate({
        where: { id_torta: tortaId, id_usuario: idUsuario },
        defaults: {
          id_torta: tortaId,
          nombre_torta: nombre,
          costo_total: costoTotal,
          precio_lista: precioLista,
          id_usuario: idUsuario,
        },
      });

      if (!creado) {
        await registro.update({
          nombre_torta: nombre || registro.nombre_torta,
          costo_total: costoTotal,
          precio_lista: precioLista,
        });
      }
    }
  } catch (error) {
    console.error('Error al migrar los datos de lista de precios:', error);
  }
};

module.exports = { calcularCostoTotalReceta, actualizarListaPrecios, calcularPrecioLista };