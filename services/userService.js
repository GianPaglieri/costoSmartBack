const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { ensurePackagingForUser } = require('./packagingService');
require('../config/env');

const JWT_SECRET = process.env.JWT_SECRET;
const RESET_SECRET_KEY = process.env.RESET_SECRET_KEY || JWT_SECRET;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const hasMailCredentials = EMAIL_USER && EMAIL_PASS;
const transporter = hasMailCredentials
  ? nodemailer.createTransport({
      service: 'Gmail',
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    })
  : null;

const normalizeFrontendUrl = () => {
  if (!FRONTEND_URL) {
    return null;
  }
  return FRONTEND_URL.endsWith('/') ? FRONTEND_URL.slice(0, -1) : FRONTEND_URL;
};

exports.loginUser = async ({ email, contrasena }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const isMatch = await bcrypt.compare(contrasena, user.contrasena);
  if (!isMatch) {
    throw new Error('Credenciales inválidas');
  }

  const payload = {
    userId: user.id,
    email: user.email,
    name: user.nombre || (user.email ? user.email.split('@')[0] : null),
    role: user.rol || 'Administrador',
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  const userPublic = {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    role: user.rol || 'Administrador',
  };

  return { token, user: userPublic };
};

exports.createUser = async ({ nombre, email, contrasena }) => {
  const hashedPassword = await bcrypt.hash(contrasena, 10);
  const user = await User.create({ nombre, email, contrasena: hashedPassword });
  await ensurePackagingForUser(user.id);
  return user;
};

exports.getUsers = async () => {
  return User.findAll();
};

exports.requestPasswordReset = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  if (!transporter) {
    throw new Error('Servicio de correo no configurado');
  }

  const resetToken = jwt.sign(
    { userId: user.id, action: 'reset-password' },
    RESET_SECRET_KEY,
    { expiresIn: '1h' }
  );

  const frontendBase = normalizeFrontendUrl();
  const resetLink = frontendBase
    ? `${frontendBase}/reset-password/${resetToken}`
    : `${resetToken}`;

  await transporter.sendMail({
    from: EMAIL_USER,
    to: user.email,
    subject: 'Recuperación de contraseña',
    html: `
      <p>Hola ${user.nombre || ''},</p>
      <p>Para restablecer tu contraseña hacé clic en el siguiente enlace (válido por 1 hora):</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>Si no solicitaste este cambio, podés ignorar este correo.</p>
    `,
  });
};

exports.resetPassword = async (token, newPassword) => {
  const decoded = jwt.verify(token, RESET_SECRET_KEY);
  if (decoded.action !== 'reset-password') {
    throw new Error('Token inválido');
  }

  const user = await User.findByPk(decoded.userId);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.contrasena = hashedPassword;
  await user.save();
};

exports.changePassword = async ({ userId, currentPassword, newPassword }) => {
  const user = await User.findByPk(userId);
  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.status = 404;
    throw error;
  }

  const matches = await bcrypt.compare(currentPassword, user.contrasena);
  if (!matches) {
    const error = new Error('La contraseña actual no es correcta');
    error.status = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.contrasena = hashedPassword;
  await user.save();
};
