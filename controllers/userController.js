const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Clave secreta para firmar el token
const secretKey = 'tu_secreto';

// Configurar nodemailer
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'costosmart@gmail.com',
    pass: 'ying zogt pmuc ieic'
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

    // Compara directamente la contraseña ingresada con la almacenada
    if (contrasena !== user.contrasena) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Genera un token firmado con la clave secreta
    const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });

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
    // Aplicar hash a la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const user = await User.create({
      nombre,
      email,
      contrasena: hashedPassword, // Guardar la contraseña encriptada en la base de datos
    });

    console.log('Usuario creado exitosamente');
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

exports.getUsers = (req, res) => {
  User.findAll()
    .then((users) => {
      res.json(users);
    })
    .catch((error) => {
      console.error('Error al obtener los usuarios:', error);
      res.status(500).json({ error: 'Error al obtener los usuarios' });
    });
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

    // Generar un token de restablecimiento
    const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });

    // Enviar el correo electrónico con el enlace de restablecimiento
    const resetLink = `http://localhost:3000/reset-password/${token}`;
    await transporter.sendMail({
      to: email,
      subject: 'Recuperación de contraseña',
      html: `<p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p><p><a href="${resetLink}">${resetLink}</a></p>`
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
    const decoded = jwt.verify(token, secretKey);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    user.contrasena = hashedPassword;
    await user.save();

    res.json({ success: true, message: 'Contraseña restablecida con éxito' });
  } catch (error) {
    console.error('Error al restablecer la contraseña:', error);
    res.status(500).json({ error: 'Error al restablecer la contraseña' });
  }
};
