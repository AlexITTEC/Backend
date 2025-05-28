const mongoose = require("mongoose");

const SaludFinancieraSchema = new mongoose.Schema({
  contenido: { type: Object, required: true }, // JSON del editor
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  actualizadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  fechaActualizacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SaludFinanciera", SaludFinancieraSchema);
