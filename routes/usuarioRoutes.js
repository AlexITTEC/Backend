// Importación de dependencias
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuarios');
const { enviarCodigoPorCorreo } = require('../services/emailService');
const JWT_SECRET = process.env.JWT_SECRET || 'mi_super_secreto';

// Middleware para verificar JWT
function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(403).json({ mensaje: 'Token requerido' });

  const token = authHeader.split(' ')[1] || authHeader;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
}

// ============================
// 📄 RUTAS DE USUARIO
// ============================

// Registrar usuario
router.post('/', usuarioController.crearUsuario);

// Obtener todos los usuarios (ruta pública de ejemplo)
router.get('/', usuarioController.obtenerUsuarios);

// Login de usuario (💥 Aquí agregamos el rol al token y a la respuesta)
router.post('/login', async (req, res) => {
  const { email, contraseña } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Usuario no encontrado' });
    }

    const esValida = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!esValida) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      {
        id: usuario._id,
        nombres: usuario.nombres,
        email: usuario.email,
        rol: usuario.rol // ✅ incluimos el rol aquí
      },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario._id,
        nombres: usuario.nombres,
        email: usuario.email,
        rol: usuario.rol // ✅ y aquí también
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Perfil de usuario autenticado
router.get('/perfil', verificarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select('-contraseña');
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Ruta temporal para hacer admin a un usuario existente
router.put('/set-admin/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    usuario.rol = 'admin';
    await usuario.save();

    res.json({ mensaje: `Usuario ${email} ahora es ADMIN`, usuario });
  } catch (error) {
    console.error("Error al actualizar rol:", error);
    res.status(500).json({ mensaje: 'Error al establecer rol', error });
  }
});

// ⚠️ Para producción usa una base de datos o Redis
const codigos = new Map();

// 📤 Ruta para enviar el código al correo
router.post('/enviar-codigo', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ mensaje: 'Correo es obligatorio' });

  const codigo = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await enviarCodigoPorCorreo(email, codigo);
    codigos.set(email, { codigo, expira: Date.now() + 10 * 60 * 1000 }); // 10 minutos
    res.status(200).json({ mensaje: 'Código enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar código:', error);
    res.status(500).json({ mensaje: 'Error al enviar el código' });
  }
});

// ✅ Ruta para verificar el código ingresado
router.post('/verificar-codigo', (req, res) => {
  const { email, codigo } = req.body;
  const entrada = codigos.get(email);

  if (!entrada) return res.status(404).json({ mensaje: 'Código no encontrado' });
  if (entrada.codigo !== codigo) return res.status(401).json({ mensaje: 'Código incorrecto' });
  if (Date.now() > entrada.expira) return res.status(410).json({ mensaje: 'Código expirado' });

  codigos.delete(email); // eliminamos una vez usado
  res.status(200).json({ mensaje: 'Código verificado correctamente' });
});

router.post('/reset-password', async (req, res) => {
  const { email, nuevaContraseña } = req.body;

  if (!email || !nuevaContraseña) {
    return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
  }

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // hashea nueva contraseña y guarda
 usuario.contraseña = nuevaContraseña; // El modelo lo va a hashear automáticamente
await usuario.save();


    res.json({ mensaje: 'Contraseña actualizada correctamente' });

  } catch (err) {
    console.error('Error al restablecer contraseña:', err);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

module.exports = router;
