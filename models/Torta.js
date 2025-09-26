const {
    Sequelize,
    DataTypes
} = require('sequelize');
const db = require('../database/connection');
const Usuario = require('./User');



const Torta = db.define(
    'Torta', {
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
        porcentaje_ganancia: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },
         id_usuario: { // Agrega la columna id_usuario
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: Usuario, // Modelo de la entidad Usuario
              key: 'ID' // La columna de referencia en la tabla Usuario (ajusta esto según tu estructura de base de datos)
            }
          },
        

        imagen: {
            type: DataTypes.STRING, // Puedes ajustar el tipo de datos según tus necesidades
        }
    }, {
        tableName: 'tortas',
        timestamps: false,
    }
);



module.exports = Torta;
