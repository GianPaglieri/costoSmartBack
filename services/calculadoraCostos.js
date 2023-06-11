const Ingrediente = require('../models/Ingrediente');
const Recetas = require('../models/Torta');
const ListaPrecios = require('../models/ListaPrecios');

// Función para calcular el costo total de una receta
const calcularCostoTotalReceta = async (idTorta) => {
    try {
        // Obtiene la receta con el ID proporcionado
        const receta = await Recetas.findOne({ where: { id_torta: idTorta } });

        if (!receta) {
            throw new Error('No se encontró la receta');
        }

        // Obtiene los ingredientes y cantidades asociadas a la receta
        const ingredientesReceta = await Recetas.findAll({
            where: { id_torta: idTorta },
            include: [{ model: Ingrediente, as: 'Ingrediente' }],
        });

        // Calcula el costo total de la receta sumando el costo unitario ajustado por el tamaño del paquete de cada ingrediente
        let costoTotal = 0;
        ingredientesReceta.forEach((ingredienteReceta) => {
            const ingrediente = ingredienteReceta.Ingrediente;
            const cantidadIngrediente = ingredienteReceta.cantidad_ingrediente;
            const costoUnitario = ingrediente.costo;
            const tamanoPaquete = ingrediente.tamano_Paquete;

            // Calcula el costo unitario ajustado considerando el tamaño del paquete
            const costoUnitarioAjustado = costoUnitario / tamanoPaquete;

            const costoIngrediente = costoUnitarioAjustado * cantidadIngrediente;
            costoTotal += costoIngrediente;
        });

        return costoTotal;
    } catch (error) {
        throw new Error(`Error al calcular el costo total de la receta: ${error.message}`);
    }
};



const actualizarListaPrecios = async () => {
    try {
        // Obtiene todas las recetas existentes
        const recetas = await Recetas.findAll();

        // Recorre cada receta y calcula su costo total
        for (const receta of recetas) {
            const costoTotal = await calcularCostoTotalReceta(receta.id_torta);

            // Verifica si ya existe una entrada en lista_precios para la receta actual
            const listaPrecioExistente = await ListaPrecios.findOne({
                where: { id_torta: receta.id_torta },
            });

            if (listaPrecioExistente) {
                // Actualiza el costo total de la receta existente
                await ListaPrecios.update(
                    { costo_total: costoTotal },
                    { where: { id_torta: receta.id_torta } }
                );
            } else {
                // Crea una nueva entrada en lista_precios para la receta
                await ListaPrecios.create({
                    id_torta: receta.id_torta,
                    nombre_torta: receta.nombre_torta,
                    costo_total: costoTotal,
                });
            }
        }

        console.log('Migración de lista_precios completada');
    } catch (error) {
        console.error('Error al migrar los datos de lista_precios:', error);
    }
};

module.exports = { calcularCostoTotalReceta, actualizarListaPrecios };



