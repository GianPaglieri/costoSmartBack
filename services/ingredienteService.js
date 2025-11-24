const Ingrediente = require('../models/Ingrediente');
const Receta = require('../models/Receta');
const { actualizarListaPrecios } = require('../services/calculadoraCostos');

// Obtener todos los ingredientes del usuario
exports.obtenerIngredientes = async (userId) => {
  return Ingrediente.findAll({ where: { id_usuario: userId } });
};

// Guardar nuevo ingrediente
exports.guardarIngrediente = async ({ nombre, unidad_Medida, tamano_Paquete, costo, CantidadStock, userId }) => {
  if (!nombre || !unidad_Medida || !tamano_Paquete || !costo || !CantidadStock) {
    throw new Error('Faltan campos requeridos para guardar el ingrediente');
  }

  await Ingrediente.create({
    nombre,
    unidad_Medida,
    tamano_Paquete,
    costo,
    CantidadStock,
    id_usuario: userId,
  });
};

// Editar ingrediente
exports.editarIngrediente = async ({ id, nombre, unidad_Medida, tamano_Paquete, costo, CantidadStock, userId }) => {
  const camposActualizados = {};
  if (nombre) camposActualizados.nombre = nombre;
  if (unidad_Medida) camposActualizados.unidad_Medida = unidad_Medida;
  if (tamano_Paquete) camposActualizados.tamano_Paquete = tamano_Paquete;
  if (costo !== undefined) camposActualizados.costo = costo;
  if (CantidadStock !== undefined) camposActualizados.CantidadStock = CantidadStock;

  await Ingrediente.update(camposActualizados, { where: { id, id_usuario: userId } });

  await actualizarListaPrecios(null, userId);
};

// Obtener ingredientes con menos stock (TOP 5)
exports.obtenerIngredientesMenosStock = async (userId) => {
  return Ingrediente.findAll({
    attributes: ['id', 'nombre', 'unidad_Medida', 'tamano_Paquete', 'costo', 'CantidadStock'],
    where: { id_usuario: userId },
    order: [['CantidadStock', 'ASC']],
    limit: 5,
  });
};

// Eliminar ingrediente
exports.eliminarIngrediente = async ({ id, userId }) => {
  const ingrediente = await Ingrediente.findOne({ where: { id, id_usuario: userId } });
  if (!ingrediente) {
    const error = new Error('No se encontró el ingrediente asociado al usuario autenticado');
    error.status = 404;
    error.code = 'INGREDIENTE_NO_ENCONTRADO';
    throw error;
  }

  const recetasRelacionadas = await Receta.findAll({
    where: { ID_INGREDIENTE: id, id_usuario: userId },
    attributes: ['ID_TORTA'],
    raw: true,
  });

  if (recetasRelacionadas.length > 0) {
    const error = new Error('No se puede eliminar el ingrediente porque está asignado a una receta');
    error.status = 409;
    error.code = 'INGREDIENTE_EN_RECETA';
    error.details = {
      recetas: recetasRelacionadas.map((r) => r.ID_TORTA),
    };
    throw error;
  }

  await Ingrediente.destroy({ where: { id, id_usuario: userId } });
};
