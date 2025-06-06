// controllers/userController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Leer claves del .env
const SECRET_KEY = process.env.SECRET_KEY;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Configurar Nodemailer para Gmail + App Password
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

exports.loginUser = async (req, res) => {
  const { email, contrasena } = req.body;
  console.log('Intentando iniciar sesión con:', req.body);

  if (!email || !contrasena) {
    return res.status(400).json({ error: 'Faltan campos requeridos para iniciar sesión' });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Comparar la contraseña ingresada con la almacenada (hasheada)
    const isMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar un token firmado con la clave secreta
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ success: true, token });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

exports.createUser = async (req, res) => {
  const { nombre, email, contrasena } = req.body;
  console.log('Datos del usuario:', req.body);

  if (!nombre || !email || !contrasena) {
    return res.status(400).json({ error: 'Faltan campos requeridos para guardar el usuario' });
  }

  try {
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const user = await User.create({
      nombre,
      email,
      contrasena: hashedPassword
    });

    console.log('Usuario creado exitosamente');
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email es requerido' });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Generar un token de restablecimiento que expire en 1 hora
    const resetToken = jwt.sign(
      { userId: user.id, action: 'reset-password' },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    // Construir el enlace de restablecimiento apuntando al frontend
    const resetLink = `${FRONTEND_URL}/reset-password/${resetToken}`;

    // Enviar el correo electrónico con el enlace de restablecimiento
    await transporter.sendMail({
      from: EMAIL_USER,
      to: user.email,
      subject: 'Recuperación de contraseña',
      html: `
        <p>Hola ${user.nombre},</p>
        <p>Para restablecer tu contraseña haz clic en el siguiente enlace (válido 1 hora):</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>Si no solicitaste esto, puedes ignorar este correo.</p>
      `
    });

    res.json({ success: true, message: 'Correo de recuperación de contraseña enviado' });
  } catch (error) {
    console.error('Error al solicitar la recuperación de contraseña:', error);
    res.status(500).json({ error: 'Error al solicitar la recuperación de contraseña' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    // Verificar que el token sea para restablecimiento
    if (decoded.action !== 'reset-password') {
      return res.status(400).json({ error: 'Token inválido para restablecer contraseña' });
    }

    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Hashear la nueva contraseña y actualizar
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.contrasena = hashedPassword;
    await user.save();

    res.json({ success: true, message: 'Contraseña restablecida con éxito' });
  } catch (error) {
    console.error('Error al restablecer la contraseña:', error);

    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    res.status(500).json({ error: 'Error al restablecer la contraseña' });
  }
};
