const express = require('express');
const multer = require('multer');
const path = require('path');
const Imagen = require(path.resolve(__dirname, '../models/Imagen'));
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Subida de imagen desde Editor.js
router.post('/upload-image', upload.single('image'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: 0, message: 'No se subió ningún archivo' });
  }

  try {
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    const nuevaImagen = new Imagen({
      nombre: file.originalname,
      mimeType: file.mimetype,
      base64
    });

    await nuevaImagen.save();

    // 🌐 Devuelve la URL pública
    const url = `${process.env.BASE_PUBLIC_URL || 'http://localhost:4004'}/api/imagenes/${nuevaImagen._id}`;
    res.status(200).json({
      success: 1,
      file: { url }
    });

  } catch (err) {
    console.error("Error al guardar imagen:", err);
    res.status(500).json({ success: 0, message: 'Error interno al guardar la imagen' });
  }
});

// ✅ Lectura pública de imagen
router.get('/:id', async (req, res) => {
  try {
    const imagen = await Imagen.findById(req.params.id);
    if (!imagen) return res.status(404).send("Imagen no encontrada");

    const imgBuffer = Buffer.from(imagen.base64.split(",")[1], "base64");
    res.set("Content-Type", imagen.mimeType);
    res.send(imgBuffer);
  } catch (err) {
    console.error("Error al recuperar imagen:", err);
    res.status(500).send("Error interno");
  }
});

module.exports = router;
