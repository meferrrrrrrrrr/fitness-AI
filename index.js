const express = require('express');
const path = require('path');
const { app: firebaseApp } = require('./auth');

const app = express();
const port = process.env.PORT || 3000;

// Servim fișierele statice (ex. index.html)
app.use(express.static(path.join(__dirname, '.')));

// Adăugăm un endpoint de test pentru a verifica Firebase
app.get('/api/test-firebase', (req, res) => {
  try {
    // Verificăm dacă Firebase app e inițializat
    if (firebaseApp && firebaseApp.options.projectId === 'ai-fitness94') {
      res.status(200).json({ message: 'Firebase configurat corect!' });
    } else {
      res.status(500).json({ error: 'Firebase nu e configurat corect.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Eroare la verificarea Firebase: ' + error.message });
  }
});

// Pornim serverul
app.listen(port, () => {
  console.log(`Serverul rulează pe port ${port}`);
});