document.addEventListener('DOMContentLoaded', () => {
    // Elemente DOM
    const authToken = localStorage.getItem('authToken');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const messageDiv = document.getElementById('message');
    let statusDiv = document.createElement('div'); // Pentru afișarea stării
    statusDiv.id = 'statusDiv';
    document.querySelector('.content').insertBefore(statusDiv, messageDiv);

    // Resetează mesajul la încărcare
    if (messageDiv) messageDiv.className = 'message hidden';

    // Inițializăm starea
    console.log('Token inițial la încărcare:', authToken);
    updateStatus(authToken);

    function updateStatus(token) {
        console.log('Actualizez starea cu token:', token);
        if (token) {
            if (signupForm) signupForm.className = 'form-container hidden';
            if (loginForm) loginForm.className = 'form-container hidden';
            if (showSignup) showSignup.style.display = 'none';
            if (showLogin) showLogin.style.display = 'none';
            statusDiv.innerHTML = `Logat ca: ${localStorage.getItem('lastEmail') || 'Utilizator'} <button id="logoutButton" class="logout-btn">Logout</button>`;
            document.getElementById('logoutButton').addEventListener('click', handleLogout);
        } else {
            if (signupForm) signupForm.className = 'form-container hidden';
            if (loginForm) loginForm.className = 'form-container visible';
            if (showSignup) showSignup.className = 'toggle-button';
            if (showLogin) showLogin.className = 'toggle-button active';
            if (showSignup) showSignup.style.display = 'inline-block';
            if (showLogin) showLogin.style.display = 'inline-block';
            statusDiv.innerHTML = 'Nu ești autentificat.';
        }
    }

    async function handleSignup() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            messageDiv.textContent = 'Email-ul și parola sunt obligatorii.';
            messageDiv.className = 'message error visible';
            setTimeout(() => { messageDiv.className = 'message error hidden'; }, 3000);
            return;
        }

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            console.log('Răspuns signup:', data);

            if (response.ok) {
                messageDiv.textContent = data.message;
                messageDiv.className = 'message success visible';
                localStorage.setItem('lastEmail', email); // Salvăm email-ul pentru afișare
                // Login automat după signup
                const loginResponse = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const loginData = await loginResponse.json();
                console.log('Răspuns login automat după signup:', loginData);
                if (loginResponse.ok) {
                    localStorage.setItem('authToken', loginData.token);
                    updateStatus(loginData.token);
                } else {
                    messageDiv.textContent = 'Cont creat, dar logare automată eșuată: ' + loginData.error;
                    messageDiv.className = 'message error visible';
                }
                setTimeout(() => { messageDiv.className = 'message success hidden'; }, 3000);
            } else {
                messageDiv.textContent = data.error;
                messageDiv.className = 'message error visible';
                setTimeout(() => { messageDiv.className = 'message error hidden'; }, 3000);
            }
        } catch (error) {
            messageDiv.textContent = 'Eroare la conectare: ' + error.message;
            messageDiv.className = 'message error visible';
            setTimeout(() => { messageDiv.className = 'message error hidden'; }, 3000);
        }
    }

    async function handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            messageDiv.textContent = 'Email-ul și parola sunt obligatorii.';
            messageDiv.className = 'message error visible';
            setTimeout(() => { messageDiv.className = 'message error hidden'; }, 3000);
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            console.log('Răspuns login:', data);

            if (response.ok) {
                messageDiv.textContent = data.message;
                messageDiv.className = 'message success visible';
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('lastEmail', email); // Salvăm email-ul
                console.log('Token salvat după login:', localStorage.getItem('authToken'));
                updateStatus(data.token);
                setTimeout(() => { messageDiv.className = 'message success hidden'; }, 3000);
            } else {
                messageDiv.textContent = data.error;
                messageDiv.className = 'message error visible';
                setTimeout(() => { messageDiv.className = 'message error hidden'; }, 3000);
            }
        } catch (error) {
            messageDiv.textContent = 'Eroare la conectare: ' + error.message;
            messageDiv.className = 'message error visible';
            setTimeout(() => { messageDiv.className = 'message error hidden'; }, 3000);
        }
    }

    async function handleLogout() {
        const authToken = localStorage.getItem('authToken');

        if (!authToken) {
            messageDiv.textContent = 'Nu ești autentificat.';
            messageDiv.className = 'message error visible';
            setTimeout(() => { messageDiv.className = 'message error hidden'; }, 3000);
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
            console.log('Răspuns logout:', data);

            if (response.ok) {
                messageDiv.textContent = data.message;
                messageDiv.className = 'message success visible';
                localStorage.removeItem('authToken');
                localStorage.removeItem('lastEmail');
                console.log('Token șters după logout:', localStorage.getItem('authToken'));
                updateStatus(null);
                setTimeout(() => { messageDiv.className = 'message success hidden'; }, 3000);
            } else {
                messageDiv.textContent = data.error;
                messageDiv.className = 'message error visible';
                setTimeout(() => { messageDiv.className = 'message error hidden'; }, 3000);
            }
        } catch (error) {
            messageDiv.textContent = 'Eroare la deconectare: ' + error.message;
            messageDiv.className = 'message error visible';
            setTimeout(() => { messageDiv.className = 'message error hidden'; }, 3000);
        }
    }

    async function handleResetPassword() {
        const email = document.getElementById('loginEmail').value;

        if (!email) {
            messageDiv.textContent = 'Email-ul este obligatoriu.';
            messageDiv.className = 'message error visible';
            setTimeout(() => { messageDiv.className = 'message error hidden'; }, 3000);
            return;
        }

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            console.log('Răspuns reset password:', data);

            if (response.ok) {
                messageDiv.textContent = data.message;
                messageDiv.className = 'message success visible';
            } else {
                messageDiv.textContent = data.error;
                messageDiv.className = 'message error visible';
            }
            setTimeout(() => { messageDiv.className = 'message hidden'; }, 3000);
        } catch (error) {
            messageDiv.textContent = 'Eroare la resetarea parolei: ' + error.message;
            messageDiv.className = 'message error visible';
            setTimeout(() => { messageDiv.className = 'message error hidden'; }, 3000);
        }
    }

    function showSignupForm() {
        const signupForm = document.getElementById('signupForm');
        const loginForm = document.getElementById('loginForm');
        if (signupForm) signupForm.className = 'form-container visible';
        if (loginForm) loginForm.className = 'form-container hidden';
        if (showSignup) showSignup.className = 'toggle-button active';
        if (showLogin) showLogin.className = 'toggle-button';
    }

    function showLoginForm() {
        const signupForm = document.getElementById('signupForm');
        const loginForm = document.getElementById('loginForm');
        if (signupForm) signupForm.className = 'form-container hidden';
        if (loginForm) loginForm.className = 'form-container visible';
        if (showSignup) showSignup.className = 'toggle-button';
        if (showLogin) showLogin.className = 'toggle-button active';
    }

    // Expunem funcțiile global
    window.handleSignup = handleSignup;
    window.handleLogin = handleLogin;
    window.handleLogout = handleLogout;
    window.handleResetPassword = handleResetPassword;
    window.showSignupForm = showSignupForm;
    window.showLoginForm = showLoginForm;

    // Adăugăm manual event listeneri
    const signupButton = document.getElementById('signupButton');
    if (signupButton) signupButton.addEventListener('click', handleSignup);

    const loginButton = document.getElementById('loginButton');
    if (loginButton) loginButton.addEventListener('click', (event) => {
        event.preventDefault();
        handleLogin();
    });

    const resetPasswordButton = document.getElementById('resetPasswordButton');
    if (resetPasswordButton) resetPasswordButton.addEventListener('click', handleResetPassword);

    const showSignupButton = document.getElementById('showSignup');
    if (showSignupButton) showSignupButton.addEventListener('click', showSignupForm);

    const showLoginButton = document.getElementById('showLogin');
    if (showLoginButton) showLoginButton.addEventListener('click', showLoginForm);
});