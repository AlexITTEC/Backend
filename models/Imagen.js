const mongoose = require('mongoose');

const ImagenSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  mimeType: { type: String, required: true },
  base64: { type: String, required: true },
  creadoEn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Imagen', ImagenSchema);
