const path = require('path');

const express = require('express');
const router = express.Router();
const categoriaController = require(path.resolve(__dirname, '../controllers/catController'));
const auth = require(path.resolve(__dirname, '../auth/auth'));

router.get('/', auth, categoriaController.obtenerCategorias);
router.post('/', auth, categoriaController.crearCategoria);
router.get('/:id', auth, categoriaController.obtenerCategoriaPorId);
router.put('/:id', auth, categoriaController.actualizarCategoria);
router.delete('/:id', auth, categoriaController.eliminarCategoria);

module.exports = router;
