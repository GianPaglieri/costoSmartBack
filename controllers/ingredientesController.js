const Ingrediente = require('../models/Ingrediente');
const { calcularCostoTotalReceta, actualizarListaPrecios } = require('../services/calculadoraCostos');
const Usuario = require('../models/User');
const jwt = require('jsonwebtoken');

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




exports.obtenerIngredientes = async (req, res) => {
  try {
    const userId = obtenerUserId(req); // Obtener el ID de usuario autenticado
    

    // Buscar ingredientes asociados al usuario autenticado
    const ingredientes = await Ingrediente.findAll({ where: { id_usuario: userId } });

    res.json({ success: true, ingredientes });
  } catch (error) {
    console.error('Error al obtener los ingredientes del usuario:', error);
    res.status(500).json({ error: 'Error al obtener los ingredientes del usuario' });
  }
};


// Controlador para guardar un ingrediente asociado al usuario autenticado
exports.guardarIngrediente = async (req, res) => {
  try {
    // Verificar si el token existe en las cabeceras de la solicitud
    const userId = obtenerUserId(req); // Obtener el ID de usuario autenticado
    

    const { nombre, unidad_Medida, tamano_Paquete, costo, CantidadStock } = req.body;
    console.log('Datos del ingrediente:', req.body);

    if (!nombre || !unidad_Medida || !tamano_Paquete || !costo || !CantidadStock) {
      return res.status(400).json({ error: 'Faltan campos requeridos para guardar el ingrediente' });
    }

    // Crear el ingrediente asociado al usuario autenticado
    await Ingrediente.create({
      nombre,
      unidad_Medida,
      tamano_Paquete,
      costo,
      CantidadStock,
      id_usuario: userId, // Asociar el ingrediente al usuario autenticado
    });

    console.log('Ingrediente guardado exitosamente');
    res.json({ success: true });
  } catch (error) {
    console.error('Error al guardar el ingrediente:', error);
    res.status(500).json({ error: 'Error al guardar el ingrediente' });
  }
};


exports.editarIngrediente = async (req, res) => {
  try {
    const userId = obtenerUserId(req); // Obtener el ID de usuario autenticado

  

    const { id } = req.params; // Obtener el ID del ingrediente de los parámetros de la URL
    const { nombre, unidad_Medida, tamano_Paquete, costo, CantidadStock } = req.body;
    console.log('Datos del ingrediente:', req.body);

    // Verificar si al menos un campo está presente para la edición
    if (!nombre && !unidad_Medida && !tamano_Paquete && costo === undefined && CantidadStock === undefined) {
      return res.status(400).json({ error: 'Debe proporcionar al menos un campo para editar el ingrediente' });
    }

    const camposActualizados = {};
    // Agregar campos a la actualización solo si están presentes en la solicitud
    if (nombre) camposActualizados.nombre = nombre;
    if (unidad_Medida) camposActualizados.unidad_Medida = unidad_Medida;
    if (tamano_Paquete) camposActualizados.tamano_Paquete = tamano_Paquete;
    if (costo !== undefined) camposActualizados.costo = costo;
    if (CantidadStock !== undefined) camposActualizados.CantidadStock = CantidadStock;

    // Actualizar el ingrediente
    await Ingrediente.update(camposActualizados, { where: { id } });
    await actualizarListaPrecios(id);
    console.log('Ingrediente editado exitosamente');
    res.json({ success: true });
  } catch (error) {
    console.error('Error al editar el ingrediente:', error);
    res.status(500).json({ error: 'Error al editar el ingrediente' });
  }
};

exports.obtenerIngredientesMenosStock = async (req, res) => {
  try {
    const userId = obtenerUserId(req); // Obtener el ID de usuario autenticado

    console.log('Datos del usuario autenticado:', userId); // Depuración: Imprimir datos del usuario autenticado

    // Obtener los ingredientes con menos stock asociados al usuario autenticado
    const ingredientes = await Ingrediente.findAll({
      attributes: ['id', 'nombre', 'unidad_Medida', 'tamano_Paquete', 'costo', 'CantidadStock'],
      where: { id_usuario: userId },
      order: [['CantidadStock', 'ASC']], // Ordenar por cantidad de stock de menor a mayor
      limit: 5, // Limitar a 5 resultados
    });

    res.json(ingredientes);
  } catch (error) {
    console.error('Error al obtener los ingredientes con menos stock:', error);
    res.status(500).json({ error: 'Error al obtener los ingredientes con menos stock' });
  }
};

exports.eliminarIngrediente = async (req, res) => {
  try {
    const userId = obtenerUserId(req); // Obtener el ID de usuario autenticado

    console.log('Datos del usuario autenticado:', userId); // Depuración: Imprimir datos del usuario autenticado

    const { id } = req.params; // Obtener el ID del ingrediente de los parámetros de la URL

    // Verificar si el ingrediente pertenece al usuario autenticado antes de eliminarlo
    const ingrediente = await Ingrediente.findOne({ where: { id, id_usuario: userId } });
    if (!ingrediente) {
      return res.status(404).json({ error: 'No se encontró el ingrediente asociado al usuario autenticado' });
    }

    // Eliminar el ingrediente
    await Ingrediente.destroy({ where: { id } });

    console.log('Ingrediente eliminado exitosamente');
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar el ingrediente:', error);
    res.status(500).json({ error: 'Error al eliminar el ingrediente' });
  }
};






