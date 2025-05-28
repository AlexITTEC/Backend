const path = require('path');

const express = require('express');
const router = express.Router();
const auth = require(path.resolve(__dirname, '../auth/auth'));
const perfilController = require(path.resolve(__dirname, '../controllers/perfilController'));
const upload = require(path.resolve(__dirname, '../auth/uploadAvatar'));

// Ruta para actualizar datos del perfil del usuario autenticado
router.put('/', auth, perfilController.actualizarPerfil);
// Ruta para cambiar contraseña del usuario autenticado
router.put('/password', auth, perfilController.cambiarContraseña);
// Ruta para eliminar cuenta del usuario autenticado
router.delete('/', auth, perfilController.eliminarCuenta);

// Subida de imagen de avatar
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    const usuario = await require('../models/Usuarios').findById(req.usuario.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const filename = req.file.filename;
    usuario.avatar = `/uploads/avatars/${filename}`;
    await usuario.save();

    res.json({
      mensaje: 'Avatar actualizado correctamente',
      avatar: usuario.avatar
    });
  } catch (error) {
    console.error('❌ Error al subir avatar:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});
router.get('/perfil', auth, async (req, res) => {
  try {
    const Usuario = require('../models/Usuarios');
    const usuario = await Usuario.findById(req.usuario.id).select('-contraseña');

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error('❌ Error al obtener perfil:', error);
    res.status(500).json({ mensaje: 'Error al obtener datos del usuario' });
  }
});
module.exports = router;
