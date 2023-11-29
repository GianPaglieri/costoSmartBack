const { Sequelize, DataTypes } = require('sequelize');
const db = require('../database/connection');
const Ingrediente = require('./Ingrediente');
const Torta = require('./Torta');

const Receta = db.define(
  'Receta',
  {
    ID_TORTA: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    ID_INGREDIENTE: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'recetas',
    timestamps: false,
  }
);

Receta.belongsTo(Ingrediente, { foreignKey: 'ID_INGREDIENTE' });
Receta.belongsTo(Torta, { foreignKey: 'ID_TORTA' });

module.exports = Receta;
