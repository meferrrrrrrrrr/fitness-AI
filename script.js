async function handleSignup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    if (!email || !password) {
        messageDiv.textContent = 'Email-ul și parola sunt obligatorii.';
        messageDiv.className = 'message error';
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
        return;
    }

    try {
        const response = await fetch('https://fitness-ai-beta.vercel.app/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (response.ok) {
            messageDiv.textContent = data.message;
            messageDiv.className = 'message success';
            messageDiv.style.display = 'block';
            signupForm.style.display = 'none';
            loginForm.style.display = 'block';
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
        } else {
            messageDiv.textContent = data.error;
            messageDiv.className = 'message error';
            messageDiv.style.display = 'block';
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
        }
    } catch (error) {
        messageDiv.textContent = 'Eroare la conectare: ' + error.message;
        messageDiv.className = 'message error';
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const messageDiv = document.getElementById('message');

    if (!email || !password) {
        messageDiv.textContent = 'Email-ul și parola sunt obligatorii.';
        messageDiv.className = 'message error';
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
        return;
    }

    try {
        const response = await fetch('https://fitness-ai-beta.vercel.app/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (response.ok) {
            messageDiv.textContent = data.message;
            messageDiv.className = 'message success';
            messageDiv.style.display = 'block';
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
        } else {
            messageDiv.textContent = data.error;
            messageDiv.className = 'message error';
            messageDiv.style.display = 'block';
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
        }
    } catch (error) {
        messageDiv.textContent = 'Eroare la conectare: ' + error.message;
        messageDiv.className = 'message error';
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }
}