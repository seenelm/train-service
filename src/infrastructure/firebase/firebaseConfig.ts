import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Function to initialize Firebase
function initializeFirebase() {
  try {
    const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (!base64) throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_BASE64 env var");

    const jsonString = Buffer.from(base64, "base64").toString("utf8");
    const serviceAccount = JSON.parse(jsonString);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    throw error;
  }
}

initializeFirebase();

export default admin;
