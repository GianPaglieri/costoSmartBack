const { Sequelize, DataTypes } = require('sequelize');
const db = require('../database/connection');
const Ingrediente = require('./Ingrediente');
const Torta = require('./Torta');
const Usuario = require('./User');

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
      allowNull: true,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_usuario: { // Agrega la columna id_usuario
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Usuario, // Modelo de la entidad Usuario
        key: 'ID' // La columna de referencia en la tabla Usuario (ajusta esto según tu estructura de base de datos)
      }
    }
  },
  {
    tableName: 'recetas',
    timestamps: false,
  }
);

Receta.belongsTo(Ingrediente, { foreignKey: 'ID_INGREDIENTE'});
Receta.belongsTo(Torta, { foreignKey: 'ID_TORTA' });
module.exports = Receta;

