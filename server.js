const express = require('express');
const cors = require('cors');
const app = express();

const db = require('./database/connection');
const path = require('path'); // Agregado para utilizar el módulo 'path'
const { actualizarListaPrecios, calcularCostoTotalReceta } = require('./services/calculadoraCostos');
const upload = require('./multerConfig'); 
const { guardarReceta } = require('./controllers/recetasController');


db.authenticate()
    .then(() => {
        console.log('Conexion exitosa a la base de datos');
    })
    .catch((error) => {
        console.error('Error al conectar a la base de datos:', error);
    });

app.use(cors());
app.use(express.json());

const ingredientesRoutes = require('./routes/ingredientes');
const tortasRoutes = require('./routes/tortas');
const recetasRoutes = require('./routes/recetas');

const listaPreciosRoutes = require('./routes/lista_precios');
const ventasRoutes = require('./routes/ventas');
const userRoutes = require('./routes/users');
const loginRoutes = require('./routes/login');

app.use('/ventas', ventasRoutes);
app.use('/users', userRoutes);
app.use('/', loginRoutes);
app.use('/ingredientes', ingredientesRoutes);
app.use('/tortas', tortasRoutes);


// Utiliza multer en la ruta de recetas para manejar la carga de imágenes
app.post('/recetas', upload.single('imagen'), guardarReceta);



app.use('/recetas', recetasRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/lista_precios', listaPreciosRoutes);




const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
