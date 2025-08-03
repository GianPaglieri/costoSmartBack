const userService = require('../services/userService');

exports.loginUser = async (req, res) => {
  const { email, contrasena } = req.body;
  if (!email || !contrasena) return res.status(400).json({ error: 'Faltan datos' });

  try {
    const token = await userService.loginUser({ email, contrasena });
    res.json({ success: true, token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

exports.createUser = async (req, res) => {
  const { nombre, email, contrasena } = req.body;
  if (!nombre || !email || !contrasena) return res.status(400).json({ error: 'Faltan datos' });

  try {
    const user = await userService.createUser({ nombre, email, contrasena });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await userService.getUsers();
    const safeUsers = users.map(({ id, nombre, email }) => ({ id, nombre, email }));
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email es requerido' });

  try {
    await userService.requestPasswordReset(email);
    res.json({ success: true, message: 'Correo enviado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: 'Faltan datos' });

  try {
    await userService.resetPassword(token, newPassword);
    res.json({ success: true, message: 'Contraseña restablecida' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
