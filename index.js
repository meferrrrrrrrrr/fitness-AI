const express = require('express');
const path = require('path');
const { app: firebaseApp, admin } = require('./auth');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } = require('firebase/auth');
const axios = require('axios');

const app = express();

// Parsăm body-ul cererilor JSON
app.use(express.json());

// Middleware pentru CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Servim fișierele statice
app.use(express.static(path.join(__dirname, '.'), {
  index: 'index.html',
  extensions: ['html', 'js', 'css']
}));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Middleware pentru gestionarea erorilor
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'An internal server error occurred', details: err.message });
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
    res.status(400).json({ error: `Error creating account: ${error.message}` });
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
    res.status(400).json({ error: `Error logging in: ${error.message}` });
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
    res.status(400).json({ error: `Error logging out: ${error.message}` });
  }
});

// Endpoint pentru resetare parolă
app.post('/api/auth/reset-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });
  if (!firebaseApp) return res.status(500).json({ error: 'Firebase app is not initialized.' });
  try {
    await admin.auth().getUserByEmail(email);
    const auth = getAuth(firebaseApp);
    await sendPasswordResetEmail(auth, email);
    res.status(200).json({ message: 'Password reset email has been sent!' });
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'Email is not registered.' });
    }
    res.status(400).json({ error: `Error sending password reset email: ${error.message}` });
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
    res.status(401).json({ error: `Invalid or expired token: ${error.message}` });
  }
});

// Endpoint pentru AI Coach
app.post('/api/ai/coach', async (req, res) => {
  const { goal, prompt, language = 'en' } = req.body;
  if (!goal) return res.status(400).json({ error: 'Goal is required.' });

  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) return res.status(500).json({ error: 'Open AI API key is missing.' });

  const prompts = {
    en: `You are a unique AI coach named MEF AI, with a motivating, practical tone and a dash of subtle humor. Create a 3-step daily plan for a user aiming for ${goal}. ${prompt ? `Incorporate the user's input: ${prompt}.` : ''} Tailor the plan to a regular routine (e.g., morning, afternoon, evening) with specific, clear, and feasible steps. Add an inspiring closing. Respond concisely, under 150 words, without excessive formatting. Ensure the plan is complete and properly concluded.`,
    ro: `Ești un coach AI unic numit MEF AI, cu un ton motivant, practic și un strop de umor subtil. Creează un plan zilnic de 3 pași pentru un utilizator care își dorește ${goal}. ${prompt ? `Incorporează inputul utilizatorului: ${prompt}.` : ''} Adaptează planul la o rutină obișnuită (ex. dimineață, după-amiază, seară), cu pași specifici, clari și fezabili. Adaugă o încheiere inspiratoare. Răspunde concis, sub 150 de cuvinte, fără formatare excesivă. Asigură-te că planul e complet și încheiat corespunzător.`
  };

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompts[language] || prompts['en'] }],
      max_tokens: 300,
    }, {
      headers: { 'Authorization': `Bearer ${openaiApiKey}` },
    });
    res.status(200).json({ plan: response.data.choices[0].message.content.trim() });
  } catch (error) {
    console.error('AI Coach error:', error.response?.data || error.message);
    res.status(500).json({ error: `Error generating plan: ${error.message}` });
  }
});

// Endpoint pentru Plan Nutrițional
app.post('/api/ai/nutrition', async (req, res) => {
  const { goal, prompt, language = 'en' } = req.body;
  if (!goal) return res.status(400).json({ error: 'Goal is required.' });

  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) return res.status(500).json({ error: 'Open AI API key is missing.' });

  const prompts = {
    en: `You are a unique AI nutritionist named MEF AI, with a practical, encouraging tone and a hint of humor. Create a 3-meal daily nutrition plan for a user aiming for ${goal}. ${prompt ? `Incorporate the user's input: ${prompt}.` : ''} Tailor the plan to a balanced diet (e.g., breakfast, lunch, dinner) with specific, healthy, and feasible meal ideas. Add a motivating closing. Respond concisely, under 150 words, without excessive formatting. Ensure the plan is complete and properly concluded.`,
    ro: `Ești un nutriționist AI unic numit MEF AI, cu un ton practic, încurajator și un strop de umor. Creează un plan zilnic de 3 mese pentru un utilizator care își dorește ${goal}. ${prompt ? `Incorporează inputul utilizatorului: ${prompt}.` : ''} Adaptează planul la o dietă echilibrată (ex. mic dejun, prânz, cină), cu idei de mese sănătoase și fezabile. Adaugă o încheiere motivantă. Răspunde concis, sub 150 de cuvinte, fără formatare excesivă. Asigură-te că planul e complet și încheiat corespunzător.`
  };

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompts[language] || prompts['en'] }],
      max_tokens: 300,
    }, {
      headers: { 'Authorization': `Bearer ${openaiApiKey}` },
    });
    res.status(200).json({ plan: response.data.choices[0].message.content.trim() });
  } catch (error) {
    console.error('AI Nutrition error:', error.response?.data || error.message);
    res.status(500).json({ error: `Error generating nutrition plan: ${error.message}` });
  }
});

// Pornim serverul
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Exportăm handler-ul pentru Vercel
module.exports = app;