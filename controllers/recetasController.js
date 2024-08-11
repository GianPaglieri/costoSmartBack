const Sequelize = require('sequelize');

const Receta = require('../models/Receta');
const Torta = require('../models/Torta');
const Ingrediente = require('../models/Ingrediente');
const Usuario = require('../models/User');
const { calcularCostoTotalReceta, actualizarListaPrecios } = require('../services/calculadoraCostos');
const jwt = require('jsonwebtoken');

// Define la función para emitir el evento 'recetas-update' a los clientes
const emitRecetasUpdate = (updatedRecetas) => {
  io.emit('recetas-update', updatedRecetas);
};

exports.obtenerRecetas = async (req, res) => {
  try {
    // Verificar si el token existe en las cabeceras de la solicitud
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticación no proporcionado' });
    }

    // Extraer el token de las cabeceras de la solicitud
    const token = req.headers.authorization.split(' ')[1];

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, 'secreto');

    // Obtener el ID de usuario del token decodificado
    const userId = decoded.userId;

    // Consultar las recetas asociadas al usuario autenticado
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
        {
          model: Torta,
          attributes: [],
          as: 'Tortum',
        },
        {
          model: Ingrediente,
          attributes: [],
          as: 'Ingrediente',
        },
      ],
      group: ['Receta.ID_TORTA', 'Tortum.nombre_torta', 'Ingrediente.id', 'Tortum.imagen'],
      where: { id_usuario: userId }, // Filtrar por el usuario autenticado
    });

    // Procesar las recetas para agruparlas según la torta
    const recetasAgrupadas = recetas.reduce((acc, receta) => {
      const { ID_TORTA, nombre_torta, imagen, ingredientes } = receta.get();
      acc[ID_TORTA] = acc[ID_TORTA] || { ID_TORTA, nombre_torta, imagen, ingredientes: [] };
      acc[ID_TORTA].ingredientes.push({
        ID_INGREDIENTE: receta.getDataValue('ID_INGREDIENTE'),
        Nombre: receta.getDataValue('Nombre'),
        total_cantidad: receta.getDataValue('total_cantidad'),
      });
      return acc;
    }, {});

    // Convertir el objeto de recetas agrupadas en un array
    const respuestaAgrupada = Object.values(recetasAgrupadas);

    res.json(respuestaAgrupada);
  } catch (error) {
    console.error('Error al obtener las recetas:', error);
    res.status(500).json({ error: 'Error al obtener las recetas' });
  }
};


exports.agregarRelacion = async (req, res) => {
  try {
    // Tu código para agregar una nueva relación
    const { ID_TORTA, ID_INGREDIENTE, cantidad } = req.body;
    // Verificar si el token existe en las cabeceras de la solicitud
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticación no proporcionado' });
    }
    // Extraer el token de las cabeceras de la solicitud
    const token = req.headers.authorization.split(' ')[1];
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, 'secreto');
    // Obtener el ID de usuario del token decodificado
    const userId = decoded.userId;
    await Receta.create({
      ID_TORTA,
      ID_INGREDIENTE,
      cantidad,
      id_usuario: userId // Aquí se incluye el ID de usuario
    });
    
    // Calcular el costo total de la receta
    await calcularCostoTotalReceta(ID_TORTA);

    // Actualizar la lista de precios
    await actualizarListaPrecios();
   
    res.json({ message: 'Nueva relación agregada exitosamente' });
  } catch (error) {
    console.error('Error al agregar una nueva relación:', error);
    res.status(500).json({ error: error.message });
  }
};
exports.eliminarAsignacion = async (req, res) => {
  try {
    // Verificar si el token existe en las cabeceras de la solicitud
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      console.log('Token de autenticación no proporcionado');
      return res.status(401).json({ error: 'Token de autenticación no proporcionado' });
    }

    // Extraer el token de las cabeceras de la solicitud
    const token = req.headers.authorization.split(' ')[1];
    console.log('Token:', token);

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, 'secreto');
    console.log('Token decoded:', decoded);

    // Obtener el ID de usuario del token decodificado
    const userId = decoded.userId;
    console.log('User ID:', userId);

    // Obtener los parámetros de la solicitud
    const { ID_TORTA, ID_INGREDIENTE } = req.params;
    console.log('ID_TORTA:', ID_TORTA, 'ID_INGREDIENTE:', ID_INGREDIENTE);

    // Eliminar la asignación de receta
    const result = await Receta.destroy({
      where: {
        ID_TORTA,
        ID_INGREDIENTE,
        id_usuario: userId // Aquí se incluye el ID de usuario
      },
    });
    console.log('Resultado de la eliminación:', result);

    // Actualizar la lista de precios
    await actualizarListaPrecios();

    if (result === 0) {
      console.log('Asignación de receta no encontrada');
      return res.status(404).json({ error: 'Asignación de receta no encontrada' });
    }

    res.json({ message: 'Asignación de receta eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar la asignación de receta:', error);
    res.status(500).json({ error: error.message });
  }
};


