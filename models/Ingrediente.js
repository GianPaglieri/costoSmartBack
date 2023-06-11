const { Sequelize, DataTypes } = require('sequelize');
const db = require('../database/connection');

const Ingrediente = db.define(
  'Ingrediente',
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    unidad_Medida: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tamano_Paquete: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    costo: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    CantidadStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'ingredientes',
    timestamps: false,
  }
);

module.exports = Ingrediente;



