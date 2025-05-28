const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/catController');
const auth = require('../auth/auth');

router.get('/', auth, categoriaController.obtenerCategorias);
router.post('/', auth, categoriaController.crearCategoria);
router.get('/:id', auth, categoriaController.obtenerCategoriaPorId);
router.put('/:id', auth, categoriaController.actualizarCategoria);
router.delete('/:id', auth, categoriaController.eliminarCategoria);

module.exports = router;
