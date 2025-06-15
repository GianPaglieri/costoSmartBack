const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const db = require('./database/connection');
const path = require('path');
const { actualizarListaPrecios, calcularCostoTotalReceta } = require('./services/calculadoraCostos');
const upload = require('./multerConfig'); 
const { guardarReceta } = require('./controllers/recetasController');

// Conexión a la base de datos
db.authenticate()
  .then(() => {
    console.log('Conexión exitosa a la base de datos');
  })
  .catch((error) => {
    console.error('Error al conectar a la base de datos:', error);
  });

// ******************************
// CONFIGURACIÓN CORS ABIERTA (SOLO PARA DESARROLLO)
// ******************************



const corsOptions = {
    origin: '*', // <- PERMITE TODOS
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // <-- NECESARIO para solicitudes preflight


// ******************************
// FIN CONFIGURACIÓN CORS
// ******************************

app.use(express.json());


// Importar rutas
const ingredientesRoutes = require('./routes/ingredientes');
const tortasRoutes = require('./routes/tortas');
const recetasRoutes = require('./routes/recetas');
const listaPreciosRoutes = require('./routes/lista_precios');
const ventasRoutes = require('./routes/ventas');
const userRoutes = require('./routes/users');
const loginRoutes = require('./routes/login');

// Configurar rutas
app.use('/ventas', ventasRoutes);
app.use('/users', userRoutes);
app.use('', loginRoutes); // /api/login disponible
app.use('/ingredientes', ingredientesRoutes);
app.use('/tortas', tortasRoutes);
app.use('/recetas', recetasRoutes);
app.use('/lista_precios', listaPreciosRoutes);

// Ruta para subir imágenes
//app.post('/recetas', upload.single('imagen'), guardarReceta);

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Puerto del servidor
const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`CORS abierto: cualquier origen permitido (modo desarrollo)`);
});
