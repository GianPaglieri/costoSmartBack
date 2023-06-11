const { Sequelize } = require('sequelize');

// Configura los datos de conexi�n a tu base de datos
const db = new Sequelize('costoSmart', 'root', 'admin', {
    host: 'localhost',
    port: '3307',
    dialect: 'mysql',
});

module.exports = db;



