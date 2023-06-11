const { Sequelize, DataTypes } = require('sequelize');
const db = require('../database/connection');
const Ingrediente = require('./Ingrediente');

const Torta = db.define(
    'Torta',
    {
        id_torta: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombre_torta: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        id_ingrediente: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        cantidad_ingrediente: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        unidad_medida: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: 'recetas',
        timestamps: false,
    }
);

Torta.belongsTo(Ingrediente, { foreignKey: 'id_ingrediente' });

module.exports = Torta;
