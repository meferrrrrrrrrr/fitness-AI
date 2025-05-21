// Importăm Firebase și dotenv

require('dotenv').config();
const { initializeApp } = require('firebase/app');

// Logăm variabilele de mediu pentru depanare
console.log('FIREBASE_API_KEY:', process.env.FIREBASE_API_KEY);
console.log('FIREBASE_AUTH_DOMAIN:', process.env.FIREBASE_AUTH_DOMAIN);
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('FIREBASE_STORAGE_BUCKET:', process.env.FIREBASE_STORAGE_BUCKET);
console.log('FIREBASE_MESSAGING_SENDER_ID:', process.env.FIREBASE_MESSAGING_SENDER_ID);
console.log('FIREBASE_APP_ID:', process.env.FIREBASE_APP_ID);

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
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error('Configurația Firebase este invalidă. Verifică variabilele de mediu.');
}

// Inițializăm Firebase
const app = initializeApp(firebaseConfig);
console.log('Firebase app inițializat cu projectId:', app.options.projectId);

// Exportăm app pentru a fi folosit în alte fișiere
module.exports = { app };