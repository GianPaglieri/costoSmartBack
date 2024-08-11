const Torta = require('../models/Torta');
const Receta = require('../models/Receta');
const ListaPrecios = require('../models/ListaPrecios');
const multer = require('multer');
const { calcularCostoTotalReceta } = require('../services/calculadoraCostos');
const upload = require('../multerConfig'); // Importa la configuración de Multer
const { crearRecetaAutomatica } = require('./recetasController');

const jwt = require('jsonwebtoken');

const Sequelize = require('sequelize');

const obtenerUserId = (req) => {
  // Verificar si el token existe en las cabeceras de la solicitud
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    throw new Error('Token de autenticación no proporcionado');
  }

  // Extraer el token de las cabeceras de la solicitud
  const token = req.headers.authorization.split(' ')[1];

  // Verificar y decodificar el token
  const decoded = jwt.verify(token, 'secreto');

  // Obtener el ID de usuario del token decodificado
  return decoded.userId;
};

// Controlador para obtener todas las tortas
exports.obtenerTortas = async (req, res) => {
  try {
    const userId = obtenerUserId(req);
    console.log('Datos del usuario autenticado:', userId);

    // Obtener todas las tortas
    const tortas = await Torta.findAll({ where: { id_usuario: userId } });

    res.json(tortas);
  } catch (error) {
    console.error('Error al obtener las tortas:', error);
    res.status(500).json({ error: 'Error al obtener las tortas' });
  }
};
exports.agregarTorta = async (tortaData) => {
  try {
    const formData = new FormData();
    formData.append('nombre_torta', tortaData.nombre_torta);
    formData.append('descripcion_torta', tortaData.descripcion_torta);

    if (tortaData.imagen) {
      const uriParts = tortaData.imagen.split('.');
      const fileType = uriParts[uriParts.length - 1];

      formData.append('imagen', {
        uri: tortaData.imagen,
        name: `imagen.${fileType}`,
        type: `image/${fileType}`,
      });
    }

    const response = await fetch(`${baseUrl}/tortas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.ok) {
      console.log('Torta agregada exitosamente');
      return { success: true };
    } else {
      console.error('Error al agregar la torta');
      return { success: false, error: 'Error al agregar la torta' };
    }
  } catch (error) {
    console.error('Error al agregar la torta:', error);
    return { success: false, error };
  }
};
exports.guardarTorta = async (req, res) => {
  try {
    console.log('Guardar Torta: Middleware de Multer completado');
    const userId = obtenerUserId(req);
    const { nombre_torta, descripcion_torta } = req.body;

    if (!nombre_torta || !descripcion_torta) {
      return res.status(400).json({ error: 'Faltan campos requeridos para crear la torta' });
    }

    console.log('Datos recibidos en el cuerpo de la solicitud:');
    console.log('Nombre de la torta:', nombre_torta);
    console.log('Descripción de la torta:', descripcion_torta);
    
    console.log('Archivo de imagen recibido:', req.file);

    let imagenFileName = null;
    if (req.file) {
      imagenFileName = `uploads/${req.file.filename}`; // Corregir la ruta de la imagen
    }

    console.log('Datos a guardar en la base de datos:');
    console.log('Nombre de la torta:', nombre_torta);
    console.log('Descripción de la torta:', descripcion_torta);
    console.log('Nombre del archivo de imagen:', imagenFileName);
    console.log('ID del usuario:', userId);

    // Crear la torta
    const tortaNueva = await Torta.create({
      nombre_torta,
      descripcion_torta,
      imagen: imagenFileName, // Guardar la ruta completa en la base de datos
      id_usuario: userId,
    });

    console.log('Torta guardada exitosamente:', tortaNueva);

    // Crear la receta automática
    await crearRecetaAutomatica(tortaNueva.ID_TORTA,userId,nombre_torta);

     // Calcular el costo total de la receta automáticamente creada
     const costoRecetaAutomatica = await calcularCostoTotalReceta(tortaNueva.ID_TORTA);
     // Actualizar la lista de precios con el costo de la receta automáticamente creada
     const [listaPrecio, created] = await ListaPrecios.findOrCreate({
      where: { id_torta: tortaNueva.ID_TORTA },
      defaults: {
        nombre_torta: tortaNueva.nombre_torta,
        costo_total: costoRecetaAutomatica,
        id_usuario: userId,
      },
    });
    if (!created) {
      await ListaPrecios.update(
        { costo_total: costoRecetaAutomatica },
        { where: { id_torta: tortaNueva.ID_TORTA } }
      );
    }
    

    res.json({ success: true, torta: tortaNueva });
  } catch (error) {
    console.error('Error al guardar la torta:', error);
    if (error.name === 'SequelizeValidationError') {
      res.status(400).json({ error: 'Error de validación al crear la receta', details: error.errors });
    } else {
      res.status(500).json({ error: 'Error al guardar la torta', details: error.message });
    }
  }
};

// Controlador para editar una torta existente
exports.editarTorta = async (req, res) => {
  const { id } = req.params;
  const { nombre_torta, descripcion_torta } = req.body;
  let imagenLocalPath = '';

  console.log('Params:', req.params);
  console.log('Body:', req.body);
  console.log('File:', req.file);

  // Verifica si se subió una nueva imagen
  if (req.file) {
    imagenLocalPath = req.file.filename; // Nombre del archivo sin la ruta
  }

  console.log('ID:', id);
  console.log('Nombre Torta:', nombre_torta);
  console.log('Descripción Torta:', descripcion_torta);
  console.log('Imagen Local Path:', imagenLocalPath);

  try {
    // Verifica si se subió una nueva imagen antes de actualizar
    if (req.file) {
      await Torta.update(
        {
          nombre_torta,
          descripcion_torta,
          imagen: `uploads\${imagenLocalPath}`, // Guardar la ruta relativa en la base de datos
        },
        {
          where: { ID_TORTA: id },
        }
      );
    } else {
      // No hay nueva imagen, actualiza solo nombre y descripción
      await Torta.update(
        {
          nombre_torta,
          descripcion_torta,
        },
        {
          where: { ID_TORTA: id },
        }
      );
    }

    console.log('Torta editada exitosamente');
    res.json({ success: true });
  } catch (error) {
    console.error('Error al editar la torta:', error);
    res.status(500).json({ error: 'Error al editar la torta' });
  }
};

// Controlador para eliminar una torta
exports.eliminarTorta = async (req, res) => {
  const { id } = req.params;

  try {
    // Eliminar las recetas asociadas a la torta
    await Receta.destroy({
      where: { ID_TORTA: id },
    });

    // Eliminar las entradas correspondientes en la lista de precios para la torta
    await ListaPrecios.destroy({
      where: { id_torta: id },
    });

    // Después de eliminar las recetas y las entradas de la lista de precios, eliminar la torta
    await Torta.destroy({
      where: { ID_TORTA: id },
    });

    console.log('Torta eliminada exitosamente');
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar la torta:', error);
    res.status(500).json({ error: 'Error al eliminar la torta' });
  }
};