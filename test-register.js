// Test de registro de usuario completo
const API_URL = "http://localhost:3000";

async function testRegister() {
  console.log("🧪 Probando registro de usuario...\n");

  const userData = {
    name: "Usuario de Prueba",
    email: "prueba@example.com",
    password: "Password123",
    dateOfBirth: "1995-05-15",
  };

  console.log("📝 Datos de registro:", JSON.stringify(userData, null, 2));
  console.log("\n🔄 Enviando request a:", `${API_URL}/api/auth/register`);
  console.log("\n⏳ Esperando respuesta...\n");

  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log("📦 Respuesta:", JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log("\n✅ Usuario registrado exitosamente!");
      console.log("\n👉 Ahora revisa:");
      console.log(
        "   1. Los logs del servidor (deberías ver mensajes de email)"
      );
      console.log("   2. La bandeja de entrada de:", userData.email);
      console.log(
        "   3. Si usas Gmail para enviar, revisa: vertika.iteso@gmail.com"
      );
    } else {
      console.log("\n❌ Error en el registro");
    }
  } catch (error) {
    console.error("\n❌ Error en la petición:", error.message);
    console.log(
      "\n⚠️ Asegúrate de que el servidor esté corriendo en el puerto 3000"
    );
  }
}

testRegister();
