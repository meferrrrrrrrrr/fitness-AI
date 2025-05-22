document.addEventListener('DOMContentLoaded', () => {
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

    async function handleLogout() {
      const messageDiv = document.getElementById('message');

      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();

        if (response.ok) {
          messageDiv.textContent = data.message;
          messageDiv.className = 'message success visible';
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
        messageDiv.textContent = 'Eroare la deconectare: ' + error.message;
        messageDiv.className = 'message error visible';
        setTimeout(() => {
          messageDiv.className = 'message error hidden';
        }, 3000);
      }
    }

    function showSignupForm() {
      const signupForm = document.getElementById('signupForm');
      const loginForm = document.getElementById('loginForm');
      const showSignup = document.getElementById('showSignup');
      const showLogin = document.getElementById('showLogin');
      signupForm.className = 'form-container visible';
      loginForm.className = 'form-container hidden';
      showSignup.className = 'toggle-button active';
      showLogin.className = 'toggle-button';
    }

    function showLoginForm() {
      const signupForm = document.getElementById('signupForm');
      const loginForm = document.getElementById('loginForm');
      const showSignup = document.getElementById('showSignup');
      const showLogin = document.getElementById('showLogin');
      signupForm.className = 'form-container hidden';
      loginForm.className = 'form-container visible';
      showSignup.className = 'toggle-button';
      showLogin.className = 'toggle-button active';
    }

    // Expunem funcțiile global pentru a fi apelate din HTML
    window.handleSignup = handleSignup;
    window.handleLogin = handleLogin;
    window.handleLogout = handleLogout;
    window.showSignupForm = showSignupForm;
    window.showLoginForm = showLoginForm;

    // Adăugăm manual event listeneri pentru butoane
    const signupButton = document.querySelector('#signupForm button');
    const loginButton = document.querySelector('#loginForm button');
    const logoutButton = document.getElementById('logoutButton');
    const showSignupButton = document.getElementById('showSignup');
    const showLoginButton = document.getElementById('showLogin');

    if (signupButton) {
      signupButton.addEventListener('click', handleSignup);
    } else {
      console.error('Butonul de signup nu a fost găsit!');
    }

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

    if (showSignupButton) {
      showSignupButton.addEventListener('click', showSignupForm);
    } else {
      console.error('Butonul de afișare signup nu a fost găsit!');
    }

    if (showLoginButton) {
      showLoginButton.addEventListener('click', showLoginForm);
    } else {
      console.error('Butonul de afișare login nu a fost găsit!');
    }
  });