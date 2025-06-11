// Funcții globale
async function handleSignup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showMessage('Email and password are required.', 'error', 'signup');
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
            showMessage(data.message, 'success', 'signup');
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
                showMessage('Account created, but auto-login failed: ' + loginData.error, 'error', 'signup');
            }
        } else {
            showMessage(data.error, 'error', 'signup');
        }
    } catch (error) {
        showMessage('Connection error: ' + error.message, 'error', 'signup');
    }
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showMessage('Email and password are required.', 'error', 'login');
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
            showMessage(data.message, 'success', 'login');
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('lastEmail', email);
            console.log('Token saved after login');
            updateStatus(data.token);
            window.location.href = '/dashboard.html';
        } else {
            const errorMessage = data.error.includes('auth/invalid-credential') ? 'Invalid credentials.' : data.error;
            showMessage(errorMessage, 'error', 'login');
        }
    } catch (error) {
        showMessage('Connection error: ' + error.message, 'error', 'login');
    }
}

async function handleLogout() {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        showMessage('You are not logged in.', 'error', 'login');
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
            showMessage(data.error, 'error', 'login');
        }
    } catch (error) {
        showMessage('Logout error: ' + error.message, 'error', 'login');
    }
}

async function handleResetPassword() {
    const email = document.getElementById('loginEmail').value;

    if (!email) {
        showMessage('Email is required.', 'error', 'login');
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
            showMessage(data.message, 'success', 'login');
        } else {
            showMessage(data.error, 'error', 'login');
        }
    } catch (error) {
        showMessage('Connection error: ' + error.message, 'error', 'login');
    }
}

function showSignupForm() {
    const authDropdown = document.querySelector('.auth-dropdown');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const content = document.querySelector('.content');

    if (authDropdown && signupForm && loginForm && showSignup && showLogin && content) {
        authDropdown.className = 'auth-dropdown visible';
        signupForm.className = 'form-container visible';
        loginForm.className = 'form-container hidden';
        showSignup.className = 'toggle-button active';
        showLogin.className = 'toggle-button';
        content.classList.add('content-shifted');
    }
}

function showLoginForm() {
    const authDropdown = document.querySelector('.auth-dropdown');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const content = document.querySelector('.content');

    if (authDropdown && signupForm && loginForm && showSignup && showLogin && content) {
        authDropdown.className = 'auth-dropdown visible';
        loginForm.className = 'form-container visible';
        signupForm.className = 'form-container hidden';
        showLogin.className = 'toggle-button active';
        showSignup.className = 'toggle-button';
        content.classList.add('content-shifted');
    }
}

function showMessage(text, type, formType) {
    const messageDiv = document.getElementById(formType === 'signup' ? 'signupMessage' : 'loginMessage');
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
    const content = document.querySelector('.content');

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
        if (content) content.classList.remove('content-shifted');
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
        if (content) content.classList.remove('content-shifted');
    }
}

