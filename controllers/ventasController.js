const Venta = require('../models/venta');
const { actualizarStockIngredientes } = require('../services/actualizacionStock');

exports.registrarVenta = async (req, res) => {
  const { id_torta } = req.body;

  console.log('Datos recibidos en la solicitud:', req.body);

  try {
    console.log('Creando nueva venta con id_torta:', id_torta);
    const venta = await Venta.create({
      id_torta,
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







