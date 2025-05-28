const mongoose = require('mongoose');

const MetaAhorroSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String, trim: true },
  montoObjetivo: { type: Number, required: true },
  fechaLimite: { type: Date, required: true },
  progreso: { type: Number, default: 0 },
  abonos: [
    {
      monto: { type: Number, required: true },
      nota: { type: String },
      fecha: { type: Date, default: Date.now }
    }
  ],
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria',
    default: null
  },
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  fechaFinalizacion: {
  type: Date,
  default: null
}

}, { timestamps: true });

module.exports = mongoose.model('MetaAhorro', MetaAhorroSchema);
