const { Sequelize, DataTypes } = require('sequelize');
const db = require('../database/connection');
const Torta = require('./Torta');
const Usuario = require('./User');

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
  precio_torta: {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: 'precio_torta', // Nombre de la columna en la base de datos
  },
  fecha_venta: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), // Valor por defecto como la fecha actual
    field: 'fecha_venta', // Nombre de la columna en la base de datos
  },
  id_usuario: { // Agrega la columna id_usuario
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario, // Modelo de la entidad Usuario
      key: 'ID' // La columna de referencia en la tabla Usuario (ajusta esto según tu estructura de base de datos)
    }
  }
}, {
  tableName: 'ventas',
  timestamps: false,
});

Venta.belongsTo(Torta, { foreignKey: 'ID_TORTA', targetKey: 'ID_TORTA' });

module.exports = Venta;




