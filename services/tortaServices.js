// services/tortaService.js

const Torta = require('../models/Torta');
const Receta = require('../models/Receta');
const ListaPrecios = require('../models/ListaPrecios');
const { calcularCostoTotalReceta, actualizarListaPrecios } = require('../services/calculadoraCostos');
const { crearRecetaAutomatica } = require('../controllers/recetasController'); // Ojo: si querés, luego podemos también migrar crearRecetaAutomatica al service

exports.crearTorta = async ({ nombre_torta, descripcion_torta, imagen, userId }) => {
  if (!nombre_torta || !descripcion_torta) {
    throw new Error('Faltan campos requeridos para crear la torta');
  }

  const tortaNueva = await Torta.create({
    nombre_torta,
    descripcion_torta,
    imagen,
    id_usuario: userId
  });

  // Crear receta automática con Packaging
  await crearRecetaAutomatica(tortaNueva.ID_TORTA, userId);

  // Calcular costo de receta automática
  const costoRecetaAutomatica = await calcularCostoTotalReceta(
    tortaNueva.ID_TORTA,
    userId
  );

  // Crear o actualizar lista de precios
  const [listaPrecio, created] = await ListaPrecios.findOrCreate({
    where: { id_torta: tortaNueva.ID_TORTA, id_usuario: userId },
    defaults: {
      nombre_torta: tortaNueva.nombre_torta,
      costo_total: costoRecetaAutomatica,
      id_usuario: userId,
    },
  });

  if (!created) {
    await ListaPrecios.update(
      { costo_total: costoRecetaAutomatica },
      { where: { id_torta: tortaNueva.ID_TORTA, id_usuario: userId } }
      );
  }

  return tortaNueva;
};

exports.obtenerTortasPorUsuario = async (userId) => {
  return await Torta.findAll({
    where: { id_usuario: userId },
    order: [['ID_TORTA', 'ASC']]
  });
};

exports.editarTorta = async ({ id, nombre_torta, descripcion_torta, imagen }) => {
  const torta = await Torta.findOne({ where: { ID_TORTA: id } });

  if (!torta) {
    throw new Error('Torta no encontrada');
  }

  await torta.update({
    nombre_torta: nombre_torta || torta.nombre_torta,
    descripcion_torta: descripcion_torta || torta.descripcion_torta,
    imagen: imagen || torta.imagen
  });

  await ListaPrecios.update(
    {
      nombre_torta,
      imagen_torta: imagen
    },
    { where: { id_torta: id } }
  );

  return torta;
};

exports.eliminarTorta = async (id) => {
  await Receta.destroy({ where: { ID_TORTA: id } });
  await ListaPrecios.destroy({ where: { id_torta: id } });
  await Torta.destroy({ where: { ID_TORTA: id } });
};
