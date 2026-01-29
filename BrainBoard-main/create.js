// DOM Elements
const signupForm = document.getElementById('signupForm');
const signupButton = document.getElementById('signupButton');
const successMsg = document.getElementById('successMsg');
const togglePassword = document.getElementById('togglePassword');
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
const passwordField = document.getElementById('password');
const confirmPasswordField = document.getElementById('confirmPassword');
const passwordStrength = document.getElementById('passwordStrength');
const loginLink = document.getElementById('loginLink');

// Form fields
const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName');
const email = document.getElementById('email');
const phone = document.getElementById('phone');
const terms = document.getElementById('terms');
const newsletter = document.getElementById('newsletter');

// Error message elements
const firstNameError = document.getElementById('firstNameError');
const lastNameError = document.getElementById('lastNameError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');
const phoneError = document.getElementById('phoneError');

// Simulated user database (in real app, this would be server-side)
let users = JSON.parse(localStorage.getItem('users')) || [];

// Password toggle functionality
togglePassword.addEventListener('click', function() {
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);
    this.textContent = type === 'password' ? '👁' : '🙈';
});

toggleConfirmPassword.addEventListener('click', function() {
    const type = confirmPasswordField.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPasswordField.setAttribute('type', type);
    this.textContent = type === 'password' ? '👁' : '🙈';
});

// Password strength checker
passwordField.addEventListener('input', function() {
    const password = this.value;
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (password.length > 0) {
        passwordStrength.style.display = 'block';
        
        const strength = calculatePasswordStrength(password);
        strengthFill.className = 'strength-fill ' + strength.level;
        strengthText.textContent = strength.text;
    } else {
        passwordStrength.style.display = 'none';
    }
});

// Calculate password strength
function calculatePasswordStrength(password) {
    let score = 0;
    let feedback = [];
    
    // Length check
    if (password.length >= 8) score++;
    else feedback.push('at least 8 characters');
    
    // Uppercase check
    if (/[A-Z]/.test(password)) score++;
    else feedback.push('uppercase letter');
    
    // Lowercase check
    if (/[a-z]/.test(password)) score++;
    else feedback.push('lowercase letter');
    
    // Number check
    if (/\d/.test(password)) score++;
    else feedback.push('number');
    
    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    else feedback.push('special character');
    
    const levels = [
        { level: 'weak', text: 'Weak - Add ' + feedback.slice(0, 2).join(', ') },
        { level: 'fair', text: 'Fair - Add ' + feedback[0] },
        { level: 'good', text: 'Good - Almost there!' },
        { level: 'strong', text: 'Strong - Great password!' }
    ];
    
    const levelIndex = Math.min(Math.floor(score / 1.25), 3);
    return levels[levelIndex];
}

// Real-time validation
firstName.addEventListener('blur', () => validateField(firstName, firstNameError, 'First name is required'));
lastName.addEventListener('blur', () => validateField(lastName, lastNameError, 'Last name is required'));
email.addEventListener('blur', () => validateEmail());
passwordField.addEventListener('blur', () => validatePassword());
confirmPasswordField.addEventListener('blur', () => validateConfirmPassword());
phone.addEventListener('blur', () => validatePhone());

// Validation functions
function validateField(field, errorElement, message) {
    if (field.value.trim() === '') {
        showError(field, errorElement, message);
        return false;
    } else {
        showSuccess(field, errorElement);
        return true;
    }
}

function validateEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailValue = email.value.trim();
    
    if (emailValue === '') {
        showError(email, emailError, 'Email is required');
        return false;
    } else if (!emailRegex.test(emailValue)) {
        showError(email, emailError, 'Please enter a valid email address');
        return false;
    } else if (isEmailTaken(emailValue)) {
        showError(email, emailError, 'This email is already registered');
        return false;
    } else {
        showSuccess(email, emailError);
        return true;
    }
}

function validatePassword() {
    const password = passwordField.value;
    
    if (password.length < 8) {
        showError(passwordField, passwordError, 'Password must be at least 8 characters long');
        return false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        showError(passwordField, passwordError, 'Password must contain uppercase, lowercase, and number');
        return false;
    } else {
        showSuccess(passwordField, passwordError);
        return true;
    }
}

