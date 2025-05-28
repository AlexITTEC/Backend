const mongoose = require('mongoose');

const TransaccionSchema = new mongoose.Schema({
  id_transaccion: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  titulo: { type: String, required: true },
  descripcion: { type: String },
  accion: {
    type: String,
    enum: ['Ingreso', 'Retiro'],
    required: true
  },
  metodo_pago: { type: String },
  monto: { type: Number, required: true },
  estado: {
    type: String,
    enum: ['En proceso', 'Completado', 'Cancelado'],
    default: 'En proceso'
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria'
  },
  presupuesto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Presupuesto'
    // ❌ ya no uses required aquí
  }
  
});

module.exports = mongoose.model('Transaccion', TransaccionSchema);
