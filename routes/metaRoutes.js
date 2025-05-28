const express = require('express');
const router = express.Router();
const auth = require('../auth/auth');
const metaAhorroController = require('../controllers/metaController');

router.post('/', auth, metaAhorroController.crearMeta);
router.get('/', auth, metaAhorroController.obtenerMetas);
router.put('/:id', auth, metaAhorroController.actualizarMeta);
router.delete('/:id', auth, metaAhorroController.eliminarMeta);
router.patch('/:id/abonar', auth, metaAhorroController.abonarAFondo);
router.put('/:id/finalizar', auth, metaAhorroController.finalizarMeta);

module.exports = router;
