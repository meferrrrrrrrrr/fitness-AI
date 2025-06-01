// Funcții globale
async function handleSignup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showMessage('Email and password are required.', 'error');
        return;
    }

    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        console.log('Signup response:', data);

        if (response.ok) {
            showMessage(data.message, 'success');
            localStorage.setItem('lastEmail', email);
            const loginResponse = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const loginData = await loginResponse.json();
            console.log('Auto-login response after signup:', loginData);
            if (loginResponse.ok) {
                localStorage.setItem('authToken', loginData.token);
                console.log('Token saved after signup');
                updateStatus(loginData.token);
                window.location.href = '/dashboard.html';
            } else {
                showMessage('Account created, but auto-login failed: ' + loginData.error, 'error');
            }
        } else {
            showMessage(data.error, 'error');
        }
    } catch (error) {
        showMessage('Connection error: ' + error.message, 'error');
    }
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showMessage('Email and password are required.', 'error');
        return;
    }

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        console.log('Login response:', data);

        if (response.ok) {
            showMessage(data.message, 'success');
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('lastEmail', email);
            console.log('Token saved after login');
            updateStatus(data.token);
            window.location.href = '/dashboard.html';
        } else {
            // Personalizăm mesajul de eroare pentru login
            const errorMessage = data.error.includes('auth/invalid-credential') ? 'Invalid credentials.' : data.error;
            showMessage(errorMessage, 'error');
        }
    } catch (error) {
        showMessage('Connection error: ' + error.message, 'error');
    }
}

async function handleLogout() {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        showMessage('You are not logged in.', 'error');
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
        console.log('Logout response:', data);

        if (response.ok) {
            localStorage.setItem('logoutMessage', JSON.stringify({ text: data.message, type: 'success' }));
            localStorage.removeItem('authToken');
            localStorage.removeItem('lastEmail');
            console.log('Token cleared after logout');
            updateStatus(null);
            window.location.href = '/';
        } else {
            showMessage(data.error, 'error');
        }
    } catch (error) {
        showMessage('Logout error: ' + error.message, 'error');
    }
}

async function handleResetPassword() {
    const email = document.getElementById('loginEmail').value;

    if (!email) {
        showMessage('Email is required.', 'error');
        return;
    }

    try {
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        console.log('Reset password response:', data);

        if (response.ok) {
            showMessage(data.message, 'success');
        } else {
            showMessage(data.error, 'error');
        }
    } catch (error) {
        showMessage('Connection error: ' + error.message, 'error');
    }
}

function showSignupForm() {
    const authDropdown = document.querySelector('.auth-dropdown');
    if (authDropdown) authDropdown.className = 'auth-dropdown visible';
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    if (signupForm) signupForm.className = 'form-container visible';
    if (loginForm) loginForm.className = 'form-container hidden';
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    if (showSignup) showSignup.className = 'toggle-button active';
    if (showLogin) showLogin.className = 'toggle-button';
}

function showLoginForm() {
    const authDropdown = document.querySelector('.auth-dropdown');
    if (authDropdown) authDropdown.className = 'auth-dropdown visible';
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    if (signupForm) signupForm.className = 'form-container hidden';
    if (loginForm) loginForm.className = 'form-container visible';
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    if (showSignup) showSignup.className = 'toggle-button';
    if (showLogin) showLogin.className = 'toggle-button active';
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type} visible`;
        setTimeout(() => {
            if (messageDiv) messageDiv.className = `message ${type} hidden`;
        }, 3000);
    }
}

function updateStatus(token) {
    console.log('Updating state with token:', token ? 'exists' : 'null');
    const authDropdown = document.querySelector('.auth-dropdown');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const authStatus = document.getElementById('authStatus');

    if (token) {
        if (authDropdown) authDropdown.className = 'auth-dropdown hidden';
        if (showSignup) showSignup.style.display = 'none';
        if (showLogin) showLogin.style.display = 'none';
        if (authStatus) {
            authStatus.innerHTML = `Hello, ${localStorage.getItem('lastEmail') || 'User'}! <button id="logoutButton" class="logout-btn">Logout</button>`;
            authStatus.style.display = 'block';
            const logoutButton = document.getElementById('logoutButton');
            if (logoutButton) logoutButton.addEventListener('click', handleLogout);
        }
    } else {
        if (authDropdown) authDropdown.className = 'auth-dropdown hidden';
        if (showSignup) showSignup.className = 'toggle-button';
        if (showLogin) showLogin.className = 'toggle-button active';
        if (showSignup) showSignup.style.display = 'inline-block';
        if (showLogin) showLogin.style.display = 'inline-block';
        if (authStatus) {
            authStatus.textContent = 'You are not logged in.';
            authStatus.style.display = 'block';
        }
    }
}

// Event Listener principal
document.addEventListener('DOMContentLoaded', () => {
    const authToken = localStorage.getItem('authToken');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const authDropdown = document.querySelector('.auth-dropdown');
    const messageDiv = document.getElementById('message');
    const authStatus = document.getElementById('authStatus');
    const navbar = document.querySelector('.navbar');

    // Reset message on load
    if (messageDiv) messageDiv.className = 'message hidden';

    // Afișăm mesajul de logout (dacă există)
    const logoutMessage = localStorage.getItem('logoutMessage');
    if (logoutMessage) {
        const { text, type } = JSON.parse(logoutMessage);
        showMessage(text, type);
        localStorage.removeItem('logoutMessage');
    }

    // Initialize state
    console.log('Initial token on load:', authToken ? 'exists' : 'null');
    updateStatus(authToken);

    // Protecție pentru dashboard.html
    if (window.location.pathname.includes('dashboard.html') && !authToken) {
        window.location.href = '/';
    }

    // Logic for navbar scroll behavior
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > lastScroll && currentScroll > 100) {
            if (navbar) navbar.classList.add('hidden');
        } else {
            if (navbar) navbar.classList.remove('hidden');
        }
        lastScroll = currentScroll;
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        const isClickInside = authDropdown && (authDropdown.contains(event.target) || showSignup.contains(event.target) || showLogin.contains(event.target));
        if (!isClickInside && authDropdown && authDropdown.classList.contains('visible')) {
            authDropdown.className = 'auth-dropdown hidden';
        }
    });

    // Event listeners
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

    const dashboardLogoutButton = document.getElementById('logoutButton');
    if (dashboardLogoutButton) dashboardLogoutButton.addEventListener('click', handleLogout);
});

// Expunem funcțiile pe window
window.handleSignup = handleSignup;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.handleResetPassword = handleResetPassword;
window.showSignupForm = showSignupForm;
window.showLoginForm = showLoginForm;