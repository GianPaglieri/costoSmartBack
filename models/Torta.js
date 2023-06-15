const { Sequelize, DataTypes } = require('sequelize');
const db = require('../database/connection');


const Torta = db.define(
    'Torta',
    {
        ID_TORTA: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombre_torta: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        descripcion_torta: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: 'tortas',
        timestamps: false,
    }
);




module.exports = Torta;
