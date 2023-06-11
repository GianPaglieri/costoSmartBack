const express = require('express');
const router = express.Router();

const tortasController = require('../controllers/tortasController');

// Ruta para obtener todas las tortas
router.get('/', tortasController.obtenerTortas);

// Ruta para crear una nueva receta
router.post('/crear-receta', tortasController.crearReceta);

// Ruta para obtener una receta por su ID
router.get('/recetas/:id', (req, res) => {
    const idReceta = req.params.id;

    Torta.findByPk(idReceta)
        .then((receta) => {
            if (!receta) {
                // Si no se encuentra la receta, enviar una respuesta de error
                res.status(404).json({ error: 'Receta no encontrada' });
            } else {
                // Si se encuentra la receta, enviar la respuesta con los datos de la receta
                res.json(receta);
            }
        })
        .catch((error) => {
            console.error('Error al obtener la receta:', error);
            res.status(500).json({ error: 'Error al obtener la receta' });
        });
});
module.exports = router;
