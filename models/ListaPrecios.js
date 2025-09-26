const { Sequelize, DataTypes } = require('sequelize');
const db = require('../database/connection');
const Usuario = require('./User');

const ListaPrecios = db.define(
    'ListaPrecio',
    {
        id_torta: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: false,
        },
        nombre_torta: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        costo_total: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        precio_lista: {
            type: DataTypes.FLOAT,
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
        tableName: 'lista_precios',
        timestamps: false,
    }
);

module.exports = ListaPrecios;
