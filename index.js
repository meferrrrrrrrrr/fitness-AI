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
  const { goal, level, prompt, language = 'en' } = req.body;
  if (!goal || !level) return res.status(400).json({ error: 'Goal and level are required.' });

  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) return res.status(500).json({ error: 'Open AI API key is missing.' });

  // Detectăm limba din input (goal sau prompt)
  const isRomanian = goal.toLowerCase().includes('creștere') || goal.toLowerCase().includes('slăbire') || goal.toLowerCase().includes('definire') || 
                    (prompt && prompt.toLowerCase().includes('ajuta'));
  const detectedLanguage = isRomanian ? 'ro' : 'en';

  const prompts = {
    en: `You are an elite AI coach, part of MEF AI, designed to revolutionize fitness with smart plans. Create a daily workout plan for a user with this profile:
    - **Goal**: ${goal}
    - **Level**: ${level}
    - **Preferences**: ${prompt || 'none'}
    - **Language**: English

    Plan must include:
    - Warm-up: Note to do a 5-10 minute warm-up.
    - Main workout: List 4-5 well-known exercises tailored to the preference, with dynamic sets and reps for level and goal (2-3 sets, 10-12 reps for first two; 3-4 sets, 8-12 reps for next).
    - Cool-down: Note to do 5 minutes of stretching.

    Adjust difficulty smartly:
    - **Beginner**: Start with lower reps, increase gradually.
    - **Intermediate**: Balance intensity with volume.
    - **Advanced**: Push limits with higher sets/reps.

    Keep it short, energetic, and motivating with MEF AI vibe. End with a humorous, inspiring close. Ignore nutrition and skip exercise details!`,
    ro: `Ești un antrenor AI de elită, parte a MEF AI, conceput să revoluționeze fitness-ul cu planuri de antrenament inteligente. Creează un plan de antrenament zilnic pentru un utilizator cu acest profil:
    - **Obiectiv**: ${goal}
    - **Nivel**: ${level}
    - **Preferințe**: ${prompt || 'niciuna'}
    - **Limbă**: Română

    Planul trebuie să includă:
    - Încălzire: Notă să faci o încălzire de 5-10 minute.
    - Antrenament principal: Listează 4-5 exerciții bine cunoscute adaptate preferinței, cu serii și repetări dinamice pentru nivel și obiectiv (2-3 serii, 10-12 repetări pentru primii doi; 3-4 serii, 8-12 repetări pentru următorii).
    - Răcire: Notă să faci 5 minute de stretching.

    Ajustează dificultatea inteligent:
    - **Începător**: Începe cu repetări mai mici, crește treptat.
    - **Intermediar**: Echilibrează intensitatea cu volumul.
    - **Avansat**: Împinge limitele cu seturi/repetări mai mari.

    Fii scurt, energic și motivant, cu vibe MEF AI. Termină cu o încheiere amuzantă și inspiratoare. Ignoră nutriția și evită detaliile exercițiilor!`
  };

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompts[detectedLanguage] }],
      max_tokens: 600,
    }, {
      headers: { 'Authorization': `Bearer ${openaiApiKey}` },
    });
    res.status(200).json({ plan: response.data.choices[0].message.content.trim() });
  } catch (error) {
    console.error('AI Coach error:', error.response?.data || error.message);
    res.status(500).json({ error: `Error generating plan: ${error.message}` });
  }
});

// Endpoint pentru Plan Nutrițional (temporar ignorat)
app.post('/api/ai/nutrition', async (req, res) => {
  res.status(403).json({ error: 'Nutrition endpoint is currently disabled.' });
});

// Pornim serverul
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Exportăm handler-ul pentru Vercel
module.exports = app;