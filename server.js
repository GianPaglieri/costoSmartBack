const express = require('express');
const cors = require('cors');
const app = express();
require('./config/env');
const db = require('./database/connection');
const path = require('path');

// Conexion a la base de datos
db.authenticate().catch((error) => {
  console.error('Error al conectar a la base de datos:', error);
});

// ******************************
// CONFIGURACIÓN CORS
// ******************************

// Permitir lista de orígenes separados por coma o wildcard en desarrollo
const rawCorsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
const parsedOrigins = rawCorsOrigin
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

if (parsedOrigins.includes('*')) {
  console.warn(
    "Advertencia: CORS configurado con origen abierto ('*'). Úsalo solo en desarrollo."
  );
}

const corsOptions = {
  origin: parsedOrigins.length === 1 ? parsedOrigins[0] : parsedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // necesario para preflight

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
const errorHandler = require('./middleware/errorHandler');

// Configurar rutas
app.use('/ventas', ventasRoutes);
app.use('/users', userRoutes);
app.use('/ingredientes', ingredientesRoutes);
app.use('/tortas', tortasRoutes);
app.use('/recetas', recetasRoutes);
app.use('/lista_precios', listaPreciosRoutes);

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Manejo de errores
app.use(errorHandler);

// Puerto del servidor
const PORT = process.env.PORT || 3010;

app.listen(PORT);
