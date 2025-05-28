const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Token no proporcionado o malformado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // Aquí tendrás acceso a req.usuario.id y .nombres
    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'Token inválido' });
  }
};

// ✅ FALTABA ESTO
module.exports = auth;
