const express = require('express');
const path = require('path');
const { app: firebaseApp, admin } = require('./auth');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } = require('firebase/auth');

const app = express();

// Parsăm body-ul cererilor JSON
app.use(express.json());

// Servim fișierele statice din folderul public
app.use(express.static(path.join(__dirname, 'public')));

// Middleware pentru gestionarea erorilor
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'A apărut o eroare internă', details: err.message });
});

// Endpoint pentru signup
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email și parolă sunt obligatorii.' });
  }

  if (!firebaseApp) {
    return res.status(500).json({ error: 'Firebase app nu este inițializat.' });
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

  if (!firebaseApp) {
    return res.status(500).json({ error: 'Firebase app nu este inițializat.' });
  }

  try {
    const auth = getAuth(firebaseApp);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const idToken = await user.getIdToken();
    res.status(200).json({ message: 'Logare reușită!', userId: user.uid, token: idToken });
  } catch (error) {
    res.status(400).json({ error: 'Eroare la logare: ' + error.message });
  }
});

// Endpoint pentru logout
app.post('/api/auth/logout', async (req, res) => {
  if (!firebaseApp || !admin) {
    return res.status(500).json({ error: 'Firebase app sau admin nu este inițializat.' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autentificare lipsă sau invalid.' });
    }

    const token = authHeader.split(' ')[1];
    await admin.auth().verifyIdToken(token);
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

  if (!firebaseApp) {
    return res.status(500).json({ error: 'Firebase app nu este inițializat.' });
  }

  try {
    const auth = getAuth(firebaseApp);
    await sendPasswordResetEmail(auth, email);
    res.status(200).json({ message: 'Email pentru resetarea parolei a fost trimis!' });
  } catch (error) {
    res.status(400).json({ error: 'Eroare la trimiterea email-ului de resetare: ' + error.message });
  }
});

// Endpoint pentru a obține utilizatorul curent
app.get('/api/auth/user', async (req, res) => {
  if (!firebaseApp || !admin) {
    return res.status(500).json({ error: 'Firebase app sau admin nu este inițializat.' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autentificare lipsă sau invalid.' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const email = decodedToken.email;

    if (!email) {
      return res.status(401).json({ error: 'Utilizatorul nu este autentificat.' });
    }

    res.status(200).json({ email });
  } catch (error) {
    res.status(401).json({ error: 'Token invalid sau expirat: ' + error.message });
  }
});

// Servim index.html doar pentru ruta rădăcină (ca fallback)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Pornim serverul
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Exportăm handler-ul pentru Vercel
module.exports = app;