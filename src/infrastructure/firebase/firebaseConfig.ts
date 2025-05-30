import admin from "firebase-admin";

// Function to initialize Firebase
async function initializeFirebase() {
  try {
    // Initialize the app
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
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
