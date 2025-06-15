const Ingrediente = require('../models/Ingrediente');
const { actualizarListaPrecios } = require('../services/calculadoraCostos');

// Obtener todos los ingredientes del usuario
exports.obtenerIngredientes = async (userId) => {
  return await Ingrediente.findAll({ where: { id_usuario: userId } });
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
    id_usuario: userId
  });
};

// Editar ingrediente
exports.editarIngrediente = async ({ id, nombre, unidad_Medida, tamano_Paquete, costo, CantidadStock }) => {
  const camposActualizados = {};
  if (nombre) camposActualizados.nombre = nombre;
  if (unidad_Medida) camposActualizados.unidad_Medida = unidad_Medida;
  if (tamano_Paquete) camposActualizados.tamano_Paquete = tamano_Paquete;
  if (costo !== undefined) camposActualizados.costo = costo;
  if (CantidadStock !== undefined) camposActualizados.CantidadStock = CantidadStock;

  await Ingrediente.update(camposActualizados, { where: { id } });

  await actualizarListaPrecios();
};

// Obtener ingredientes con menos stock (TOP 5)
exports.obtenerIngredientesMenosStock = async (userId) => {
  return await Ingrediente.findAll({
    attributes: ['id', 'nombre', 'unidad_Medida', 'tamano_Paquete', 'costo', 'CantidadStock'],
    where: { id_usuario: userId },
    order: [['CantidadStock', 'ASC']],
    limit: 5
  });
};

// Eliminar ingrediente
exports.eliminarIngrediente = async ({ id, userId }) => {
  // Primero verificamos si el ingrediente existe y pertenece al usuario
  const ingrediente = await Ingrediente.findOne({ where: { id, id_usuario: userId } });
  if (!ingrediente) {
    throw new Error('No se encontró el ingrediente asociado al usuario autenticado');
  }

  // Validamos si el ingrediente está asociado a alguna receta
  const recetasRelacionadas = await Receta.findOne({ where: { ID_INGREDIENTE: id, id_usuario: userId } });

  if (recetasRelacionadas) {
    throw new Error('No se puede eliminar el ingrediente porque está asignado a una receta');
  }

  // Si no está asociado, lo eliminamos
  await Ingrediente.destroy({ where: { id } });
};
