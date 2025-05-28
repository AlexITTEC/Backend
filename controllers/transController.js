
// ✅ Crear nueva transacción con lógica de estado
const Transaccion = require('../models/Transaccion');
const Presupuesto = require('../models/Presupuesto');
const Categoria = require('../models/Categoria'); // asegúrate de importar el modelo

// ✅ Crear nueva transacción con lógica de presupuesto automático
exports.crearTransaccion = async (req, res) => {
  try {
    const {
      titulo, descripcion, accion, metodo_pago,
      monto, estado, fecha, categoria
    } = req.body;

    if (!titulo || !accion || monto === undefined || isNaN(monto) || !categoria) {
      return res.status(400).json({ error: 'Campos requeridos faltantes o inválidos' });
    }

    // Buscar la categoría y obtener el presupuesto vinculado
    const categoriaEncontrada = await Categoria.findOne({
      _id: categoria,
      $or: [
        { creadoPor: req.usuario.id },
        { creadoPor: null }
      ]
    }).populate('presupuesto');

    if (!categoriaEncontrada) {
      return res.status(404).json({ error: 'Categoría no encontrada o no autorizada' });
    }

    const presupuesto = categoriaEncontrada.presupuesto;

    if (!presupuesto) {
      return res.status(400).json({ error: 'La categoría no tiene un presupuesto vinculado.' });
    }

    // Validación para Retiros: presupuesto suficiente
    if (accion === 'Retiro' && estado === 'Completado') {
      if ((presupuesto.monto_gastado + monto) > presupuesto.monto_limite) {
        return res.status(400).json({ error: 'Este gasto excede el límite del presupuesto.' });
      }

      // Aplicar gasto
      presupuesto.monto_gastado += monto;
      presupuesto.gastos.push({
        transaccionId: undefined, // aún no existe, se actualiza después
        titulo,
        monto,
        fecha
      });
    }

    // Crear la transacción (ya con presupuesto automáticamente)
    const nuevaTransaccion = new Transaccion({
      titulo,
      descripcion,
      accion,
      metodo_pago,
      monto,
      estado,
      fecha,
      categoria,
      presupuesto: presupuesto._id,
      creadoPor: req.usuario.id
    });

    const transaccionGuardada = await nuevaTransaccion.save();

    // Vincular el ID real de la transacción en el array de gastos
    if (accion === 'Retiro' && estado === 'Completado') {
      const gasto = presupuesto.gastos.find(g => !g.transaccionId);
      if (gasto) gasto.transaccionId = transaccionGuardada._id;
      await presupuesto.save();
    }

    res.status(201).json(transaccionGuardada);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear transacción', detalles: error.message });
  }
};


// ✅ Obtener transacciones
exports.obtenerTransacciones = async (req, res) => {
  try {
    const transacciones = await Transaccion.find({ creadoPor: req.usuario.id })
      .populate('categoria')
      .populate('presupuesto');
    res.json(transacciones);
  } catch (error) {
    console.error('❌ Error al obtener transacciones:', error);
    res.status(500).json({ error: 'Error al obtener transacciones', detalles: error.message });
  }
};

// ✅ Obtener transacción por ID
exports.obtenerTransaccionPorId = async (req, res) => {
  try {
    const transaccion = await Transaccion.findOne({
      _id: req.params.id,
      creadoPor: req.usuario.id
    }).populate('categoria').populate('presupuesto');

    if (!transaccion)
      return res.status(404).json({ error: 'Transacción no encontrada o no autorizada' });

    res.json(transaccion);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar transacción', detalles: error.message });
  }
};

// ✅ Actualizar transacción con lógica de estado
exports.actualizarTransaccion = async (req, res) => {
  try {
    const transaccion = await Transaccion.findOne({
      _id: req.params.id,
      creadoPor: req.usuario.id
    });

    if (!transaccion) {
      return res.status(404).json({ error: 'No se encontró o no tienes permiso' });
    }

    const estadoAnterior = transaccion.estado;
    const nuevoEstado = req.body.estado;
    const fueRetiro = transaccion.accion === 'Retiro';
    const presupuestoId = transaccion.presupuesto;
    const monto = transaccion.monto;

    const transaccionActualizada = await Transaccion.findByIdAndUpdate(
      transaccion._id,
      req.body,
      { new: true }
    );

    if (fueRetiro && presupuestoId) {
      const presupuesto = await Presupuesto.findById(presupuestoId);
      if (!presupuesto) {
        return res.status(404).json({ error: 'Presupuesto no encontrado' });
      }

      if (estadoAnterior === 'Completado' && nuevoEstado === 'Cancelado') {
        presupuesto.monto_gastado -= monto;
        presupuesto.gastos = presupuesto.gastos.filter(g =>
          g.transaccionId.toString() !== transaccion._id.toString()
        );
        await presupuesto.save();
      }

      if (estadoAnterior !== 'Completado' && nuevoEstado === 'Completado') {
        presupuesto.monto_gastado += monto;
        presupuesto.gastos.push({
          transaccionId: transaccion._id,
          titulo: transaccion.titulo,
          monto,
          fecha: transaccion.fecha
        });
        await presupuesto.save();
      }
    }

    res.json(transaccionActualizada);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar transacción', detalles: error.message });
  }
};

// ✅ Eliminar transacción con lógica de reintegro si es completada
exports.eliminarTransaccion = async (req, res) => {
  try {
    // Primero encuentra la transacción original completa
    const transaccion = await Transaccion.findOne({
      _id: req.params.id,
      creadoPor: req.usuario.id
    });

    if (!transaccion) {
      return res.status(404).json({ error: 'No se encontró o no tienes permiso' });
    }

    // Si fue Retiro completado, revertir el presupuesto antes de eliminar
    if (transaccion.accion === 'Retiro' && transaccion.estado === 'Completado' && transaccion.presupuesto) {
      const presupuesto = await Presupuesto.findById(transaccion.presupuesto);
      if (presupuesto) {
        presupuesto.monto_gastado -= transaccion.monto;
        presupuesto.gastos = presupuesto.gastos.filter(g =>
          g.transaccionId.toString() !== transaccion._id.toString()
        );
        await presupuesto.save();
      }
    }

    // Ahora sí eliminar
    await Transaccion.deleteOne({ _id: transaccion._id });

    res.json({ mensaje: 'Transacción eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar transacción', detalles: error.message });
  }
};

