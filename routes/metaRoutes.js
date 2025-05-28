const path = require('path');

const express = require('express');
const router = express.Router();
const auth = require(path.resolve(__dirname, '../auth/auth'));
const metaAhorroController = require(path.resolve(__dirname, '../controllers/metaController'));

router.post('/', auth, metaAhorroController.crearMeta);
router.get('/', auth, metaAhorroController.obtenerMetas);
router.put('/:id', auth, metaAhorroController.actualizarMeta);
router.delete('/:id', auth, metaAhorroController.eliminarMeta);
router.patch('/:id/abonar', auth, metaAhorroController.abonarAFondo);
router.put('/:id/finalizar', auth, metaAhorroController.finalizarMeta);

module.exports = router;
