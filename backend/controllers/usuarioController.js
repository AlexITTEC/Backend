const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuarios');

// ✅ CREAR USUARIO (con avatar por defecto)
exports.crearUsuario = async (req, res) => {
  const { email, contraseña, nombres } = req.body;

  try {
    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(400).json({ mensaje: 'El usuario ya existe' });
    }

    const nuevoUsuario = new Usuario({
      email,
      contraseña, // el pre-save ya hace el hash
      nombres,
      avatar: "http://localhost:3000/uploads/avatars/default-avatar.png" // ✅ avatar por defecto con URL completa
    });

    await nuevoUsuario.save();
    res.status(201).json({ mensaje: 'Usuario registrado correctamente' });

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar usuario', error });
  }
};

// ✅ OBTENER TODOS LOS USUARIOS
exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-contraseña');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error });
  }
};

// ✅ AUTENTICAR USUARIO (token con avatar)
exports.autenticarUsuario = async (req, res) => {
  const { email, contraseña } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const passwordCorrecta = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!passwordCorrecta) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      {
        id: usuario._id,
        nombres: usuario.nombres,
        email: usuario.email,
        rol: usuario.rol,
        avatar: usuario.avatar || "http://localhost:3000/uploads/avatars/default-avatar.png" // ✅ avatar incluido
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      usuario: {
        id: usuario._id,
        nombres: usuario.nombres,
        email: usuario.email,
        rol: usuario.rol,
        avatar: usuario.avatar || "http://localhost:3000/uploads/avatars/default-avatar.png"
      }
    });

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al autenticar usuario', error });
  }
};