// Funcționalitate pentru dropdown-urile personalizate
function setupDropdowns() {
    const themeDropdown = document.getElementById('memeThemeDropdown');
    const styleDropdown = document.getElementById('memeStyleDropdown');
    const moodDropdown = document.getElementById('moodDropdown');

    if (themeDropdown && styleDropdown && moodDropdown) {
        const themeHeader = document.getElementById('memeThemeHeader');
        const themeOptions = document.getElementById('memeThemeOptions');
        const styleHeader = document.getElementById('memeStyleHeader');
        const styleOptions = document.getElementById('memeStyleOptions');
        const moodHeader = document.getElementById('moodHeader');
        const moodOptions = document.getElementById('moodOptions');

        // Gestionare click pe header pentru a afișa/opri opțiunile
        themeHeader.addEventListener('click', () => {
            themeOptions.classList.toggle('visible');
            styleOptions.classList.remove('visible');
            moodOptions.classList.remove('visible');
        });

        styleHeader.addEventListener('click', () => {
            styleOptions.classList.toggle('visible');
            themeOptions.classList.remove('visible');
            moodOptions.classList.remove('visible');
        });

        moodHeader.addEventListener('click', () => {
            moodOptions.classList.toggle('visible');
            themeOptions.classList.remove('visible');
            styleOptions.classList.remove('visible');
        });

        // Gestionare selectare opțiune
        [themeOptions, styleOptions, moodOptions].forEach(options => {
            options.querySelectorAll('.option').forEach(option => {
                option.addEventListener('click', () => {
                    const header = option.closest('.custom-dropdown').querySelector('.dropdown-header');
                    header.textContent = option.textContent;
                    options.classList.remove('visible');
                });
            });
        });

        // Închide dropdown-urile la click în afara lor
        document.addEventListener('click', (event) => {
            if (!themeDropdown.contains(event.target) && !styleDropdown.contains(event.target) && !moodDropdown.contains(event.target)) {
                themeOptions.classList.remove('visible');
                styleOptions.classList.remove('visible');
                moodOptions.classList.remove('visible');
            }
        });
    }
}

// Funcționalitate pentru AI Coach
document.getElementById('generatePlan')?.addEventListener('click', async () => {
    const coachPrompt = document.getElementById('coachPrompt').value;
    const moodHeader = document.getElementById('moodHeader');
    const coachResponse = document.getElementById('coachResponse');
    const authToken = localStorage.getItem('authToken');

    const mood = moodHeader.textContent.toLowerCase();
    if (!coachPrompt && mood === 'select your mood...') {
        coachResponse.innerHTML = 'Please enter a goal or select a mood!';
        return;
    }

    try {
        const response = await fetch('/api/ai/coach', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ mood, prompt: coachPrompt })
        });
        const data = await response.json();
        if (response.ok) {
            coachResponse.innerHTML = data.plan.replace(/\n/g, '<br>');
        } else {
            coachResponse.innerHTML = `Error: ${data.error}`;
        }
    } catch (error) {
        coachResponse.innerHTML = `Connection error: ${error.message}`;
    }
});

// Event Listener principal
document.addEventListener('DOMContentLoaded', () => {
    const authToken = localStorage.getItem('authToken');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const authDropdown = document.querySelector('.auth-dropdown');
    const signupMessageDiv = document.getElementById('signupMessage');
    const loginMessageDiv = document.getElementById('loginMessage');
    const authStatus = document.getElementById('authStatus');
    const navbar = document.querySelector('.navbar');

    // Reset messages on load
    if (signupMessageDiv) signupMessageDiv.className = 'message hidden';
    if (loginMessageDiv) loginMessageDiv.className = 'message hidden';

    // Afișăm mesajul de logout (dacă există)
    const logoutMessage = localStorage.getItem('logoutMessage');
    if (logoutMessage) {
        const { text, type } = JSON.parse(logoutMessage);
        showMessage(text, type, 'login');
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
    let lastScrollTop = 0;
    window.addEventListener('scroll', function () {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop) {
            navbar.style.top = '-80px';
        } else {
            navbar.style.top = '0';
        }
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScrollTop = scrollTop;
    });

    // Close dropdown when clicking outside and reset content position
    document.addEventListener('click', (event) => {
        const isClickInside = authDropdown && (authDropdown.contains(event.target) || showSignup.contains(event.target) || showLogin.contains(event.target));
        const content = document.querySelector('.content');
        if (!isClickInside && authDropdown && authDropdown.classList.contains('visible') && content) {
            authDropdown.className = 'auth-dropdown hidden';
            content.classList.remove('content-shifted');
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

    // Inițializare dropdown-uri
    setupDropdowns();
});

// Expunem funcțiile pe window
window.handleSignup = handleSignup;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.handleResetPassword = handleResetPassword;
window.showSignupForm = showSignupForm;
window.showLoginForm = showLoginForm;