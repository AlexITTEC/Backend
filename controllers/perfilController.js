const path = require('path');

const Usuario = require(path.resolve(__dirname, '../models/Usuarios'));
const bcrypt = require('bcrypt');

// PUT /api/perfil
const actualizarPerfil = async (req, res) => {
  try {
    const { nombres, apellido_paterno, apellido_materno, numero_telefono, avatar } = req.body;

    const usuario = await Usuario.findById(req.usuario.id); // req.usuario.id viene del token
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    // Solo actualiza si se envían datos válidos
    if (nombres) usuario.nombres = nombres;
    if (apellido_paterno) usuario.apellido_paterno = apellido_paterno;
    if (apellido_materno) usuario.apellido_materno = apellido_materno;
    if (numero_telefono) usuario.numero_telefono = numero_telefono;
    if (avatar) usuario.avatar = avatar;

    await usuario.save();

    res.json({
      mensaje: 'Perfil actualizado correctamente',
      usuario: {
        id: usuario._id,
        email: usuario.email,
        nombres: usuario.nombres,
        apellido_paterno: usuario.apellido_paterno,
        apellido_materno: usuario.apellido_materno,
        numero_telefono: usuario.numero_telefono,
        avatar: usuario.avatar,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('❌ Error al actualizar perfil:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

// PUT /api/perfil/password
const cambiarContraseña = async (req, res) => {
  try {
    const { actual, nueva } = req.body;

    if (!actual || !nueva) {
      return res.status(400).json({ mensaje: 'Debes proporcionar la contraseña actual y la nueva' });
    }

    const usuario = await Usuario.findById(req.usuario.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const contraseñaValida = await bcrypt.compare(actual, usuario.contraseña);
    if (!contraseñaValida) {
      return res.status(401).json({ mensaje: 'La contraseña actual es incorrecta' });
    }

    // Reemplazar por la nueva (bcrypt ya se ejecutará en el pre-save)
    usuario.contraseña = nueva;
    await usuario.save();

    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('❌ Error al cambiar contraseña:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

// DELETE /api/perfil
const eliminarCuenta = async (req, res) => {
  try {
    const { confirmar } = req.body;

    if (confirmar !== 'ELIMINAR') {
      return res.status(400).json({ mensaje: 'Debes escribir "ELIMINAR" para confirmar la eliminación de la cuenta' });
    }

    const usuario = await Usuario.findById(req.usuario.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    await Usuario.findByIdAndDelete(req.usuario.id);

    res.json({ mensaje: 'Cuenta eliminada exitosamente' });
  } catch (error) {
    console.error('❌ Error al eliminar cuenta:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};
module.exports = {
  actualizarPerfil,
  cambiarContraseña,
  eliminarCuenta
};
