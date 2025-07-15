import admin from "firebase-admin";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to initialize Firebase
async function initializeFirebase() {
  try {
    // Read the JSON file using fs/promises
    const configPath = resolve(
      __dirname,
      "../../../../config/firebase-config.json"
    );
    const serviceAccountJson = await readFile(configPath, "utf8");
    const serviceAccount = JSON.parse(serviceAccountJson);

    // Initialize the app
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    throw error;
  }
}

// Initialize Firebase immediately
initializeFirebase();

export default admin;