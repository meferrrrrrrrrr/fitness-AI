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

     // Funcție pentru logout
     async function handleLogout() {
         const authToken = localStorage.getItem('authToken');
         if (!authToken) {
             console.error('Nu există token pentru logout.');
             return;
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