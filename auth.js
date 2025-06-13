require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getDatabase } = require('firebase/database');
const admin = require('firebase-admin');

// Configurația Firebase din variabilele de mediu
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Verificăm dacă configurația Firebase este completă
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
if (missingFields.length > 0) {
  console.error(`Configurația Firebase este invalidă. Lipsesc câmpurile: ${missingFields.join(', ')}.`);
  throw new Error(`Configurația Firebase este invalidă. Lipsesc câmpurile: ${missingFields.join(', ')}.`);
}

// Inițializăm aplicația Firebase
const app = initializeApp(firebaseConfig);

// Inițializăm Realtime Database (opțional, folosit doar dacă stocăm date suplimentare)
const database = getDatabase(app);

// Configurăm Firebase Admin SDK pentru autentificare server-side
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

// Verificăm dacă variabilele pentru serviceAccount sunt definite
if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
  console.error('Configurația Firebase Admin este invalidă. Verifică variabilele de mediu pentru projectId, privateKey și clientEmail.');
  throw new Error('Configurația Firebase Admin este invalidă. Verifică variabilele de mediu pentru projectId, privateKey și clientEmail.');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

// Exportăm app, database și admin pentru a fi folosite în alte fișiere
module.exports = { app, database, admin };