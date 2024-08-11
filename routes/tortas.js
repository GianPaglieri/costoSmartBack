const express = require('express');
const router = express.Router();
const tortasController = require('../controllers/tortasController');
const upload = require('../multerConfig');

// Ruta para obtener todas las tortas
router.get('/', tortasController.obtenerTortas);
// Ruta para obtener todas las tortas con sus precios
router.get('/tortas-con-precios', async (req, res) => {
    try {
        // Obtener todas las tortas
        const tortas = await Torta.findAll();
        
        // Obtener los precios de todas las tortas desde ListaPrecios
        const preciosTortas = await ListaPrecios.findAll();
        
        // Mapear las tortas y añadirles el precio correspondiente
        const tortasConPrecio = tortas.map(torta => {
            const precioTorta = preciosTortas.find(precio => precio.id_torta === torta.ID_TORTA);
            return {
                ID_TORTA: torta.ID_TORTA,
                nombre_torta: torta.nombre_torta,
                descripcion_torta: torta.descripcion_torta,
                imagen: torta.imagen,
                precio: precioTorta ? precioTorta.costo_total : null
            };
        });
        
        // Responder con las tortas y sus precios
        res.json(tortasConPrecio);
    } catch (error) {
        console.error('Error al obtener las tortas con precio:', error);
        res.status(500).json({ error: 'Error al obtener las tortas con precio' });
    }
});
router.post('/', upload.single('imagen'),tortasController.guardarTorta);
router.put('/:id', upload.single('imagen'), tortasController.editarTorta);
router.delete('/:id', tortasController.eliminarTorta);

module.exports = router;
