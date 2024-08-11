const { Sequelize, DataTypes } = require('sequelize');
const db = require('../database/connection');
const Usuario = require('./User');


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
    tableName: 'ingredientes',
    timestamps: false,
  }
);



module.exports = Ingrediente;



