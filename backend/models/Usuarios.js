const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Importar subdocumentos
const DivisaSchema = require('./Divisa');
const CategoriaSchema = require('./Categoria');
const PresupuestoSchema = require('./Presupuesto');
const MovimientoSchema = require('./Movimiento');

// No importamos el esquema de Transacción aquí para evitar el error
// En su lugar, usaremos referencia directa a su modelo

const UsuarioSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true },
  nombres: { type: String, required: true },
  apellido_paterno: { type: String },
  apellido_materno: { type: String },
  numero_telefono: { type: String },
  monto_inicial: { type: Number },
  notificacion: { type: Boolean, default: false },
  rol: { type: String, enum: ['usuario', 'admin'], default: 'usuario' },
  tipo_divisa: [DivisaSchema],
  categorias: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Categoria' }],
  presupuestos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Presupuesto' }],
  transacciones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaccion' }],
  movimientos: [MovimientoSchema],

  // 🔧 NUEVOS CAMPOS (no se toco nada de lo tuyo):
  avatar: {
    type: String, // Puede ser URL o nombre de avatar
    default: ''   // O una imagen base
  },
  creadoEn: {
    type: Date,
    default: Date.now
  }
});

// Encriptar contraseña antes de guardar
UsuarioSchema.pre('save', async function (next) {
  if (!this.isModified('contraseña')) return next();
  const salt = await bcrypt.genSalt(10);
  this.contraseña = await bcrypt.hash(this.contraseña, salt);
  next();
});

module.exports = mongoose.model('Usuario', UsuarioSchema);
