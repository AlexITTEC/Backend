const express = require("express");
const router = express.Router();
const { obtenerContenido, guardarContenido } = require("../controllers/saludController");
const auth = require("../auth/auth");
const verificarAdmin = require("../auth/verificarAdmin");

router.get("/", obtenerContenido);
router.post("/", auth, verificarAdmin, guardarContenido);

module.exports = router;
