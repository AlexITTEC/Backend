const path = require('path');

const express = require('express');
const router = express.Router();
const transaccionController = require(path.resolve(__dirname, '../controllers/transController'));
const auth = require(path.resolve(__dirname, '../auth/auth'));

// ✅ Crear transacción (autenticado)
router.post('/', auth, transaccionController.crearTransaccion);

// ✅ Obtener todas las transacciones del usuario autenticado
router.get('/', auth, transaccionController.obtenerTransacciones);

// ✅ Obtener una transacción específica (autenticado y dueño)
router.get('/:id', auth, transaccionController.obtenerTransaccionPorId);

// ✅ Actualizar una transacción (autenticado y dueño)
router.put('/:id', auth, transaccionController.actualizarTransaccion);

// ✅ Eliminar una transacción (autenticado y dueño)
router.delete('/:id', auth, transaccionController.eliminarTransaccion);

module.exports = router;
