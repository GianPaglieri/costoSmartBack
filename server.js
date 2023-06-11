const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./database/connection');
const { actualizarListaPrecios, calcularCostoTotalReceta } = require('./services/calculadoraCostos');



db.authenticate()
    .then(() => {
        console.log('Conexi�n exitosa a la base de datos');
    })
    .catch((error) => {
        console.error('Error al conectar a la base de datos:', error);
    });

app.use(cors());
app.use(express.json());

const ingredientesRoutes = require('./routes/ingredientes');
const tortasRoutes = require('./routes/tortas');
const listaPreciosRoutes = require('./routes/lista_precios');
const ventasRoutes = require('./routes/ventas');
app.use('/ventas', ventasRoutes);
app.use('/ingredientes', ingredientesRoutes);
app.use('/tortas', tortasRoutes);

app.use('/lista_precios', listaPreciosRoutes);
actualizarListaPrecios();

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});


