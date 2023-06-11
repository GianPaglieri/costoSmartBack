const Torta = require('../models/Torta');
const ListaPrecios = require('../models/ListaPrecios');
const { calcularCostoTotalReceta } = require('../services/calculadoraCostos');

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

// Funci�n para crear una nueva receta
exports.crearReceta = async (req, res) => {
    try {
        const { nombreTorta, idIngrediente, cantidadIngrediente } = req.body;

        // Crea la receta en la tabla Torta
        const nuevaReceta = await Torta.create({
            nombre_torta: nombreTorta,
            id_ingrediente: idIngrediente,
            cantidad_ingrediente: cantidadIngrediente,
        });

        // Calcula el costo total de la receta
        const costoTotal = await calcularCostoTotalReceta(nuevaReceta.id_torta);

        // Crea una entrada en la tabla ListaPrecios con el costo total de la receta
        await ListaPrecios.create({
            id_torta: nuevaReceta.id_torta,
            nombre_torta: nuevaReceta.nombre_torta,
            costo_total: costoTotal,
        });

        res.status(201).json({ message: 'Receta creada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

