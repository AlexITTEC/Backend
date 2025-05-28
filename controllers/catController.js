const path = require('path');

const Categoria = require(path.resolve(__dirname, '../models/Categoria'));
const Presupuesto = require(path.resolve(__dirname, '../models/Presupuesto')); // 👈 necesario para validar el presupuesto

// ✅ Crear categoría
exports.crearCategoria = async (req, res) => {
  try {
    const { titulo, descripcion, presupuesto } = req.body;

    // Validar título
    if (!titulo || typeof titulo !== 'string' || !titulo.trim()) {
      return res.status(400).json({ error: 'El título es obligatorio y debe ser texto válido.' });
    }

    // Validar presupuesto obligatorio
    if (!presupuesto) {
      return res.status(400).json({ error: 'El presupuesto es obligatorio.' });
    }

    // Verificar que el presupuesto exista y sea del usuario autenticado
    const presupuestoValido = await Presupuesto.findOne({
      _id: presupuesto,
      creadoPor: req.usuario.id
    });

    if (!presupuestoValido) {
      return res.status(404).json({ error: 'Presupuesto no válido o no autorizado.' });
    }

    // Crear categoría
    const nuevaCategoria = new Categoria({
      titulo: titulo.trim(),
      descripcion: descripcion?.trim() || '',
      creadoPor: req.usuario.id,
      presupuesto
    });

    const guardada = await nuevaCategoria.save();
    res.status(201).json(guardada);
  } catch (error) {
    console.error('❌ Error al crear categoría:', error.message);
    res.status(500).json({ error: 'Error al crear categoría', detalles: error.message });
  }
};

// ✅ Obtener solo categorías del usuario autenticado
exports.obtenerCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find({
      $or: [
        { creadoPor: req.usuario.id },
        { creadoPor: null }
      ]
    })
      .populate('presupuesto') // 👈 para incluir presupuesto asociado
      .sort({ titulo: 1 });

    res.status(200).json(categorias);
  } catch (error) {
    console.error('❌ Error al obtener categorías:', error.message);
    res.status(500).json({ error: 'Error al obtener categorías', detalles: error.message });
  }
};


// ✅ Obtener una categoría por ID (sin validación aún)
exports.obtenerCategoriaPorId = async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id);
    if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(categoria);
  } catch (error) {
    console.error('❌ Error al buscar categoría:', error.message);
    res.status(500).json({ error: 'Error al buscar categoría', detalles: error.message });
  }
};

// ✅ Actualizar categoría (solo si es del usuario)
exports.actualizarCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findOneAndUpdate(
      { _id: req.params.id, creadoPor: req.usuario.id },
      req.body,
      { new: true }
    );

    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada o no tienes permiso' });
    }

    res.json(categoria);
  } catch (error) {
    console.error('❌ Error al actualizar categoría:', error.message);
    res.status(400).json({ error: 'Error al actualizar categoría', detalles: error.message });
  }
};

// ✅ Eliminar categoría (solo si es del usuario)
exports.eliminarCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findOneAndDelete({
      _id: req.params.id,
      creadoPor: req.usuario.id
    });

    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada o no tienes permiso' });
    }

    res.json({ mensaje: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar categoría:', error.message);
    res.status(500).json({ error: 'Error al eliminar categoría', detalles: error.message });
  }
};
