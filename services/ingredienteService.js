const Ingrediente = require('../models/Ingrediente');
const Receta = require('../models/Receta');
const Torta = require('../models/Torta');
const db = require('../database/connection');
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
    throw new Error('No se encontro el ingrediente asociado al usuario autenticado');
  }

  const recetasVigentes = await Receta.findAll({
    where: { ID_INGREDIENTE: id, id_usuario: userId },
    include: [
      {
        model: Torta,
        attributes: ['ID_TORTA', 'nombre_torta'],
        required: false,
      },
    ],
  });

  const tortasReferenciadas = new Map();
  recetasVigentes.forEach((receta) => {
    const tortaId = receta.ID_TORTA;
    const nombre = receta.Torta?.nombre_torta || `Torta ID ${tortaId}`;
    tortasReferenciadas.set(tortaId, nombre);
  });

  let recetasLegacy = [];
  try {
    const [rows] = await db.query('SELECT ID_TORTA FROM recetas_old WHERE ID_INGREDIENTE = ?', {
      replacements: [id],
    });
    recetasLegacy = rows;
  } catch (error) {
    const code = error?.original?.code;
    if (code && code !== 'ER_NO_SUCH_TABLE') {
      throw error;
    }
  }

  const legacyIds = recetasLegacy?.map((row) => row.ID_TORTA).filter(Boolean) || [];
  if (legacyIds.length) {
    const idsPendientes = legacyIds.filter((legacyId) => !tortasReferenciadas.has(legacyId));
    if (idsPendientes.length) {
      const tortas = await Torta.findAll({
        where: { ID_TORTA: idsPendientes },
        attributes: ['ID_TORTA', 'nombre_torta'],
      });
      tortas.forEach((torta) => {
        tortasReferenciadas.set(torta.ID_TORTA, torta.nombre_torta || `Torta ID ${torta.ID_TORTA}`);
      });
    }
    legacyIds.forEach((legacyId) => {
      if (!tortasReferenciadas.has(legacyId)) {
        tortasReferenciadas.set(legacyId, `Torta ID ${legacyId}`);
      }
    });
  }

  if (tortasReferenciadas.size) {
    const lista = Array.from(tortasReferenciadas.values());
    const error = new Error(
      `No se puede eliminar el ingrediente porque se usa en las recetas: ${lista.join(', ')}`
    );
    error.code = 'INGREDIENTE_EN_USO';
    error.status = 409;
    error.details = {
      recetas: Array.from(tortasReferenciadas.entries()).map(([tortaId, tortaNombre]) => ({
        tortaId,
        tortaNombre,
      })),
    };
    throw error;
  }

  await Ingrediente.destroy({ where: { id, id_usuario: userId } });
};
