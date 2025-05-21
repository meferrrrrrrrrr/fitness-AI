const express = require('express');
const path = require('path');
const { app: firebaseApp } = require('./auth');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth'); // Adăugăm funcții pentru autentificare

const app = express();
const port = process.env.PORT || 3000;

// Parsăm body-ul cererilor JSON
app.use(express.json());

// Servim fișierele statice (ex. index.html)
app.use(express.static(path.join(__dirname, '.')));

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
  
  // Verificăm dacă email și parolă sunt furnizate
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

app.listen(port, () => {
  console.log(`Serverul rulează pe port ${port}`);
});