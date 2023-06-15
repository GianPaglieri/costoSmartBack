const { Sequelize, DataTypes } = require('sequelize');
const db = require('../database/connection');
const Torta = require('./Torta');

const Venta = db.define('Venta', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ID_TORTA: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_torta', // Nombre de la columna en la base de datos
  },
}, {
  tableName: 'ventas',
  timestamps: false,
});

Venta.belongsTo(Torta, { foreignKey: 'ID_TORTA', targetKey: 'ID_TORTA' });

module.exports = Venta;




