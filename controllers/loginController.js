const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Clave secreta para firmar el token
const secretKey = 'tu_secreto'; // Reemplaza 'tu_secreto' con tu propia clave secreta

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

    const isMatch = await bcrypt.compare(contrasena, user.contrasena);

    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Genera un token firmado con la clave secreta
    const token = jwt.sign({ userId: user.id }, 'secreto', { expiresIn: '1h' });

    res.json({ success: true, token });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};