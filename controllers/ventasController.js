const { actualizarStockIngredientes } = require('../services/actualizacionStock');
const Receta = require('../models/Receta');
const Venta = require('../models/Venta');

exports.registrarVenta = async (req, res) => {
  const { id_torta } = req.body;

  console.log('Datos recibidos en la solicitud:', req.body);

  try {
    console.log('Creando nueva venta con id_torta:', id_torta);
    const venta = await Venta.create({
      ID_TORTA: id_torta, // Utilizar el nombre del campo definido en el modelo
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









