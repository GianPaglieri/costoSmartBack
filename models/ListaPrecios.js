const { Sequelize, DataTypes } = require('sequelize');
const db = require('../database/connection');

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
    },
    {
        tableName: 'lista_precios',
        timestamps: false,
    }
);

module.exports = ListaPrecios;
