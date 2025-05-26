// Funcție pentru a încărca email-ul utilizatorului
async function loadUserEmail() {
    try {
        const token = localStorage.getItem('authToken'); // Obținem token-ul din localStorage
        console.log('Token găsit în Local Storage:', token); // Depanare: Verificăm token-ul
        if (!token) {
            document.getElementById('userEmail').textContent = 'Nu există token. Te rog să te loghezi.';
            return;
        }

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

// Funcție pentru logout cu confirmare
async function handleLogout() {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        console.error('Nu există token pentru logout.');
        return;
    }

    // Cerem confirmare utilizatorului
    if (!confirm('Sigur vrei să te deconectezi?')) {
        return; // Anulăm logout-ul dacă utilizatorul apasă "Cancel"
    }

    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });
        const data = await response.json();

        if (response.ok) {
            localStorage.removeItem('authToken'); // Ștergem token-ul
            window.location.href = 'index.html'; // Redirecționăm la index
        } else {
            console.error('Eroare la logout:', data.error);
        }
    } catch (error) {
        console.error('Eroare la deconectare:', error.message);
    }
}

// Funcție pentru salvarea obiectivului (simulat)
function handleSaveGoal() {
    const targetWeight = document.getElementById('targetWeight').value;
    const goalMessage = document.getElementById('goalMessage');

    if (!targetWeight || targetWeight <= 0) {
        goalMessage.textContent = 'Please enter a valid weight.';
        goalMessage.className = 'message error visible';
        setTimeout(() => {
            goalMessage.className = 'message error hidden';
        }, 3000);
        return;
    }

    // Simulăm salvarea
    goalMessage.textContent = `Goal saved! Target weight: ${targetWeight} kg`;
    goalMessage.className = 'message success visible';
    setTimeout(() => {
        goalMessage.className = 'message success hidden';
    }, 3000);

    // Resetăm input-ul
    document.getElementById('targetWeight').value = '';
}

// Adăugăm event listener pentru butoanele de logout și save goal
document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    } else {
        console.error('Butonul de logout nu a fost găsit!');
    }

    const saveGoalButton = document.getElementById('saveGoalButton');
    if (saveGoalButton) {
        saveGoalButton.addEventListener('click', handleSaveGoal);
    } else {
        console.error('Butonul de salvare obiectiv nu a fost găsit!');
    }
});

// Apelăm funcția când pagina se încarcă
window.onload = loadUserEmail;