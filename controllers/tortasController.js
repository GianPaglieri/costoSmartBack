const Torta = require('../models/Torta');


// Controlador para obtener todas las tortas
exports.obtenerTortas = (req, res) => {
  Torta.findAll()
    .then((tortas) => {
      res.json(tortas);
    })
    .catch((error) => {
      console.error('Error al obtener las tortas:', error);
      res.status(500).json({ error: 'Error al obtener las tortas' });
    });
};







