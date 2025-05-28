const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const enviarCodigoPorCorreo = async (correo, codigo) => {
  const msg = {
    to: correo,
    from: process.env.EMAIL_VERIFICACION,
    subject: 'Código de verificación - FinTrack',
    html: `
      <h2>Verifica tu identidad</h2>
      <p>Tu código de verificación es: <strong>${codigo}</strong></p>
      <p>Este código expirará en 10 minutos. Si no lo solicitaste, ignora este correo.</p>
    `,
  };

  await sgMail.send(msg);
};

module.exports = { enviarCodigoPorCorreo };
