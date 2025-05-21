const express = require('express');
const path = require('path');
const { app: firebaseApp } = require('./auth');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } = require('firebase/auth');

const app = express();

// Middleware pentru depanare
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

// Parsăm body-ul cererilor JSON
app.use(express.json());

// Servim fișierele statice (ex. index.html)
app.use(express.static(path.join(__dirname, '.'), {
  index: false,
  extensions: ['html', 'js', 'css']
}));

// Verificăm dacă Firebase este inițializat corect
try {
  if (!firebaseApp || !firebaseApp.options.projectId) {
    throw new Error('Firebase app nu este inițializat corect.');
  }
  console.log('Firebase app inițializat:', firebaseApp.options.projectId);
} catch (error) {
  console.error('Eroare la inițializarea Firebase:', error.message);
}

// Middleware pentru gestionarea erorilor
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ error: 'A apărut o eroare internă', details: err.message });
});

// Endpoint de test simplu, fără Firebase
app.get('/api/test', (req, res) => {
  res.status(200).json({ message: 'Serverul funcționează pe Vercel!' });
});

// Endpoint-ul existent pentru Firebase
app.get('/api/test-firebase', (req, res) => {
  try {
    if (firebaseApp && firebaseApp.options.projectId === 'ai-fitness94') {
      res.status(200).json({ message: 'Firebase configurat corect!' });
    } else {
      res.status(500).json({ error: 'Firebase nu e configurat corect.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Eroare la verificarea Firebase: ' + error.message });
  }
});

// Endpoint pentru signup
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email și parolă sunt obligatorii.' });
  }

  try {
    const auth = getAuth(firebaseApp);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    res.status(201).json({ message: 'Cont creat cu succes!', userId: user.uid });
  } catch (error) {
    res.status(400).json({ error: 'Eroare la crearea contului: ' + error.message });
  }
});

// Endpoint pentru login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email și parolă sunt obligatorii.' });
  }

  try {
    const auth = getAuth(firebaseApp);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    res.status(200).json({ message: 'Logare reușită!', userId: user.uid });
  } catch (error) {
    res.status(400).json({ error: 'Eroare la logare: ' + error.message });
  }
});

// Endpoint pentru logout
app.post('/api/auth/logout', async (req, res) => {
  try {
    const auth = getAuth(firebaseApp);
    await signOut(auth);
    res.status(200).json({ message: 'Deconectare reușită!' });
  } catch (error) {
    res.status(400).json({ error: 'Eroare la deconectare: ' + error.message });
  }
});

// Endpoint pentru resetare parolă
app.post('/api/auth/reset-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email-ul este obligatoriu.' });
  }

  try {
    const auth = getAuth(firebaseApp);
    await sendPasswordResetEmail(auth, email);
    res.status(200).json({ message: 'Email pentru resetarea parolei a fost trimis!' });
  } catch (error) {
    res.status(400).json({ error: 'Eroare la trimiterea email-ului de resetare: ' + error.message });
  }
});

// Gestionăm cererile care nu se potrivesc cu fișiere statice sau API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Exportăm handler-ul pentru Vercel
module.exports = app;