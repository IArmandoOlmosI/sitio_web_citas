import fs from "fs";
import readline from "readline";

// Crea la interfaz para leer y escribir en la consola
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupEnv() {
  console.log("\n");
  console.log("CONFIGURACIÓN DEL ARCHIVO .env ");
  console.log("");
  console.log("Configurar dos variables");

  const answers = {};

  console.log("\nEjemplo: mongodb+srv://usuario:pass@cluster0.abc.mongodb.net/n");
  answers.MONGODB_URI = await askQuestion("1. ¿Cuál es tu MONGODB URI (conexión completa)? ");
  
  console.log("\nEsta clave debe ser larga para firmar los tokens.");
  answers.JWT_SECRET = await askQuestion("2. Ingresa una clave secreta para tu JWT (JWT_SECRET): ");
  
  rl.close();

  let envContent = "";
  for (const key in answers) {
    envContent += `${key}=${answers[key]}\n`;
  }

  try {
    fs.writeFileSync('.env', envContent);
    console.log("\n-------------------------------------------------");
    console.log("El archivo .env ha sido creado.");
    console.log("Iniciar tu aplicación con 'npm run dev'.");
    console.log("-------------------------------------------------");
  } catch (error) {
    console.error("\nHubo un error al crear el archivo .env:", error);
  }
}


setupEnv();