const { Sequelize } = require('sequelize');

const db = new Sequelize('costoSmart', 'root', 'admin', {
    host: 'database', // Cambiado de la dirección IP a "database"
    port: '3306',     // Puerto del contenedor MySQL en Docker
    dialect: 'mysql',
});

module.exports = db;



