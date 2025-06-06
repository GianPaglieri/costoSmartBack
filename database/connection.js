const { Sequelize } = require('sequelize');

const db = new Sequelize('costoSmart', 'root', '',
    
    {
    logging: console.log, // Habilita la depuración de Sequelize
    
    host: 'vps-4715369-x.dattaweb.com', // Cambiado de la dirección IP a "database" localhost
    port: '5765',     // Puerto del contenedor MySQL en Docker 3306
    dialect: 'mysql',
});

module.exports = db;



