const express = require('express');
const router = express.Router();
const auth = require('../auth/auth');
const presController = require('../controllers/presController'); // ✅ esta línea

router.post('/', auth, presController.crearPresupuesto);
router.get('/', auth, presController.obtenerPresupuestos);
router.get('/:id', auth, presController.obtenerPresupuestoPorId);
router.put('/:id', auth, presController.actualizarPresupuesto);
router.delete('/:id', auth, presController.eliminarPresupuesto);

module.exports = router;
