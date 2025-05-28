const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configuración del almacenamiento con Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  }
});

const upload = multer({ storage });

// Ruta POST para subir imagen desde Editor.js
router.post('/upload-image', upload.single('image'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({
      success: 0,
      message: 'No se subió ningún archivo'
    });
  }

  res.status(200).json({
    success: 1,
    file: {
      url: `http://localhost:3000/uploads/${file.filename}`
    }
  });
});

module.exports = router;
