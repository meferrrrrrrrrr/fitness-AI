// Importăm Firebase și dotenv
require('dotenv').config();
const { initializeApp } = require('firebase/app');

// Configurația din variabilele de mediu
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Inițializăm Firebase
const app = initializeApp(firebaseConfig);

// Exportăm app pentru a fi folosit în alte fișiere
module.exports = { app };