// services/recetaService.js

const Receta = require('../models/Receta');
const Torta = require('../models/Torta');
const Ingrediente = require('../models/Ingrediente');
const { calcularCostoTotalReceta, actualizarListaPrecios } = require('./calculadoraCostos');
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

  // Agrupar por torta
  const recetasAgrupadas = recetas.reduce((acc, receta) => {
    const { ID_TORTA, nombre_torta, imagen } = receta.get();
    acc[ID_TORTA] = acc[ID_TORTA] || { ID_TORTA, nombre_torta, imagen, ingredientes: [] };
    acc[ID_TORTA].ingredientes.push({
      ID_INGREDIENTE: receta.getDataValue('ID_INGREDIENTE'),
      Nombre: receta.getDataValue('Nombre'),
      total_cantidad: receta.getDataValue('total_cantidad'),
    });
    return acc;
  }, {});

  return Object.values(recetasAgrupadas);
};

// Crear o editar una relación receta-ingrediente
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
    calcularCostoTotalReceta(ID_TORTA),
    actualizarListaPrecios()
  ]);
};

// Agregar nueva relación
exports.agregarRelacion = async ({ ID_TORTA, ID_INGREDIENTE, cantidad, userId }) => {
  await Receta.create({
    ID_TORTA,
    ID_INGREDIENTE,
    cantidad,
    id_usuario: userId
  });

  await calcularCostoTotalReceta(ID_TORTA);
  await actualizarListaPrecios();
};

// Eliminar asignación de un ingrediente de una torta
exports.eliminarAsignacion = async ({ ID_TORTA, ID_INGREDIENTE, userId }) => {
  const result = await Receta.destroy({
    where: { ID_TORTA, ID_INGREDIENTE, id_usuario: userId }
  });

  await actualizarListaPrecios();

  if (result === 0) {
    throw new Error('Asignación de receta no encontrada');
  }
};

// Eliminar receta completa (por torta)
exports.eliminarReceta = async ({ ID_TORTA, userId }) => {
  const receta = await Receta.findOne({ where: { ID_TORTA, id_usuario: userId } });
  if (!receta) {
    throw new Error('Receta no encontrada');
  }

  await receta.destroy();
  await actualizarListaPrecios();
};

// Crear receta automática con el ingrediente "Packaging"
exports.crearRecetaAutomatica = async (idTorta, userId) => {
  let packaging = await Ingrediente.findOne({
    where: { nombre: 'Packaging', id_usuario: userId }
  });

  if (!packaging) {
    packaging = await Ingrediente.create({
      nombre: 'Packaging',
      unidad_Medida: 'unidad',
      tamano_Paquete: 1,
      costo: 1000,
      CantidadStock: 0,
      id_usuario: userId
    });
  }

  await Receta.create({
    ID_TORTA: idTorta,
    ID_INGREDIENTE: packaging.id,
    cantidad: 1,
    id_usuario: userId
  });
};
