const mongoose = require('mongoose');

const CategoriaSchema = new mongoose.Schema({
  id_categoria: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    default: null // 🔁 null para categorías globales (predeterminadas)
  },
  presupuesto: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Presupuesto',
  required: true
},
  
}, {
  timestamps: true
});


module.exports = mongoose.model('Categoria', CategoriaSchema);
