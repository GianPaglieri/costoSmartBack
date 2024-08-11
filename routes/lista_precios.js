const express = require('express');
const router = express.Router();
const ListaPrecios = require('../models/ListaPrecios');
const listaPreciosController = require('../controllers/listaPreciosController');


router.get('/', listaPreciosController.obtenerListaPreciosConImagen);



module.exports = router;

