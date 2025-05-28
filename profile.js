// Funcție pentru a încărca email-ul utilizatorului
async function loadUserEmail() {
    try {
        const authToken = localStorage.getItem('authToken');
        console.log('Token găsit în Local Storage:', authToken);
        const emailElement = document.getElementById('userEmail');
        if (!authToken) {
            emailElement.textContent = 'Nu există token. Te rog să te loghezi.';
            return;
        }

        const apiUrl = `${window.location.origin}/api/auth/user`;
        console.log('Trimit cerere către:', apiUrl);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });
        console.log('Răspuns primit:', response.status, response.statusText);

        const data = await response.json();
        if (response.ok) {
            emailElement.textContent = `Email: ${data.email}`;
        } else {
            emailElement.textContent = `Eroare: ${data.error || 'Eroare la încărcarea email-ului.'}`;
        }
    } catch (error) {
        console.error('Eroare detaliată la fetch:', error);
        document.getElementById('userEmail').textContent = `Eroare la conectare cu serverul: ${error.message}`;
    }
}

// Funcție pentru logout cu confirmare
async function handleLogout() {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        console.error('Nu există token pentru logout.');
        return;
    }

    if (!confirm('Sigur vrei să te deconectezi?')) {
        return;
    }

    try {
        console.log('Trimit cerere de logout către /api/auth/logout');
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });
        console.log('Răspuns primit de la logout:', response.status, response.statusText);
        const data = await response.json();

        if (response.ok) {
            console.log('Logout reușit, șterg token și redirecționez:', data.message);
            localStorage.removeItem('authToken');
            window.location.href = '/index.html'; // Path absolut
        } else {
            console.error('Eroare la logout:', data.error);
        }
    } catch (error) {
        console.error('Eroare la deconectare:', error.message);
    }
}

// Adăugăm event listener pentru butonul de logout
document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    } else {
        console.error('Butonul de logout nu a fost găsit!');
    }
});

// Apelăm funcția când pagina se încarcă
window.onload = loadUserEmail;