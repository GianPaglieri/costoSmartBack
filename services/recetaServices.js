// services/recetaService.js

const Receta = require('../models/Receta');
const Torta = require('../models/Torta');
const Ingrediente = require('../models/Ingrediente');
const { calcularCostoTotalReceta, actualizarListaPrecios } = require('./calculadoraCostos');
const { ensurePackagingForUser } = require('./packagingService');
const Sequelize = require('sequelize');

// Obtener recetas agrupadas por torta
exports.obtenerRecetasPorUsuario = async (userId) => {
  const recetas = await Receta.findAll({
    attributes: [
      'ID_TORTA',
      [Sequelize.literal('Tortum.nombre_torta'), 'nombre_torta'],
      [Sequelize.literal('Tortum.imagen'), 'imagen'],
      [Sequelize.col('Ingrediente.id'), 'ID_INGREDIENTE'],
      [Sequelize.col('Ingrediente.Nombre'), 'Nombre'],
      [Sequelize.fn('SUM', Sequelize.col('cantidad')), 'total_cantidad'],
    ],
    include: [
      { model: Torta, attributes: [], as: 'Tortum' },
      { model: Ingrediente, attributes: [], as: 'Ingrediente' },
    ],
    group: ['Receta.ID_TORTA', 'Tortum.nombre_torta', 'Ingrediente.id', 'Tortum.imagen'],
    where: { id_usuario: userId },
  });

  const recetasAgrupadas = new Map();

  for (const receta of recetas) {
    const tortaIdRaw = receta.get('ID_TORTA');
    const tortaKey = String(tortaIdRaw);
    const idTortaNumber = Number(tortaIdRaw);
    const idTorta = Number.isNaN(idTortaNumber) ? tortaIdRaw : idTortaNumber;

    if (!recetasAgrupadas.has(tortaKey)) {
      recetasAgrupadas.set(tortaKey, {
        idTorta,
        nombreTorta: receta.get('nombre_torta'),
        imagen: receta.get('imagen'),
        ingredientes: [],
      });
    }

    const ingredienteIdRaw = receta.getDataValue('ID_INGREDIENTE');
    const ingredienteIdNumber = Number(ingredienteIdRaw);
    const totalCantidadRaw = receta.getDataValue('total_cantidad');
    const totalCantidadNumber = Number(totalCantidadRaw);

    recetasAgrupadas.get(tortaKey).ingredientes.push({
      idIngrediente: Number.isNaN(ingredienteIdNumber) ? ingredienteIdRaw : ingredienteIdNumber,
      nombre: receta.getDataValue('Nombre'),
      cantidad: Number.isNaN(totalCantidadNumber) ? 0 : totalCantidadNumber,
    });
  }

  return Array.from(recetasAgrupadas.values());
};

// Extiende obtenerRecetasPorUsuario para incluir el desglose monetario por ingrediente
exports.obtenerRecetasConDesglose = async (userId) => {
  const recetasAgrupadas = await exports.obtenerRecetasPorUsuario(userId);
  const { calcularCostoConDesgloseReceta } = require('./calculadoraCostos');

  // Para cada torta, calcular el desglose
  const resultado = [];
  for (const torta of recetasAgrupadas) {
    try {
      const { total, ingredientes: ingredientesConCosto } = await calcularCostoConDesgloseReceta(
        torta.idTorta,
        userId
      );

      const ingredientesMap = new Map();

      for (const ingredienteBase of torta.ingredientes) {
        ingredientesMap.set(ingredienteBase.idIngrediente, {
          ...ingredienteBase,
          unitCost: 0,
          subtotalCost: 0,
        });
      }

      for (const detalle of ingredientesConCosto) {
        const existente = ingredientesMap.get(detalle.idIngrediente);
        if (existente) {
          existente.unitCost = Number(detalle.unitCost ?? 0);
          existente.subtotalCost = Number(detalle.subtotalCost ?? 0);
        } else {
          ingredientesMap.set(detalle.idIngrediente, {
            idIngrediente: detalle.idIngrediente,
            nombre: detalle.nombre,
            cantidad: Number(detalle.cantidad ?? 0),
            unitCost: Number(detalle.unitCost ?? 0),
            subtotalCost: Number(detalle.subtotalCost ?? 0),
          });
        }
      }

      const ingredientesNormalizados = Array.from(ingredientesMap.values());

      resultado.push({
        idTorta: torta.idTorta,
        nombreTorta: torta.nombreTorta,
        imagen: torta.imagen,
        costos: {
          total: Number(total ?? 0),
        },
        ingredientes: ingredientesNormalizados,
      });
    } catch (error) {
      // En caso de error, devolvemos la torta sin desglose pero sin romper la respuesta
      resultado.push({
        idTorta: torta.idTorta,
        nombreTorta: torta.nombreTorta,
        imagen: torta.imagen,
        costos: { total: 0 },
        ingredientes: torta.ingredientes.map((ingrediente) => ({
          ...ingrediente,
          unitCost: 0,
          subtotalCost: 0,
        })),
      });
    }
  }

  return resultado;
};

