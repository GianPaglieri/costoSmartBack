const { Sequelize } = require('sequelize');

const db = new Sequelize('costoSmart', 'root', 'admin', {
    logging: console.log, // Habilita la depuración de Sequelize
    
    host: 'localhost', // Cambiado de la dirección IP a "database" localhost
    port: '3307',     // Puerto del contenedor MySQL en Docker 3306
    dialect: 'mysql',
});

module.exports = db;



