const userService = require('../services/userService');

exports.loginUser = async (req, res, next) => {
  const { email, contrasena } = req.body;
  if (!email || !contrasena) return res.status(400).json({ error: 'Faltan datos' });

  try {
    const { token, user } = await userService.loginUser({ email, contrasena });
    res.json({ success: true, token, user });
  } catch (error) {
    error.status = 401;
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  const { nombre, email, contrasena } = req.body;
  if (!nombre || !email || !contrasena) return res.status(400).json({ error: 'Faltan datos' });

  try {
    const user = await userService.createUser({ nombre, email, contrasena });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await userService.getUsers();
    const safeUsers = users.map(({ id, nombre, email }) => ({ id, nombre, email }));
    res.json(safeUsers);
  } catch (error) {
    next(error);
  }
};

exports.requestPasswordReset = async (req, res, next) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email es requerido' });

  try {
    await userService.requestPasswordReset(email);
    res.json({ success: true, message: 'Correo enviado' });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: 'Faltan datos' });

  try {
    await userService.resetPassword(token, newPassword);
    res.json({ success: true, message: 'Contraseña restablecida' });
  } catch (error) {
    next(error);
  }
};