// Crear o editar una relaci??n receta-ingrediente
exports.crearOEditarReceta = async ({ ID_TORTA, ID_INGREDIENTE, total_cantidad, userId }) => {
  if (!ID_TORTA || !ID_INGREDIENTE || total_cantidad === undefined) {
    throw new Error('Faltan datos de la receta');
  }

  const recetaExistente = await Receta.findOne({
    where: { ID_TORTA, ID_INGREDIENTE, id_usuario: userId },
    lock: true,
  });

  if (recetaExistente) {
    if (parseFloat(recetaExistente.cantidad) !== parseFloat(total_cantidad)) {
      await Receta.update(
        { cantidad: total_cantidad },
        { where: { ID_TORTA, ID_INGREDIENTE, id_usuario: userId } }
      );
    }
  } else {
    await Receta.create({ ID_TORTA, ID_INGREDIENTE, cantidad: total_cantidad, id_usuario: userId });
  }

  await Promise.all([
    calcularCostoTotalReceta(ID_TORTA, userId),
    actualizarListaPrecios(null, userId)
  ]);
};

// Agregar nueva relaci??n
exports.agregarRelacion = async ({ ID_TORTA, ID_INGREDIENTE, cantidad, userId }) => {
  const cantidadNum = Number(cantidad);
  if (Number.isNaN(cantidadNum)) {
    throw new Error('Cantidad inv??lida');
  }

  // Evitar duplicados: si ya existe, sumamos cantidades; si no, creamos
  const existente = await Receta.findOne({ where: { ID_TORTA, ID_INGREDIENTE, id_usuario: userId } });
  if (existente) {
    const nueva = Number(existente.cantidad || 0) + cantidadNum;
    await Receta.update(
      { cantidad: nueva },
      { where: { ID_TORTA, ID_INGREDIENTE, id_usuario: userId } }
    );
  } else {
    await Receta.create({
      ID_TORTA,
      ID_INGREDIENTE,
      cantidad: cantidadNum,
      id_usuario: userId
    });
  }

  await calcularCostoTotalReceta(ID_TORTA, userId);
  await actualizarListaPrecios(null, userId);
};

// Eliminar asignaci??n de un ingrediente de una torta
exports.eliminarAsignacion = async ({ ID_TORTA, ID_INGREDIENTE, userId }) => {
  const result = await Receta.destroy({
    where: { ID_TORTA, ID_INGREDIENTE, id_usuario: userId }
  });

  await actualizarListaPrecios(null, userId);

  if (result === 0) {
    throw new Error('Asignaci??n de receta no encontrada');
  }
};

// Eliminar receta completa (por torta)
exports.eliminarReceta = async ({ ID_TORTA, userId }) => {
  const receta = await Receta.findOne({ where: { ID_TORTA, id_usuario: userId } });
  if (!receta) {
    throw new Error('Receta no encontrada');
  }

  await receta.destroy();
  await actualizarListaPrecios(null, userId);
};

// Crear receta automatica con el ingrediente "Packaging"
exports.crearRecetaAutomatica = async (idTorta, userId) => {
  const packaging = await ensurePackagingForUser(userId);

  const existente = await Receta.findOne({
    where: {
      ID_TORTA: idTorta,
      ID_INGREDIENTE: packaging.id,
      id_usuario: userId,
    },
  });

  if (!existente) {
    await Receta.create({
      ID_TORTA: idTorta,
      ID_INGREDIENTE: packaging.id,
      cantidad: 1,
      id_usuario: userId,
    });
  }
};




