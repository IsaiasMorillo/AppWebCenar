const transporter = require("../config/mailer");
const { appUrl } = require("../config/env");

const send = (to, subject, html) =>
  transporter.sendMail({
    from: `"AppCenar" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

exports.sendActivationEmail = (email, token) => {
  const link = `${appUrl}/activate/${token}`;
  return send(
    email,
    "Activa tu cuenta en AppCenar",
    `<h2>Bienvenido a AppCenar</h2>
     <p>Haz clic en el siguiente enlace para activar tu cuenta:</p>
     <p><a href="${link}">Activar mi cuenta</a></p>`
  );
};

exports.sendResetEmail = (email, token) => {
  const link = `${appUrl}/reset-password/${token}`;
  return send(
    email,
    "Restablece tu contraseña en AppCenar",
    `<h2>Restablecer contraseña</h2>
     <p>Haz clic en el siguiente enlace para crear una nueva contraseña. El enlace expira en 1 hora:</p>
     <p><a href="${link}">Cambiar mi contraseña</a></p>`
  );
};