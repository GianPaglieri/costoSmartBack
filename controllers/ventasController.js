const Venta = require('../models/Venta');
const { actualizarStockIngredientes } = require('../services/actualizacionStock');

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
      // Después de crear una nueva venta exitosamente
      await actualizarStockIngredientes(id_torta);
    } catch (error) {
      console.error('Error al actualizar el stock de ingredientes:', error);
      return res.status(500).json({ success: false, error: 'Error al actualizar el stock de ingredientes' });
    }
    
    res.json({ success: true, venta });
  } catch (error) {
    console.error('Error al registrar la venta:', error);
    res.status(500).json({ success: false, error: 'Error al registrar la venta' });
  }
};








