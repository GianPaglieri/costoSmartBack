const { Sequelize, DataTypes } = require('sequelize');
const db = require('../database/connection');
const Ingrediente = require('./Ingrediente');
const Torta = require('./Torta');

const Receta = db.define(
  'Receta', // Corregido el nombre de la tabla
  {
    
    ID_TORTA: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    nombre_torta: {
      type: DataTypes.STRING,
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