function validateConfirmPassword() {
    const password = passwordField.value;
    const confirmPassword = confirmPasswordField.value;
    
    if (confirmPassword === '') {
        showError(confirmPasswordField, confirmPasswordError, 'Please confirm your password');
        return false;
    } else if (password !== confirmPassword) {
        showError(confirmPasswordField, confirmPasswordError, 'Passwords do not match');
        return false;
    } else {
        showSuccess(confirmPasswordField, confirmPasswordError);
        return true;
    }
}

function validatePhone() {
    const phoneValue = phone.value.trim();
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    
    if (phoneValue === '') {
        showSuccess(phone, phoneError); // Phone is optional
        return true;
    } else if (!phoneRegex.test(phoneValue.replace(/[\s\-\(\)]/g, ''))) {
        showError(phone, phoneError, 'Please enter a valid phone number');
        return false;
    } else {
        showSuccess(phone, phoneError);
        return true;
    }
}

function showError(field, errorElement, message) {
    field.classList.add('error');
    field.classList.remove('success');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function showSuccess(field, errorElement) {
    field.classList.remove('error');
    field.classList.add('success');
    errorElement.style.display = 'none';
}

function isEmailTaken(email) {
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
}

// Form submission
signupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate all fields
    const isFirstNameValid = validateField(firstName, firstNameError, 'First name is required');
    const isLastNameValid = validateField(lastName, lastNameError, 'Last name is required');
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();
    const isPhoneValid = validatePhone();
    const isTermsChecked = terms.checked;
    
    if (!isTermsChecked) {
        alert('Please accept the Terms of Service and Privacy Policy');
        return;
    }
    
    // Check if all validations pass
    if (isFirstNameValid && isLastNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid && isPhoneValid) {
        // Show loading state
        signupButton.classList.add('loading');
        signupButton.disabled = true;
        
        // Simulate API call delay
        setTimeout(() => {
            // Create new user object
            const newUser = {
                id: Date.now(),
                firstName: firstName.value.trim(),
                lastName: lastName.value.trim(),
                email: email.value.trim().toLowerCase(),
                phone: phone.value.trim(),
                newsletter: newsletter.checked,
                createdAt: new Date().toISOString()
            };
            
            // Add user to database
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Store current user data for welcome message
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            localStorage.setItem('isNewUser', 'true');
            
            // Show success message
            successMsg.innerHTML = `✅ Welcome ${newUser.firstName}! Your account has been created successfully!`;
            successMsg.style.display = 'block';
            signupForm.style.display = 'none';
            
            // Reset loading state
            signupButton.classList.remove('loading');
            signupButton.disabled = false;
            
            // Log success
            console.log('Account created successfully:', newUser);
            
            // Redirect to interface.html after showing welcome message
            setTimeout(() => {
                window.location.href = 'interface.html';
            }, 2000);
            
        }, 2000);
    } else {
        // Shake the form to indicate error
        signupForm.classList.add('shake');
        setTimeout(() => signupForm.classList.remove('shake'), 500);
    }
});

// Login link handler
loginLink.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = 'login.html';
});

// Prevent form submission on Enter key in specific fields
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.type !== 'submit') {
        const form = e.target.closest('form');
        if (form) {
            e.preventDefault();
            const inputs = Array.from(form.querySelectorAll('input[required]'));
            const currentIndex = inputs.indexOf(e.target);
            const nextInput = inputs[currentIndex + 1];
            if (nextInput) {
                nextInput.focus();
            }
        }
    }
});

// Auto-format phone number
phone.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 10) {
        value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (value.length >= 6) {
        value = value.replace(/(\d{3})(\d{3})/, '($1) $2-');
    } else if (value.length >= 3) {
        value = value.replace(/(\d{3})/, '($1) ');
    }
    e.target.value = value;
});

// Initialize form
document.addEventListener('DOMContentLoaded', function() {
    // Focus on first input
    firstName.focus();
    
    // Log existing users (for debugging)
    console.log('Existing users:', users.length);
});