const path = require('path');

const express = require('express');
const router = express.Router();
const auth = require(path.resolve(__dirname, '../auth/auth'));
const presController = require(path.resolve(__dirname, '../controllers/presController')); // ✅ esta línea

router.post('/', auth, presController.crearPresupuesto);
router.get('/', auth, presController.obtenerPresupuestos);
router.get('/:id', auth, presController.obtenerPresupuestoPorId);
router.put('/:id', auth, presController.actualizarPresupuesto);
router.delete('/:id', auth, presController.eliminarPresupuesto);

module.exports = router;
