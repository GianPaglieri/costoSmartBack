const ListaPrecios = require('../models/ListaPrecios');
const Receta = require('../models/Torta');
const Ingrediente = require('../models/Ingrediente');

exports.actualizarCostoTotalReceta = async (req, res) => {
    try {
        const { idTorta } = req.body;

        // Obtener la receta con el ID proporcionado
        const receta = await Receta.findOne({ where: { id_torta: idTorta } });

        if (!receta) {
            throw new Error('No se encontró la receta');
        }

        // Calcular el costo total de la receta
        const costoTotal = await calcularCostoTotalReceta(idTorta);

        // Actualizar el costo total en la tabla lista_precios
        await ListaPrecios.upsert({
            id_torta: receta.id_torta,
            nombre_torta: receta.nombre_torta,
            costo_total: costoTotal,
        });

        res.status(200).json({ message: 'Costo total de la receta actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar el costo total de la receta:', error);
        res.status(500).json({ error: 'Error al actualizar el costo total de la receta' });
    }
};

