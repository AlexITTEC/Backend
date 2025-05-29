const express = require('express');
const multer = require('multer');
const router = express.Router();
const Imagen = require('../models/Imagen'); // importa el modelo

const storage = multer.memoryStorage(); // ⚠️ importante: en memoria
const upload = multer({ storage });

router.post('/upload-image', upload.single('image'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: 0, message: 'No se subió ningún archivo' });
  }

  try {
    // Convertir a base64
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    // Guardar en MongoDB
    const nuevaImagen = new Imagen({
      nombre: file.originalname,
      mimeType: file.mimetype,
      base64
    });

    await nuevaImagen.save();

res.status(200).json({
  success: 1,
  file: {
    url: `${process.env.BASE_PUBLIC_URL}/api/imagenes/${nuevaImagen._id}`
  }
});


  } catch (err) {
    console.error("Error al guardar imagen:", err);
    res.status(500).json({ success: 0, message: 'Error interno al guardar la imagen' });
  }
});

module.exports = router;
