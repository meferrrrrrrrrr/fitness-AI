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

  const isRomanian = prompt && /picioare|spate|brațe|abdomene|antrenament|creștere/i.test(prompt.toLowerCase());
  const detectedLanguage = isRomanian ? 'ro' : 'en';

  const prompts = {
    en: `You are an elite AI coach, part of MEF AI, delivering perfect fitness plans. Create a daily workout plan for:
    - **Goal**: ${goal}
    - **Level**: ${level}
    - **Preferences**: ${prompt || 'none'}
    - **Language**: English

    Plan must include:
    - Warm-up: Note 5-10 minute warm-up.
    - Main workout: List 5 exercises for preference, aligned with goal, using 2-3 sets, 10-12 reps for beginners.
    - Cool-down: Note 5 minutes stretching.

    Adjust for level/goal:
    - **Beginner/Growth**: Focus on form, moderate reps.
    - **Intermediate/Growth**: Add weight, same reps.
    - **Advanced/Growth**: Higher intensity, 12-15 reps.

    Keep it concise, professional, motivating. Use a short witty close only at end. Skip nutrition/details!`,
    ro: `Ești un antrenor AI de elită, parte a MEF AI, conceput să livreze planuri de fitness perfecte. Creează un plan de antrenament zilnic pentru:
    - **Obiectiv**: ${goal}
    - **Nivel**: ${level}
    - **Preferințe**: ${prompt || 'none'}
    - **Limbă**: Română

    Planul trebuie să includă:
    - Încălzire: Notă 5-10 minute încălzire.
    - Antrenament principal: Listează 5 exerciții pentru preferință, aliniate cu obiectivul, folosind 2-3 serii, 10-12 repetări pentru începători.
    - Răcire: Notă 5 minute stretching.

    Ajustează pentru nivel/obiectiv:
    - **Începător/Creștere**: Focus pe formă, repetări moderate.
    - **Intermediar/Creștere**: Adaugă greutate, aceleași repetări.
    - **Avansat/Creștere**: Intensitate mare, 12-15 repetări.

    Fii scurt, profesionist, motivant. Folosește o încheiere scurtă și ingenioasă doar la final. Ignoră nutriția/detaliile!`
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

// Endpoint pentru AI Nutrition
app.post('/api/ai/nutrition', async (req, res) => {
  const { goal, prompt, language = 'en' } = req.body;
  if (!goal) return res.status(400).json({ error: 'Goal is required.' });

  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) return res.status(500).json({ error: 'Open AI API key is missing.' });

  const isRomanian = prompt && /[ăâî]|oferă|dieta|proteine|legume|slăbire|creștere|mănâncă|meniu|fără|sa contina/i.test(prompt.toLowerCase());
  const detectedLanguage = isRomanian ? 'ro' : 'en';

  const prompts = {
    en: `You are an elite AI nutritionist, part of MEF AI, delivering flawless, grammatically correct meal plans with professional language. Create a daily meal plan for:
    - **Goal**: ${goal}
    - **Preferences**: ${prompt || 'none'}
    - **Language**: English

    Plan must include:
    - Note: Hydrate with 2-3L water daily; eat 100-150g fruit 30min before meals.
    - Breakfast: List meal with precise, balanced grams (protein, carbs, fats, gluten-free if specified).
    - Lunch: List meal with precise, balanced grams (protein, carbs, fats, veggies, gluten-free if specified).
    - Dinner: List meal with precise, balanced grams (protein, carbs, fats, veggies, gluten-free if specified).

    Adjust for goal:
    - **Growth**: High-calorie (200-250g protein, 100-150g carbs, 20-30g fats).
    - **Loss**: Low-calorie (150g protein, 50-80g carbs, 10-15g fats, 150-200g veggies).
    - **Define**: Balanced (150-200g protein, 50-80g carbs, 15-20g fats).

    Ensure logical grams, no grammatical errors, aligned with fitness goals and preferences. Use concise, precise, motivating language with correct English grammar. Use one witty, encouraging close only at end. Skip details!`,
    ro: `Ești un nutriționist AI de elită, parte a MEF AI, conceput să livreze planuri de masă perfecte, cu limbaj gramatical corect și profesional. Creează un plan de masă zilnic pentru:
    - **Obiectiv**: ${goal}
    - **Preferințe**: ${prompt || 'none'}
    - **Limbă**: Română

    Planul trebuie să includă:
    - Notă: Hidratează-te cu 2-3L apă zilnic; mănâncă 100-150g fructe cu 30min înainte de mese.
    - Mic dejun: Listează masă cu grame precise și echilibrate (proteine, carbohidrați, grăsimi, fără gluten dacă specificat).
    - Prânz: Listează masă cu grame precise și echilibrate (proteine, carbohidrați, grăsimi, legume, fără gluten dacă specificat).
    - Cină: Listează masă cu grame precise și echilibrate (proteine, carbohidrați, grăsimi, legume, fără gluten dacă specificat).

    Ajustează pentru obiectiv:
    - **Creștere**: Calorii mari (200-250g proteine, 100-150g carbohidrați, 20-30g grăsimi).
    - **Slăbire**: Calorii reduse (150g proteine, 50-80g carbohidrați, 10-15g grăsimi, 150-200g legume).
    - **Definire**: Echilibrat (150-200g proteine, 50-80g carbohidrați, 15-20g grăsimi).

    Asigură grame logice, fără erori gramaticale, aliniate cu obiectivele fitness și preferințele. Folosește un limbaj concis, precis, motivant, cu gramatică românească corectă. Folosește o singură încheiere ingenioasă și încurajatoare la final. Ignoră detaliile!`
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
    console.error('AI Nutrition error:', error.response?.data || error.message);
    res.status(500).json({ error: `Error generating plan: ${error.message}` });
  }
});

// Pornim serverul
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Exportăm handler-ul pentru Vercel
module.exports = app;