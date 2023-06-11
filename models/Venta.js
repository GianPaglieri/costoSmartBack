const { Sequelize, DataTypes } = require('sequelize');
const db = require('../database/connection');
const Receta = require('./Torta');

const Venta = db.define('Venta', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_torta: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'ventas',
  timestamps: false,
});

Venta.belongsTo(Receta, { foreignKey: 'id_torta', targetKey: 'id_torta' });

module.exports = Venta;




