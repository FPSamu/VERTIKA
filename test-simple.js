// Test simple de registro
const http = require("http");

const data = JSON.stringify({
  name: "Test User Simple",
  email: "simple@test.com",
  password: "Password123",
  dateOfBirth: "1995-05-15",
});

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/api/auth/register",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length,
  },
};

console.log("🧪 Enviando registro a:", `http://localhost:3000${options.path}`);
console.log("📦 Datos:", data);
console.log("\n⏳ Esperando respuesta...\n");

const req = http.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);

  let responseData = "";

  res.on("data", (chunk) => {
    responseData += chunk;
  });

  res.on("end", () => {
    console.log("📋 Respuesta:", responseData);
    console.log("\n👉 Ahora revisa la terminal del servidor para ver los logs");
  });
});

req.on("error", (error) => {
  console.error("❌ Error:", error);
});

req.write(data);
req.end();
