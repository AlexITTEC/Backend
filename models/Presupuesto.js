const mongoose = require('mongoose');

const PresupuestoSchema = new mongoose.Schema({
  id_presupuesto: {
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
  monto_limite: {
    type: Number,
    required: true
  },
  monto_gastado: {
    type: Number,
    default: 0
  },
  categoria_asociada: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria'
  },
  gastos: [ // 👈 nuevo campo agregado
    {
      transaccionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaccion'
      },
      titulo: String,
      monto: Number,
      fecha: Date
    }
  ],
  fecha_creacion: {
    type: Date,
    default: Date.now
  },
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Presupuesto', PresupuestoSchema);
