const path = require('path');
const SaludFinanciera = require(path.resolve(__dirname, '../models/SaludFinanciera'));

// Guardar o actualizar contenido
const guardarContenido = async (req, res) => {
  try {
    const { contenido } = req.body;
    const userId = req.usuario.id;

    let existente = await SaludFinanciera.findOne();

    if (existente) {
      existente.contenido = contenido;
      existente.actualizadoPor = userId;
      existente.fechaActualizacion = Date.now();
      await existente.save();
    } else {
      await SaludFinanciera.create({
        contenido,
        creadoPor: userId,
        actualizadoPor: userId
      });
    }

    res.json({ mensaje: 'Contenido guardado correctamente' });
  } catch (error) {
    console.error("Error al guardar contenido:", error);
    res.status(500).json({ mensaje: 'Error al guardar contenido' });
  }
};

// Obtener contenido
const obtenerContenido = async (req, res) => {
  try {
    const data = await SaludFinanciera.findOne();

    if (!data || !data.contenido || !Array.isArray(data.contenido.blocks)) {
      return res.status(404).json({ mensaje: 'Contenido no válido o vacío' });
    }

    // ✅ devolvemos el contenido exacto como lo espera el renderer
    res.json(data.contenido);
  } catch (error) {
    console.error("Error al obtener contenido:", error);
    res.status(500).json({ mensaje: 'Error al obtener contenido' });
  }
};



// Exports
module.exports = {
  guardarContenido,
  obtenerContenido
};
