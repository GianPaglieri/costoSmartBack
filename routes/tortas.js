const express = require('express');
const router = express.Router();
const tortaController = require('../controllers/tortaController');
const upload = require('../multerConfig');

// IMPORTAR LOS MODELOS que estás usando directamente:
const Torta = require('../models/Torta');
const ListaPrecios = require('../models/ListaPrecios');

// Ruta para obtener todas las tortas del usuario (usando el controller normal)
router.get('/', tortaController.obtenerTortas);

// Ruta para obtener todas las tortas con sus precios (este es el bloque que vos mismo definiste)
router.get('/tortas-con-precios', async (req, res) => {
    try {
        const tortas = await Torta.findAll();
        const preciosTortas = await ListaPrecios.findAll();
        
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

        res.json(tortasConPrecio);
    } catch (error) {
        console.error('Error al obtener las tortas con precio:', error);
        res.status(500).json({ error: 'Error al obtener las tortas con precio' });
    }
});

// 👇 Cambiamos guardarTorta por crearTorta (según el nuevo controller)
router.post('/', upload.single('imagen'), tortaController.crearTorta);
router.put('/:id', upload.single('imagen'), tortaController.editarTorta);
router.delete('/:id', tortaController.eliminarTorta);

module.exports = router;
