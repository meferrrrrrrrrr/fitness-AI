const express = require('express');
const path = require('path');
const { app: firebaseApp, admin } = require('./auth');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } = require('firebase/auth');

const app = express();

// Parsăm body-ul cererilor JSON
app.use(express.json());

// Servim fișierele statice din rădăcina proiectului (HTML, JS, CSS)
app.use(express.static(path.join(__dirname, '.'), {
  index: 'index.html',
  extensions: ['html', 'js', 'css']
}));

// Servim fișierele statice din folderul public (imagini, etc.)
app.use('/public', express.static(path.join(__dirname, 'public')));

// Middleware pentru gestionarea erorilor
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'An internal error occurred', details: err.message });
});

// Endpoint pentru signup
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
  if (!firebaseApp) return res.status(500).json({ error: 'Firebase app is not initialized.' });
  try {
    const auth = getAuth(firebaseApp);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    res.status(201).json({ message: 'Account created successfully!', userId: user.uid });
  } catch (error) {
    res.status(400).json({ error: 'Error creating account: ' + error.message });
  }
});

// Endpoint pentru login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
  if (!firebaseApp) return res.status(500).json({ error: 'Firebase app is not initialized.' });
  try {
    const auth = getAuth(firebaseApp);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const idToken = await user.getIdToken();
    res.status(200).json({ message: 'Login successful!', userId: user.uid, token: idToken });
  } catch (error) {
    res.status(400).json({ error: 'Error logging in: ' + error.message });
  }
});

// Endpoint pentru logout
app.post('/api/auth/logout', async (req, res) => {
  if (!firebaseApp || !admin) return res.status(500).json({ error: 'Firebase app or admin is not initialized.' });
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication token missing or invalid.' });
    const token = authHeader.split(' ')[1];
    await admin.auth().verifyIdToken(token);
    const auth = getAuth(firebaseApp);
    await signOut(auth);
    res.status(200).json({ message: 'Logout successful!' });
  } catch (error) {
    res.status(400).json({ error: 'Error logging out: ' + error.message });
  }
});

// Endpoint pentru resetare parolă
app.post('/api/auth/reset-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });
  if (!firebaseApp) return res.status(500).json({ error: 'Firebase app is not initialized.' });
  try {
    // Verificăm dacă emailul există
    await admin.auth().getUserByEmail(email);
    // Dacă ajunge aici, emailul există – trimitem emailul de resetare
    const auth = getAuth(firebaseApp);
    await sendPasswordResetEmail(auth, email);
    res.status(200).json({ message: 'Password reset email has been sent!' });
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'Email is not registered.' });
    }
    res.status(400).json({ error: 'Error sending password reset email: ' + error.message });
  }
});

// Endpoint pentru a obține utilizatorul curent
app.get('/api/auth/user', async (req, res) => {
  if (!firebaseApp || !admin) return res.status(500).json({ error: 'Firebase app or admin is not initialized.' });
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication token missing or invalid.' });
    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const email = decodedToken.email;
    if (!email) return res.status(401).json({ error: 'User is not authenticated.' });
    res.status(200).json({ email });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token: ' + error.message });
  }
});

// Pornim serverul
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Exportăm handler-ul pentru Vercel
module.exports = app;