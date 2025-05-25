// Funcție pentru a încărca email-ul utilizatorului
async function loadUserEmail() {
    try {
        const token = localStorage.getItem('authToken'); // Obținem token-ul din localStorage
        console.log('Token găsit în Local Storage:', token); // Depanare: Verificăm token-ul
        if (!token) {
            document.getElementById('userEmail').textContent = 'Nu există token. Te rog să te loghezi.';
            return;
        }

        // Folosim URL-ul complet pentru Vercel
        const apiUrl = `${window.location.origin}/api/auth/user`;
        console.log('Trimit cerere către:', apiUrl); // Depanare: Confirmăm URL-ul

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Adăugăm token-ul în header
            }
        });
        console.log('Răspuns primit:', response.status, response.statusText); // Depanare: Vedem statusul

        const data = await response.json();
        const emailElement = document.getElementById('userEmail');
        if (response.ok) {
            emailElement.textContent = `Email: ${data.email}`; // Afișăm email-ul
        } else {
            emailElement.textContent = `Eroare: ${data.error || 'Eroare la încărcarea email-ului.'}`; // Afișăm eroarea
        }
    } catch (error) {
        console.error('Eroare detaliată la fetch:', error); // Depanare: Vedem eroarea completă
        document.getElementById('userEmail').textContent = `Eroare la conectare cu serverul: ${error.message}`;
    }
}

// Apelăm funcția când pagina se încarcă
window.onload = loadUserEmail;