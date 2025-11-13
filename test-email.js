// Script para probar configuración de email
const nodemailer = require("nodemailer");
require("dotenv").config();

console.log("🔍 Verificando configuración de email...\n");
console.log("EMAIL_ADDRESS:", process.env.EMAIL_ADDRESS);
console.log(
  "EMAIL_PASS:",
  process.env.EMAIL_PASS ? "✅ Configurada" : "❌ NO configurada"
);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("\n📧 Intentando configurar transporter...\n");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASS,
  },
});

console.log("✅ Transporter creado\n");
console.log("🔄 Verificando conexión con Gmail...\n");

// Verificar la configuración
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Error de configuración SMTP:", error);
    console.error("\nPosibles causas:");
    console.error("1. Contraseña de aplicación incorrecta");
    console.error("2. Verificación en 2 pasos no habilitada");
    console.error("3. Email incorrecto");
    console.error("\nVerifica: https://myaccount.google.com/apppasswords\n");
  } else {
    console.log("✅ Servidor SMTP configurado correctamente\n");
    console.log("📨 Enviando email de prueba...\n");

    // Enviar email de prueba
    transporter.sendMail(
      {
        from: `"VERTIKA TEST" <${process.env.EMAIL_ADDRESS}>`,
        to: process.env.EMAIL_ADDRESS, // Enviar a ti mismo
        subject: "Prueba de Configuración VERTIKA",
        html: `
        <h1>✅ ¡Configuración exitosa!</h1>
        <p>Si recibes este email, significa que tu configuración de SMTP funciona correctamente.</p>
        <p><strong>Email configurado:</strong> ${process.env.EMAIL_ADDRESS}</p>
        <p><strong>Hora de prueba:</strong> ${new Date().toLocaleString()}</p>
      `,
      },
      (error, info) => {
        if (error) {
          console.error("❌ Error al enviar email:", error);
        } else {
          console.log("✅ Email enviado exitosamente!");
          console.log("📬 Message ID:", info.messageId);
          console.log("📝 Response:", info.response);
          console.log(
            "\n👉 Revisa tu bandeja de entrada:",
            process.env.EMAIL_ADDRESS
          );
        }
      }
    );
  }
});
