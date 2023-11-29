const { actualizarStockIngredientes } = require('../services/actualizacionStock');
const Receta = require('../models/Receta');
const Venta = require('../models/Venta');
const { calcularGanancias } = require('../services/gananciasService');
const ListaPrecios = require('../models/ListaPrecios');

exports.registrarVenta = async (req, res) => {
  const { id_torta } = req.body;

  console.log('Datos recibidos en la solicitud:', req.body);
  if (typeof id_torta === 'undefined') {
    return res.status(400).json({ success: false, error: 'El campo id_torta es requerido' });
  }
  try {
    console.log('Obteniendo el precio de la torta con id_torta:', id_torta);
    
    // Buscar el precio de la torta en lista_precios
    const precioTortaData = await ListaPrecios.findOne({ where: { id_torta } });
    
    if (!precioTortaData) {
      throw new Error('No se encontró el precio de la torta en lista_precios');
    }
    
    const precioTorta = precioTortaData.costo_total; // Obtiene el precio de la torta
    console.log(precioTorta);
    console.log('Creando nueva venta con id_torta:', id_torta);

    // Crea la venta con el precio de la torta
    const venta = await Venta.create({
      ID_TORTA: id_torta,
      precio_torta: precioTorta,
    });

    console.log('Venta creada:', venta);
    
    try {
      // Obtener la receta correspondiente al ID_TORTA
      const receta = await Receta.findOne({ where: { ID_TORTA: id_torta } });

      if (!receta) {
        throw new Error('No se encontró la receta');
      }

      // Después de crear una nueva venta exitosamente
      await actualizarStockIngredientes(receta.ID_TORTA); // Pasar el ID_TORTA de la receta

      res.json({ success: true, venta });
    } catch (error) {
      console.error('Error al actualizar el stock de ingredientes:', error);
      return res.status(500).json({ success: false, error: 'Error al actualizar el stock de ingredientes' });
    }
  } catch (error) {
    console.error('Error al registrar la venta:', error);
    res.status(500).json({ success: false, error: 'Error al registrar la venta' });
  }
};

exports.obtenerCantidadVentas = async (req, res) => {
  try {
    const cantidadVentas = await Venta.count(); // Esto cuenta todas las ventas en la tabla
    res.json({ cantidadVentas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener la cantidad de ventas.' });
  }
};

exports.obtenerGanancias = async (req, res) => {
  try {
    const ganancias = await calcularGanancias();
    res.json({ ganancias });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener las ganancias.' });
  }
};









