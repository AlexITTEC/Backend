// controllers/presController.js
const Presupuesto = require('../models/Presupuesto');
const mongoose = require('mongoose');

// ✅ Crear Presupuesto
exports.crearPresupuesto = async (req, res) => {
  console.log('📩 Body recibido en /api/presupuestos:', req.body);

  try {
    const { titulo, descripcion, monto_limite } = req.body;

    if (!titulo || typeof titulo !== 'string' || !titulo.trim()) {
      return res.status(400).json({ error: 'El campo "titulo" es obligatorio y debe ser texto válido.' });
    }

    if (!monto_limite || typeof monto_limite !== 'number' || monto_limite <= 0) {
      return res.status(400).json({ error: 'El campo "monto_limite" es obligatorio y debe ser un número mayor a 0.' });
    }

    const nuevoPresupuesto = new Presupuesto({
      titulo: titulo.trim(),
      descripcion: descripcion?.trim() || '',
      monto_limite: parseFloat(monto_limite),
      creadoPor: req.usuario.id
    });

    const guardado = await nuevoPresupuesto.save();
    console.log('✅ Presupuesto guardado correctamente:', guardado);

    res.status(201).json(guardado);
  } catch (error) {
    console.error('❌ Error al guardar presupuesto:', error);
    res.status(500).json({ error: 'Error interno del servidor', detalles: error.message });
  }
};

// ✅ Obtener todos los presupuestos del usuario
exports.obtenerPresupuestos = async (req, res) => {
  try {
    const presupuestos = await Presupuesto.find({ creadoPor: req.usuario.id }).sort({ fecha_creacion: -1 });
    res.status(200).json(presupuestos);
  } catch (error) {
    console.error('❌ Error al obtener presupuestos:', error.message);
    res.status(500).json({ error: 'Error al obtener presupuestos', detalles: error.message });
  }
};

// ✅ Obtener presupuesto por ID
exports.obtenerPresupuestoPorId = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'ID de presupuesto no válido' });
  }

  try {
    const presupuesto = await Presupuesto.findOne({ _id: req.params.id, creadoPor: req.usuario.id });
    if (!presupuesto) return res.status(404).json({ error: 'Presupuesto no encontrado o no autorizado' });
    res.json(presupuesto);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar presupuesto', detalles: error.message });
  }
};

// ✅ Actualizar presupuesto
exports.actualizarPresupuesto = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'ID de presupuesto no válido' });
  }

  if (req.body.monto_limite && isNaN(Number(req.body.monto_limite))) {
    return res.status(400).json({ error: 'El monto límite debe ser un número válido.' });
  }

  try {
    const actualizado = await Presupuesto.findOneAndUpdate(
      { _id: req.params.id, creadoPor: req.usuario.id },
      req.body,
      { new: true }
    );
    if (!actualizado) return res.status(404).json({ error: 'No autorizado o presupuesto no encontrado' });
    res.json(actualizado);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar presupuesto', detalles: error.message });
  }
};

// ✅ Eliminar presupuesto
exports.eliminarPresupuesto = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'ID de presupuesto no válido' });
  }

  try {
    console.log('🧾 Intentando eliminar presupuesto con ID:', req.params.id);
    console.log('👤 Usuario autenticado:', req.usuario.id);

    const eliminado = await Presupuesto.findOneAndDelete({
      _id: req.params.id,
      creadoPor: req.usuario.id
    });

    if (!eliminado) {
      return res.status(404).json({ error: 'No autorizado o presupuesto no encontrado' });
    }

    res.json({ mensaje: 'Presupuesto eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar presupuesto:', error);
    res.status(500).json({ error: 'Error al eliminar presupuesto', detalles: error.message });
  }
};