exports.crearOEditarReceta = async (req, res) => {
  const { ID_TORTA, ID_INGREDIENTE } = req.params;
  const { total_cantidad } = req.body;

  // Verificar si el token existe en las cabeceras de la solicitud
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticación no proporcionado' });
  }

  // Extraer el token de las cabeceras de la solicitud
  const token = req.headers.authorization.split(' ')[1];

  // Verificar y decodificar el token
  const decoded = jwt.verify(token, 'secreto');

  // Obtener el ID de usuario del token decodificado
  const userId = decoded.userId;

  console.log('Datos recibidos:', { ID_TORTA, ID_INGREDIENTE, total_cantidad, userId });

  try {
    if (!ID_TORTA || !ID_INGREDIENTE || !total_cantidad) {
      return res.status(400).json({ success: false, error: 'Faltan datos de la receta' });
    }

    // Verificar si existe la receta
    let recetaExistente = await Receta.findOne({
      where: {
        ID_TORTA,
        ID_INGREDIENTE,
        id_usuario: userId // Aquí se incluye el ID de usuario
      }
    });

    if (recetaExistente) {
      // Si existe la receta, actualizar cantidad
      await Receta.update(
        { cantidad: total_cantidad },
        {
          where: {
            ID_TORTA,
            ID_INGREDIENTE,
            id_usuario: userId // Aquí se incluye el ID de usuario
          }
        }
      );

      recetaExistente = await Receta.findOne({
        where: {
          ID_TORTA,
          ID_INGREDIENTE,
          id_usuario: userId // Aquí se incluye el ID de usuario
        }
      });

      // Calcular y actualizar el costo total de la receta
      await calcularCostoTotalReceta(ID_TORTA);
      await actualizarListaPrecios();

      return res.json({
        success: true,
        mensaje: 'Receta actualizada exitosamente',
        receta: recetaExistente
      });
    } else {
      // Si no existe la receta, crear una nueva
      await Receta.create({ ID_TORTA, ID_INGREDIENTE, cantidad: total_cantidad, id_usuario: userId });

      // Calcular y actualizar el costo total de la receta
      await calcularCostoTotalReceta(ID_TORTA);
      await actualizarListaPrecios();

      return res.json({
        success: true,
        mensaje: 'Receta creada exitosamente',
        receta: { ID_TORTA, ID_INGREDIENTE, cantidad: total_cantidad }
      });
    }
  } catch (error) {
    console.error('Error al crear o editar la receta:', error);
    return res.status(500).json({ success: false, error: 'Error al crear o editar la receta' });
  }
};

exports.eliminarReceta = async (req, res) => {
  try {
    console.log('Headers:', req.headers);

    // Verificar si el token existe en las cabeceras de la solicitud
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticación no proporcionado' });
    }

    // Extraer el token de las cabeceras de la solicitud
    const token = req.headers.authorization.split(' ')[1];
    console.log('Token:', token);

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, 'secreto');
    console.log('Token decoded:', decoded);

    // Obtener el ID de usuario del token decodificado
    const userId = decoded.userId;
    console.log('User ID:', userId);

    const { ID_TORTA } = req.params;
    console.log('ID_TORTA:', ID_TORTA);

    const receta = await Receta.findOne({ where: { ID_TORTA, id_usuario: userId } });
    if (!receta) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    await receta.destroy();
    await actualizarListaPrecios();

    res.json({ message: 'Receta eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar la receta:', error);
    res.status(500).json({ error: error.message });
  }
};


exports.guardarReceta = async (req, res) => {
  try {
    // Verificar si el token existe en las cabeceras de la solicitud
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticación no proporcionado' });
    }

    // Extraer el token de las cabeceras de la solicitud
    const token = req.headers.authorization.split(' ')[1];
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, 'secreto');
    // Obtener el ID de usuario del token decodificado
    const userId = decoded.userId;

    const { ID_TORTA, nombre_receta, ID_INGREDIENTE, cantidad } = req.body;

    if (!ID_TORTA || !nombre_receta || !ID_INGREDIENTE || !cantidad) {
      return res.status(400).json({ error: 'Faltan campos requeridos para crear la receta' });
    }

    await Receta.create({
      ID_TORTA,
      nombre_receta,
      ID_INGREDIENTE,
      cantidad,
      id_usuario: userId
    });
    await actualizarListaPrecios();

    res.json({ success: true });
  } catch (error) {
    console.error('Error al guardar la receta:', error);
    res.status(500).json({ error: 'Error al guardar la receta' });
  }
};
exports.crearRecetaAutomatica = async (idTorta, userId, nombreTorta) => {
  try {
    console.log('ID_TORTA:', idTorta);
    console.log('User ID:', userId);
    console.log('Nombre torta:', nombreTorta);

    // Crear la receta automáticamente
    await Receta.create({
      ID_TORTA: idTorta,
      cantidad: 1,
      ID_INGREDIENTE: 51,
      id_usuario: userId
    });

    // Llama al servicio para actualizar la lista de precios
    await actualizarListaPrecios(nombreTorta, userId);

    console.log('Receta creada automáticamente para la torta con ID:', idTorta);
  } catch (error) {
    console.error('Error al crear automáticamente la receta:', error);
    throw new Error('Error al crear automáticamente la receta');
  }
};