

const { Sequelize, DataTypes } = require('sequelize');
const db = require('../database/connection');

const User = db.define(
  'User',
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: true, // Permitir null si lo prefieres
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Asegura que cada email sea único
    },
    contrasena: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'usuarios', // Nombre de tu tabla de usuarios en la base de datos
    timestamps: false, // Si no tienes campos de timestamps (created_at, updated_at)
  }
);

module.exports = User;