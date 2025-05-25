require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getDatabase } = require('firebase/database'); // Import corect din firebase/database
const admin = require('firebase-admin'); // Adăugăm Firebase Admin SDK

// Configurația din variabilele de mediu
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Verificăm dacă configurația este validă
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
if (missingFields.length > 0) {
  throw new Error(`Configurația Firebase este invalidă. Lipsesc câmpurile: ${missingFields.join(', ')}.`);
}

// Inițializăm Firebase
const app = initializeApp(firebaseConfig);
console.log('Firebase app inițializat cu projectId:', app.options.projectId);

// Inițializăm Realtime Database
const database = getDatabase(app); // Inițializare corectă

// Inițializăm Firebase Admin SDK
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

// Exportăm app, database și admin pentru a fi folosite în alte fișiere
module.exports = { app, database, admin };