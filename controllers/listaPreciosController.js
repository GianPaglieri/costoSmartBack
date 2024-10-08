const Sequelize = require('sequelize');
const ListaPrecios = require('../models/ListaPrecios');
const Receta = require('../models/Receta');
const Torta = require('../models/Torta');
const Ingrediente = require('../models/Ingrediente');
const jwt = require('jsonwebtoken');

const obtenerUserId = (req) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    throw new Error('Token de autenticación no proporcionado');
  }

  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, 'secreto');
  return decoded.userId;
};

exports.actualizarCostoTotalReceta = async (req, res) => {
  try {
    const { idTorta } = req.body;
    const userId = obtenerUserId(req);
    console.log('ID de usuario obtenido del token:', userId);

    const receta = await Receta.findOne({ where: { id_torta: idTorta } });
    console.log('Receta encontrada:', receta);

    if (!receta) {
      throw new Error('No se encontró la receta');
    }

    const costoTotal = await calcularCostoTotalReceta(idTorta);
    console.log('Costo total calculado:', costoTotal);
    console.log('Datos a guardar en ListaPrecios:', {
      id_torta: receta.id_torta,
      nombre_torta: receta.nombre_torta,
      costo_total: costoTotal,
      id_usuario: userId
    });

    const result = await ListaPrecios.upsert({
      id_torta: receta.id_torta,
      nombre_torta: receta.nombre_torta,
      costo_total: costoTotal,
      id_usuario: userId
    });
    console.log('Resultado de upsert en ListaPrecios:', result);

    res.status(200).json({ message: 'Costo total de la receta actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el costo total de la receta:', error);
    res.status(500).json({ error: 'Error al actualizar el costo total de la receta' });
  }
};

exports.obtenerListaPreciosConImagen = async (req, res) => {
  try {
    const userId = obtenerUserId(req);
    console.log('Datos del usuario autenticado:', userId);

    const listaPrecios = await ListaPrecios.findAll({ where: { id_usuario: userId } });


    const listaPreciosConImagen = await Promise.all(listaPrecios.map(async (item) => {
      
      
      const torta = await Torta.findOne({ where: { id_torta: item.id_torta } });
  
      
      return {
        ...item.toJSON(),
        imagen_torta: torta.imagen
      };
    }));

    res.json(listaPreciosConImagen);
  } catch (error) {
    console.error('Error al obtener la lista de precios con imagen:', error);
    res.status(500).json({ error: 'Error al obtener la lista de precios con imagen' });
  }
};
