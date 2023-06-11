const express = require('express');
const router = express.Router();
const ListaPrecios = require('../models/ListaPrecios');

router.get('/', async (req, res) => {
    try {
        const listaPrecios = await ListaPrecios.findAll();
        res.json(listaPrecios);
    } catch (error) {
        console.error('Error al obtener los datos de lista_precios:', error);
        res.status(500).json({ error: 'Error al obtener los datos de lista_precios' });
    }
});

module.exports = router;


