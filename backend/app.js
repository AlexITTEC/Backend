// server.js limpio y depurado
const express = require('express');
const conectarDB = require('./config/db');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Conexión a MongoDB
conectarDB()
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch((err) => console.error('❌ Error de conexión:', err));

// Rutas principales
app.use('/api/gastos', require('./routes/gastosRoute'));
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/transacciones', require('./routes/transRoutes'));
app.use('/api/presupuestos', require('./routes/presRoutes'));
app.use('/api/movimientos', require('./routes/movRoutes'));
app.use('/api/categorias', require('./routes/catRoutes'));
app.use('/api/divisas', require('./routes/divRoutes'));
app.use('/api/metas', require('./routes/metaRoutes'));
app.use('/api/salud', require('./routes/saludRoutes')); // ✅ salud financiera
app.use('/api/perfil', require('./routes/perfilRoutes'));

// Rutas adicionales
app.use('/api', require('./routes/upload.routes')); // subir imágenes
app.use('/api', require('./routes/fetch.routes'));  // previews de enlaces

// Carpeta pública para imágenes
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
