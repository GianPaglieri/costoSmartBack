const Sequelize = require('sequelize');
const ListaPrecios = require('../models/ListaPrecios');
const Receta = require('../models/Receta');
const Torta = require('../models/Torta');
const Ingrediente = require('../models/Ingrediente');
const { obtenerUserIdDesdeRequest } = require('../middleware/authMiddleware');
const { calcularCostoTotalReceta } = require('../services/calculadoraCostos');


exports.actualizarCostoTotalReceta = async (req, res) => {
  try {
    const { idTorta } = req.body;
    const userId = obtenerUserIdDesdeRequest(req, res);
    if (!userId) return;
    // console.log('ID de usuario obtenido del token:', userId);

    const receta = await Receta.findOne({
      where: { ID_TORTA: idTorta, id_usuario: userId }
    });
    // console.log('Receta encontrada:', receta);

    if (!receta) {
      throw new Error('No se encontró la receta');
    }

    const costoTotal = await calcularCostoTotalReceta(idTorta, userId);
    // console.log('Costo total calculado:', costoTotal);
    /* console.log('Datos a guardar en ListaPrecios:', {
      id_torta: receta.ID_TORTA,
      nombre_torta: receta.nombre_torta,
      costo_total: costoTotal,
      id_usuario: userId
    }); */

    const result = await ListaPrecios.upsert({
      id_torta: receta.ID_TORTA,
      nombre_torta: receta.nombre_torta,
      costo_total: costoTotal,
      id_usuario: userId
    });
    // console.log('Resultado de upsert en ListaPrecios:', result);

    res.status(200).json({ message: 'Costo total de la receta actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el costo total de la receta:', error);
    res.status(500).json({ error: 'Error al actualizar el costo total de la receta' });
  }
};

exports.obtenerListaPreciosConImagen = async (req, res) => {
  try {
    const userId = obtenerUserIdDesdeRequest(req, res);
    if (!userId) return;
    // console.log('Datos del usuario autenticado:', userId);

    const listaPrecios = await ListaPrecios.findAll({ where: { id_usuario: userId } });


    const listaPreciosConImagen = await Promise.all(listaPrecios.map(async (item) => {
      
      
      const torta = await Torta.findOne({ where: { ID_TORTA: item.id_torta } });
  
      
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
