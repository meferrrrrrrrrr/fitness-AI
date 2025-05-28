// Funcție pentru a încărca email-ul utilizatorului
async function loadUserEmail() {
    try {
        const token = localStorage.getItem('authToken');
        console.log('Token găsit în Local Storage:', token);
        const emailElement = document.getElementById('userEmail');
        if (!token) {
            emailElement.textContent = 'Nu există token. Te rog să te loghezi.';
            return;
        }

        const apiUrl = `${window.location.origin}/api/auth/user`;
        console.log('Trimit cerere către:', apiUrl);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
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
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();

        if (response.ok) {
            localStorage.removeItem('authToken');
            window.location.href = 'index.html';
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