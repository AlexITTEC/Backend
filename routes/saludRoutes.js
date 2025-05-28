const path = require('path');

const express = require("express");
const router = express.Router();
const { obtenerContenido, guardarContenido } = require(path.resolve(__dirname, "../controllers/saludController"));
const auth = require(path.resolve(__dirname, "../auth/auth"));
const verificarAdmin = require(path.resolve(__dirname, "../auth/verificarAdmin"));

router.get("/", obtenerContenido);
router.post("/", auth, verificarAdmin, guardarContenido);

module.exports = router;
