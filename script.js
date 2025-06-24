// Funcții de autentificare
async function handleSignup() {
    const email = document.getElementById('email')?.value || '';
    const password = document.getElementById('password')?.value || '';
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
            if (loginResponse.ok) {
                localStorage.setItem('authToken', loginData.token);
                console.log('Token saved after signup');
                updateStatus(loginData.token);
                window.location.href = '/dashboard.html';
            } else {
                showMessage(`Account created, but auto-login failed: ${loginData.error}`, 'error', 'signup');
            }
        } else {
            showMessage(`Signup failed: ${data.error}`, 'error', 'signup');
        }
    } catch (error) {
        showMessage(`Connection error during signup: ${error.message}`, 'error', 'signup');
    }
}

async function handleLogin() {
    const email = document.getElementById('loginEmail')?.value || '';
    const password = document.getElementById('loginPassword')?.value || '';
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
            const errorMessage = data.error.includes('auth/invalid-credential') ? 'Invalid credentials.' : `Login failed: ${data.error}`;
            showMessage(errorMessage, 'error', 'login');
        }
    } catch (error) {
        showMessage(`Connection error during login: ${error.message}`, 'error', 'login');
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
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` }
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
            showMessage(`Logout failed: ${data.error}`, 'error', 'login');
        }
    } catch (error) {
        showMessage(`Connection error during logout: ${error.message}`, 'error', 'login');
    }
}

async function handleResetPassword() {
    const email = document.getElementById('loginEmail')?.value || '';
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
            showMessage(`Password reset failed: ${data.error}`, 'error', 'login');
        }
    } catch (error) {
        showMessage(`Connection error during password reset: ${error.message}`, 'error', 'login');
    }
}

// Funcții de UI
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
        setTimeout(() => { messageDiv.className = `message ${type} hidden`; }, 3000);
    }
}

function updateStatus(token) {
    console.log('Updating state with token:', token ? 'exists' : 'null');
    const authDropdown = document.querySelector('.auth-dropdown');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const authStatus = document.getElementById('authStatus');
    const content = document.querySelector('.content');
    const logoutButton = document.getElementById('logoutButton');
    if (token) {
        if (authDropdown) authDropdown.className = 'auth-dropdown hidden';
        if (showSignup) showSignup.style.display = 'none';
        if (showLogin) showLogin.style.display = 'none';
        if (authStatus) { authStatus.innerHTML = `Hello, ${localStorage.getItem('lastEmail') || 'User'}!`; authStatus.style.display = 'block'; }
        if (logoutButton) logoutButton.style.display = 'inline-block';
        if (content) content.classList.remove('content-shifted');
    } else {
        if (authDropdown) authDropdown.className = 'auth-dropdown hidden';
        if (showSignup) { showSignup.className = 'toggle-button'; showSignup.style.display = 'inline-block'; }
        if (showLogin) { showLogin.className = 'toggle-button active'; showLogin.style.display = 'inline-block'; }
        if (authStatus) { authStatus.textContent = 'You are not logged in.'; authStatus.style.display = 'block'; }
        if (logoutButton) logoutButton.style.display = 'none';
        if (content) content.classList.remove('content-shifted');
    }
}

// Funcționalitate pentru dropdown-uri
function setupCustomDropdowns() {
    const dropdowns = [
        { id: 'trainingGoalDropdown', header: 'trainingGoalHeader', options: 'trainingGoalOptions' },
        { id: 'trainingLevelDropdown', header: 'trainingLevelHeader', options: 'trainingLevelOptions' },
        { id: 'nutritionGoalDropdown', header: 'nutritionGoalHeader', options: 'nutritionGoalOptions' }
    ];

    dropdowns.forEach(dropdown => {
        const elem = document.getElementById(dropdown.id);
        const header = document.getElementById(dropdown.header);
        const options = document.getElementById(dropdown.options);
        if (elem && header && options) {
            header.addEventListener('click', () => {
                options.classList.toggle('visible');
                dropdowns.forEach(d => {
                    if (d.id !== dropdown.id) document.getElementById(d.options)?.classList.remove('visible');
                });
            });
            options.querySelectorAll('.option').forEach(option => {
                option.addEventListener('click', () => {
                    header.textContent = option.textContent;
                    options.classList.remove('visible');
                });
            });
        }
    });

    document.addEventListener('click', (event) => {
        dropdowns.forEach(d => {
            const elem = document.getElementById(d.id);
            if (elem && !elem.contains(event.target)) {
                document.getElementById(d.options)?.classList.remove('visible');
            }
        });
    });
}

// Funcționalitate pentru antrenamente și nutriție
document.getElementById('generatePlan')?.addEventListener('click', async () => {
    const coachPrompt = document.getElementById('coachPrompt')?.value || '';
    const trainingGoalHeader = document.getElementById('trainingGoalHeader')?.textContent.toLowerCase() || 'Alege obiectivul tău...';
    const trainingLevelHeader = document.getElementById('trainingLevelHeader')?.textContent.toLowerCase() || 'Alege nivelul tău...';
    const coachResponse = document.getElementById('coachResponse');
    const authToken = localStorage.getItem('authToken');

    if (trainingGoalHeader === 'Alege obiectivul tău...') {
        if (coachResponse) coachResponse.innerHTML = 'Please select a training objective!';
        return;
    }
    if (trainingLevelHeader === 'Alege nivelul tău...') {
        if (coachResponse) coachResponse.innerHTML = 'Please select a training level!';
        return;
    }

    if (coachResponse) coachResponse.innerHTML = '<div class="ai-coach-spinner"></div> Generating training plan...';

    let language = 'en';
    if (coachPrompt && (coachPrompt.toLowerCase().includes('ajuta') || coachPrompt.toLowerCase().includes('economisesc'))) language = 'ro';
    else if (coachPrompt && (coachPrompt.toLowerCase().includes('save') || coachPrompt.toLowerCase().includes('help'))) language = 'en';
    console.log('Detected language for training plan:', language);

    try {
        const response = await fetch('/api/ai/coach', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
            body: JSON.stringify({ goal: trainingGoalHeader, level: trainingLevelHeader, prompt: coachPrompt, language })
        });
        const data = await response.json();
        if (coachResponse && response.ok) coachResponse.innerHTML = data.plan.replace(/\n/g, '<br>');
        else if (coachResponse) coachResponse.innerHTML = `Error generating training plan: ${data.error}`;
    } catch (error) {
        if (coachResponse) coachResponse.innerHTML = `Connection error: ${error.message}`;
    }
});

document.getElementById('generateNutritionPlan')?.addEventListener('click', async () => {
    const customText = document.getElementById('customText')?.value || '';
    const nutritionGoalHeader = document.getElementById('nutritionGoalHeader')?.textContent.toLowerCase() || 'Alege obiectivul tău...';
    const nutritionResponse = document.getElementById('nutritionResponse');
    const authToken = localStorage.getItem('authToken');

    if (nutritionGoalHeader === 'Alege obiectivul tău...') {
        if (nutritionResponse) nutritionResponse.innerHTML = 'Please select a nutrition goal!';
        return;
    }

    if (nutritionResponse) nutritionResponse.innerHTML = '<div class="ai-coach-spinner"></div> Generating nutrition plan...';

    let language = 'en';
    if (customText && (customText.toLowerCase().includes('ajuta') || customText.toLowerCase().includes('economisesc'))) language = 'ro';
    else if (customText && (customText.toLowerCase().includes('save') || customText.toLowerCase().includes('help'))) language = 'en';
    else if (!customText) language = navigator.language.split('-')[0] === 'ro' ? 'ro' : 'en';
    console.log('Detected language for nutrition plan:', language);

    try {
        const response = await fetch('/api/ai/nutrition', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
            body: JSON.stringify({ goal: nutritionGoalHeader, prompt: customText || '', language })
        });
        const data = await response.json();
        if (nutritionResponse && response.ok) nutritionResponse.innerHTML = data.plan.replace(/\n/g, '<br>');
        else if (nutritionResponse) nutritionResponse.innerHTML = `Error generating nutrition plan: ${data.error}`;
    } catch (error) {
        if (nutritionResponse) nutritionResponse.innerHTML = `Connection error: ${error.message}`;
    }
});

document.getElementById('getStarted')?.addEventListener('click', () => {
    console.log('Get Started clicked');
    showSignupForm();
});

// Inițializare
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

    if (signupMessageDiv) signupMessageDiv.className = 'message hidden';
    if (loginMessageDiv) loginMessageDiv.className = 'message hidden';

    const logoutMessage = localStorage.getItem('logoutMessage');
    if (logoutMessage) {
        const { text, type } = JSON.parse(logoutMessage);
        showMessage(text, type, 'login');
        localStorage.removeItem('logoutMessage');
    }

    console.log('Initial token on load:', authToken ? 'exists' : 'null');
    updateStatus(authToken);

    if (window.location.pathname.includes('dashboard.html') && !authToken) window.location.href = '/';

    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop) navbar.style.top = '-80px';
        else navbar.style.top = '0';
        if (scrollTop > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });

    document.addEventListener('click', (event) => {
        const isClickInside = authDropdown && (authDropdown.contains(event.target) || showSignup.contains(event.target) || showLogin.contains(event.target));
        const content = document.querySelector('.content');
        if (!isClickInside && authDropdown && authDropdown.classList.contains('visible') && content) {
            authDropdown.className = 'auth-dropdown hidden';
            content.classList.remove('content-shifted');
        }
    });

    document.getElementById('signupButton')?.addEventListener('click', handleSignup);
    document.getElementById('loginButton')?.addEventListener('click', (event) => { event.preventDefault(); handleLogin(); });
    document.getElementById('resetPasswordButton')?.addEventListener('click', handleResetPassword);
    document.getElementById('showSignup')?.addEventListener('click', showSignupForm);
    document.getElementById('showLogin')?.addEventListener('click', showLoginForm);
    document.getElementById('logoutButton')?.addEventListener('click', handleLogout);

    setupCustomDropdowns();
});

// Expunere globale
window.handleSignup = handleSignup;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.handleResetPassword = handleResetPassword;
window.showSignupForm = showSignupForm;
window.showLoginForm = showLoginForm;