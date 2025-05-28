const path = require('path');
const MetaAhorro = require(path.resolve(__dirname, '../models/MetaAhorro'));

// ✅ Crear meta contextual al usuario con categoría
exports.crearMeta = async (req, res) => {
  try {
    const { titulo, descripcion, montoObjetivo, fechaLimite, progreso, categoria } = req.body;

    if (!titulo || typeof titulo !== 'string' || !titulo.trim()) {
      return res.status(400).json({ error: 'El título es obligatorio y debe ser texto válido.' });
    }

    if (!montoObjetivo || isNaN(montoObjetivo) || montoObjetivo <= 0) {
      return res.status(400).json({ error: 'El monto objetivo debe ser un número válido mayor a 0.' });
    }

    if (!fechaLimite || isNaN(Date.parse(fechaLimite))) {
      return res.status(400).json({ error: 'La fecha límite es inválida o falta.' });
    }

    const ahorroInicial = parseFloat(progreso);
    if (!isNaN(ahorroInicial) && ahorroInicial > parseFloat(montoObjetivo)) {
      return res.status(400).json({ error: 'El ahorro inicial no puede exceder el monto objetivo.' });
    }

    const meta = new MetaAhorro({
      titulo: titulo.trim(),
      descripcion: descripcion?.trim() || '',
      montoObjetivo: parseFloat(montoObjetivo),
      fechaLimite: new Date(fechaLimite),
      progreso: 0,
      abonos: [],
      categoria: categoria || null,
      creadoPor: req.usuario.id
    });

    if (!isNaN(ahorroInicial) && ahorroInicial > 0) {
      meta.progreso = ahorroInicial;
      meta.abonos.push({
        monto: ahorroInicial,
        nota: 'Ahorro inicial',
        fecha: new Date()
      });
    }

    const guardada = await meta.save();
    res.status(201).json(guardada);

  } catch (error) {
    console.error('❌ Error al crear meta:', error.message);
    res.status(500).json({ error: 'Error al crear meta', detalles: error.message });
  }
};

// ✅ Obtener metas del usuario autenticado con categoría
exports.obtenerMetas = async (req, res) => {
  try {
    const metas = await MetaAhorro.find({ creadoPor: req.usuario.id })
      .populate('categoria')
      .sort({ fechaLimite: 1 });

    res.status(200).json(metas);
  } catch (error) {
    console.error('❌ Error al obtener metas:', error.message);
    res.status(500).json({ error: 'Error al obtener metas', detalles: error.message });
  }
};

// ✅ Actualizar meta
exports.actualizarMeta = async (req, res) => {
  try {
    const metaActualizada = await MetaAhorro.findOneAndUpdate(
      { _id: req.params.id, creadoPor: req.usuario.id },
      req.body,
      { new: true }
    );

    if (!metaActualizada) {
      return res.status(404).json({ error: 'Meta no encontrada o no tienes permiso' });
    }

    res.json(metaActualizada);
  } catch (error) {
    console.error('❌ Error al actualizar meta:', error.message);
    res.status(400).json({ error: 'Error al actualizar meta', detalles: error.message });
  }
};

// ✅ Eliminar meta
exports.eliminarMeta = async (req, res) => {
  try {
    const eliminada = await MetaAhorro.findOneAndDelete({
      _id: req.params.id,
      creadoPor: req.usuario.id
    });

    if (!eliminada) {
      return res.status(404).json({ error: 'Meta no encontrada o no tienes permiso' });
    }

    res.json({ mensaje: 'Meta eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar meta:', error.message);
    res.status(500).json({ error: 'Error al eliminar meta', detalles: error.message });
  }
};

// ✅ Registrar abono a una meta
exports.abonarAFondo = async (req, res) => {
  const { id } = req.params;
  const { monto, nota } = req.body;

  if (!monto || isNaN(monto) || monto <= 0) {
    return res.status(400).json({ error: 'El monto debe ser un número positivo.' });
  }

  try {
    const meta = await MetaAhorro.findOne({ _id: id, creadoPor: req.usuario.id });

    if (!meta) {
      return res.status(404).json({ error: 'Meta de ahorro no encontrada.' });
    }

    if ((meta.progreso + monto) > meta.montoObjetivo) {
      return res.status(400).json({ error: 'Este abono excede el monto objetivo de la meta.' });
    }

    meta.progreso += monto;
    meta.abonos.push({
      monto,
      nota: nota || ''
    });

    await meta.save();

    res.status(200).json({
      mensaje: '✅ Abono registrado correctamente.',
      meta
    });
  } catch (error) {
    console.error('❌ Error al abonar:', error);
    res.status(500).json({ error: 'Error al registrar el abono', detalles: error.message });
  }
};

exports.finalizarMeta = async (req, res) => {
  try {
    const { fechaFinalizacion } = req.body;

    const meta = await MetaAhorro.findOneAndUpdate(
      { _id: req.params.id, creadoPor: req.usuario.id },
      { $set: { fechaFinalizacion } },
      { new: true }
    );

    if (!meta) {
      return res.status(404).json({ mensaje: 'Meta no encontrada' });
    }

    res.json(meta);
  } catch (error) {
    console.error('Error al finalizar meta:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};
