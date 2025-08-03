const { Sequelize } = require('sequelize');
require('../config/env');
console.log("💡 DB_NAME ACTUAL:", process.env.DB_NAME);


const db = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    // logging: console.log, // Habilita la depuración de Sequelize
    logging: false,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
  }
);

module.exports = db;



