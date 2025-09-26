const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ensurePackagingForUser } = require('./packagingService');
const nodemailer = require('nodemailer');
require('../config/env');

const JWT_SECRET = process.env.JWT_SECRET;
const RESET_SECRET_KEY = process.env.RESET_SECRET_KEY || JWT_SECRET;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Nodemailer config
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: { user: EMAIL_USER, pass: EMAIL_PASS }
});

// Login
exports.loginUser = async ({ email, contrasena }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('Usuario no encontrado');
  
  const isMatch = await bcrypt.compare(contrasena, user.contrasena);
  if (!isMatch) throw new Error('Credenciales invalidas');

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
  return token;
};

// Registro
exports.createUser = async ({ nombre, email, contrasena }) => {
  const hashedPassword = await bcrypt.hash(contrasena, 10);
  const user = await User.create({ nombre, email, contrasena: hashedPassword });

  await ensurePackagingForUser(user.id);

  return user;
};

// Listado de usuarios
exports.getUsers = async () => {
  return await User.findAll();
};

// Solicitud de reset password
exports.requestPasswordReset = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('Usuario no encontrado');

  const resetToken = jwt.sign(
    { userId: user.id, action: 'reset-password' },
    RESET_SECRET_KEY,
    { expiresIn: '1h' }
  );

  const resetLink = `${FRONTEND_URL}/reset-password/${resetToken}`;

  await transporter.sendMail({
    from: EMAIL_USER,
    to: user.email,
    subject: 'Recuperacion de contrasena',
    html: `
      <p>Hola ${user.nombre},</p>
      <p>Para restablecer tu contrasena haz clic en el siguiente enlace (valido 1 hora):</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>Si no solicitaste esto, puedes ignorar este correo.</p>
    `
  });
};

// Reset password
exports.resetPassword = async (token, newPassword) => {
  const decoded = jwt.verify(token, RESET_SECRET_KEY);
  if (decoded.action !== 'reset-password') throw new Error('Token invalido');

  const user = await User.findByPk(decoded.userId);
  if (!user) throw new Error('Usuario no encontrado');

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.contrasena = hashedPassword;
  await user.save();
};
