const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('loginButton');
const togglePassword = document.getElementById('togglePassword');
const successMsg = document.getElementById('successMsg');

// Demo credentials
const DEMO_EMAIL = 'demo@example.com';
const DEMO_PASSWORD = 'password123';

// Toggle password visibility
togglePassword.addEventListener('click', function () {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    this.textContent = type === 'password' ? '🙈' : '🙉';
});

// Validation functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showError(field, show) {
    const input = document.getElementById(field);
    const error = document.getElementById(field + 'Error');

    if (show) {
        input.classList.add('error');
        error.classList.add('show');
    } else {
        input.classList.remove('error');
        error.classList.remove('show');
    }
}

// Clear errors on input
emailInput.addEventListener('input', () => showError('email', false));
passwordInput.addEventListener('input', () => showError('password', false));

// Form submission
form.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    let isValid = true;

    // Validate email
    if (!email || !validateEmail(email)) {
        showError('email', true);
        isValid = false;
    }

    // Validate password
    if (!password || password.length < 6) {
        showError('password', true);
        isValid = false;
    }

    if (!isValid) return;

    // Show loading
    loginButton.classList.add('loading');
    loginButton.disabled = true;

    // Simulate login process
    setTimeout(() => {
       if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        localStorage.setItem('isAuthenticated', 'true'); // <--- Store auth state
        successMsg.style.display = 'block';
        form.style.opacity = '0.5';

        setTimeout(() => {
            window.location.href = 'interface.html';
        }, 2000);
    } else {
            // Failed login
            showError('password', true);
            document.getElementById('passwordError').textContent =
                'Invalid email or password';
            loginButton.classList.remove('loading');
            loginButton.disabled = false;
        }
    }, 1500);
});

// Add some placeholder text after a delay
setTimeout(() => {
    if (!emailInput.value) {
        emailInput.placeholder = 'Enter your email address';
        passwordInput.placeholder = 'Enter your password';
    }
}, 2000);