document.addEventListener('DOMContentLoaded', () => {
    // Verificăm sesiunea la încărcare
    const authToken = localStorage.getItem('authToken');
    const profileLink = document.getElementById('profileLink');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const logoutButton = document.getElementById('logoutButton');
    const messageDiv = document.getElementById('message');

    // Resetează mesajul la încărcare
    if (messageDiv) messageDiv.className = 'message hidden';

    if (authToken) {
        if (profileLink) profileLink.style.display = 'block';
        if (signupForm) signupForm.className = 'form-container hidden';
        if (loginForm) loginForm.className = 'form-container hidden';
        if (logoutButton) logoutButton.style.display = 'block'; // Afișăm logout
    } else {
        if (profileLink) profileLink.style.display = 'none';
        if (signupForm) signupForm.className = 'form-container hidden'; // Ascundem signup
        if (loginForm) loginForm.className = 'form-container visible'; // Afișăm login
        if (showSignup) showSignup.className = 'toggle-button';
        if (showLogin) showLogin.className = 'toggle-button active';
        if (logoutButton) logoutButton.style.display = 'none'; // Ascundem logout
    }

    async function handleSignup() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const messageDiv = document.getElementById('message');
        const signupForm = document.getElementById('signupForm');
        const loginForm = document.getElementById('loginForm');
        const showSignup = document.getElementById('showSignup');
        const showLogin = document.getElementById('showLogin');

        if (!email || !password) {
            messageDiv.textContent = 'Email-ul și parola sunt obligatorii.';
            messageDiv.className = 'message error visible';
            setTimeout(() => {
                messageDiv.className = 'message error hidden';
            }, 3000);
            return;
        }

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (response.ok) {
                messageDiv.textContent = data.message;
                messageDiv.className = 'message success visible';
                if (signupForm) signupForm.className = 'form-container hidden';
                if (loginForm) loginForm.className = 'form-container visible';
                if (showSignup) showSignup.className = 'toggle-button';
                if (showLogin) showLogin.className = 'toggle-button active';
                setTimeout(() => {
                    messageDiv.className = 'message success hidden';
                }, 3000);
            } else {
                messageDiv.textContent = data.error;
                messageDiv.className = 'message error visible';
                setTimeout(() => {
                    messageDiv.className = 'message error hidden';
                }, 3000);
            }
        } catch (error) {
            messageDiv.textContent = 'Eroare la conectare: ' + error.message;
            messageDiv.className = 'message error visible';
            setTimeout(() => {
                messageDiv.className = 'message error hidden';
            }, 3000);
        }
    }

    async function handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const messageDiv = document.getElementById('message');
        const signupForm = document.getElementById('signupForm');
        const loginForm = document.getElementById('loginForm');
        const showSignup = document.getElementById('showSignup');
        const showLogin = document.getElementById('showLogin');
        const profileLink = document.getElementById('profileLink');

        if (!email || !password) {
            messageDiv.textContent = 'Email-ul și parola sunt obligatorii.';
            messageDiv.className = 'message error visible';
            setTimeout(() => {
                messageDiv.className = 'message error hidden';
            }, 3000);
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (response.ok) {
                messageDiv.textContent = data.message;
                messageDiv.className = 'message success visible';
                if (profileLink) profileLink.style.display = 'block';
                localStorage.setItem('authToken', data.token); // Salvăm token-ul
                setTimeout(() => {
                    messageDiv.className = 'message success hidden';
                    window.location.href = 'profile.html'; // Redirecționare
                }, 3000);
            } else {
                messageDiv.textContent = data.error;
                messageDiv.className = 'message error visible';
                setTimeout(() => {
                    messageDiv.className = 'message error hidden';
                }, 3000);
            }
        } catch (error) {
            messageDiv.textContent = 'Eroare la conectare: ' + error.message;
            messageDiv.className = 'message error visible';
            setTimeout(() => {
                messageDiv.className = 'message error hidden';
            }, 3000);
        }
    }

    async function handleLogout() {
        const authToken = localStorage.getItem('authToken');
        const messageDiv = document.getElementById('message');
        const profileLink = document.getElementById('profileLink');
        const logoutButton = document.getElementById('logoutButton');

        if (!authToken) {
            if (messageDiv) {
                messageDiv.textContent = 'Nu ești autentificat.';
                messageDiv.className = 'message error visible';
                setTimeout(() => {
                    messageDiv.className = 'message error hidden';
                }, 3000);
            }
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
                if (messageDiv) {
                    messageDiv.textContent = data.message;
                    messageDiv.className = 'message success visible';
                }
                if (profileLink) profileLink.style.display = 'none';
                if (logoutButton) logoutButton.style.display = 'none';
                localStorage.removeItem('authToken'); // Ștergem token-ul
                setTimeout(() => {
                    if (messageDiv) messageDiv.className = 'message success hidden';
                    window.location.href = 'index.html'; // Redirecționare
                }, 3000);
            } else {
                if (messageDiv) {
                    messageDiv.textContent = data.error;
                    messageDiv.className = 'message error visible';
                    setTimeout(() => {
                        messageDiv.className = 'message error hidden';
                    }, 3000);
                }
            }
        } catch (error) {
            if (messageDiv) {
                messageDiv.textContent = 'Eroare la deconectare: ' + error.message;
                messageDiv.className = 'message error visible';
                setTimeout(() => {
                    messageDiv.className = 'message error hidden';
                }, 3000);
            }
        }
    }

    function showSignupForm() {
        const signupForm = document.getElementById('signupForm');
        const loginForm = document.getElementById('loginForm');
        const showSignup = document.getElementById('showSignup');
        const showLogin = document.getElementById('showLogin');
        const profileLink = document.getElementById('profileLink');
        if (signupForm) signupForm.className = 'form-container visible';
        if (loginForm) loginForm.className = 'form-container hidden';
        if (showSignup) showSignup.className = 'toggle-button active';
        if (showLogin) showLogin.className = 'toggle-button';
        if (profileLink) profileLink.style.display = 'none';
    }

    function showLoginForm() {
        const signupForm = document.getElementById('signupForm');
        const loginForm = document.getElementById('loginForm');
        const showSignup = document.getElementById('showSignup');
        const showLogin = document.getElementById('showLogin');
        const profileLink = document.getElementById('profileLink');
        if (signupForm) signupForm.className = 'form-container hidden';
        if (loginForm) loginForm.className = 'form-container visible';
        if (showSignup) showSignup.className = 'toggle-button';
        if (showLogin) showLogin.className = 'toggle-button active';
        if (profileLink) profileLink.style.display = 'none';
    }

    // Expunem funcțiile global pentru a fi apelate din HTML
    window.handleSignup = handleSignup;
    window.handleLogin = handleLogin;
    window.handleLogout = handleLogout;
    window.showSignupForm = showSignupForm;
    window.showLoginForm = showLoginForm;

    // Adăugăm manual event listeneri pentru butoane
    const signupButton = document.getElementById('signupButton');
    if (signupButton) {
        signupButton.addEventListener('click', handleSignup);
    } else {
        console.error('Butonul de signup nu a fost găsit!');
    }

    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', handleLogin);
    } else {
        console.error('Butonul de login nu a fost găsit!');
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    } else {
        console.error('Butonul de logout nu a fost găsit!');
    }

    const showSignupButton = document.getElementById('showSignup');
    if (showSignupButton) {
        showSignupButton.addEventListener('click', showSignupForm);
    } else {
        console.error('Butonul de afișare signup nu a fost găsit!');
    }

    const showLoginButton = document.getElementById('showLogin');
    if (showLoginButton) {
        showLoginButton.addEventListener('click', showLoginForm);
    } else {
        console.error('Butonul de afișare login nu a fost găsit!');
    }
});