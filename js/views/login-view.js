/* ===========================
   LOGIN VIEW
   IST4035 - Campus Life App
   =========================== */

import authService from '../services/auth-service.js';

/**
 * Login and Registration View
 * Handles authentication UI and user interactions
 */

class LoginView {
    constructor() {
        this.isLoginMode = true;
    }

    /**
     * Render login/registration page
     */
    render() {
        return `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <div class="auth-logo">🏫</div>
                        <h1 class="auth-title">Campus Life</h1>
                        <p class="auth-subtitle">Your University Hub</p>
                    </div>

                    <!-- Toggle Buttons -->
                    <div class="auth-toggle">
                        <button 
                            class="auth-toggle-btn active" 
                            data-mode="login"
                            id="loginToggle">
                            Login
                        </button>
                        <button 
                            class="auth-toggle-btn" 
                            data-mode="register"
                            id="registerToggle">
                            Register
                        </button>
                    </div>

                    <!-- Login Form -->
                    <form class="auth-form" id="loginForm">
                        <div class="form-group">
                            <label for="loginEmail" class="form-label">
                                Email Address
                            </label>
                            <input 
                                type="email" 
                                id="loginEmail" 
                                class="form-input"
                                placeholder="you@university.edu"
                                required
                                autocomplete="email">
                        </div>

                        <div class="form-group">
                            <label for="loginPassword" class="form-label">
                                Password
                            </label>
                            <input 
                                type="password" 
                                id="loginPassword" 
                                class="form-input"
                                placeholder="••••••••"
                                required
                                autocomplete="current-password"
                                minlength="6">
                        </div>

                        <div class="form-footer">
                            <label class="checkbox-label">
                                <input type="checkbox" id="rememberMe">
                                <span>Remember me</span>
                            </label>
                        </div>

                        <button type="submit" class="btn btn-primary btn-block" id="loginBtn">
                            <span class="btn-text">Sign In</span>
                            <span class="btn-loader hidden"></span>
                        </button>

                        <div class="auth-message hidden" id="loginMessage"></div>
                    </form>

                    <!-- Register Form -->
                    <form class="auth-form hidden" id="registerForm">
                        <div class="form-group">
                            <label for="registerName" class="form-label">
                                Full Name
                            </label>
                            <input 
                                type="text" 
                                id="registerName" 
                                class="form-input"
                                placeholder="John Doe"
                                required
                                autocomplete="name">
                        </div>

                        <div class="form-group">
                            <label for="registerEmail" class="form-label">
                                Email Address
                            </label>
                            <input 
                                type="email" 
                                id="registerEmail" 
                                class="form-input"
                                placeholder="you@university.edu"
                                required
                                autocomplete="email">
                        </div>

                        <div class="form-group">
                            <label for="registerPassword" class="form-label">
                                Password
                            </label>
                            <input 
                                type="password" 
                                id="registerPassword" 
                                class="form-input"
                                placeholder="••••••••"
                                required
                                autocomplete="new-password"
                                minlength="6">
                            <small class="form-hint">At least 6 characters</small>
                        </div>

                        <div class="form-group">
                            <label for="registerConfirmPassword" class="form-label">
                                Confirm Password
                            </label>
                            <input 
                                type="password" 
                                id="registerConfirmPassword" 
                                class="form-input"
                                placeholder="••••••••"
                                required
                                autocomplete="new-password"
                                minlength="6">
                        </div>

                        <button type="submit" class="btn btn-primary btn-block" id="registerBtn">
                            <span class="btn-text">Create Account</span>
                            <span class="btn-loader hidden"></span>
                        </button>

                        <div class="auth-message hidden" id="registerMessage"></div>
                    </form>
                </div>
            </div>
        `;
    }

    /**
     * Initialize event listeners
     */
    attachEventListeners() {
        // Toggle between login and register
        document.getElementById('loginToggle')?.addEventListener('click', () => {
            this.switchMode('login');
        });

        document.getElementById('registerToggle')?.addEventListener('click', () => {
            this.switchMode('register');
        });

        // Login form submission
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Register form submission
        document.getElementById('registerForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
    }

    /**
     * Switch between login and register modes
     */
    switchMode(mode) {
        this.isLoginMode = mode === 'login';
        
        const loginToggle = document.getElementById('loginToggle');
        const registerToggle = document.getElementById('registerToggle');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (this.isLoginMode) {
            loginToggle.classList.add('active');
            registerToggle.classList.remove('active');
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        } else {
            loginToggle.classList.remove('active');
            registerToggle.classList.add('active');
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
        }

        // Clear messages
        this.clearMessages();
    }

    /**
     * Handle login submission
     */
    async handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const btn = document.getElementById('loginBtn');
        const messageEl = document.getElementById('loginMessage');

        // Validate inputs
        if (!this.validateEmail(email)) {
            this.showMessage(messageEl, 'Please enter a valid email address', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage(messageEl, 'Password must be at least 6 characters', 'error');
            return;
        }

        // Show loading state
        this.setLoadingState(btn, true);
        this.clearMessages();

        try {
            const result = await authService.login(email, password);

            if (result.success) {
                    this.showMessage(messageEl, 'Login successful! Redirecting...', 'success');    
                   // Redirect to home page after short delay
                    setTimeout(() => {
                    window.location.hash = '#home'; // Changed from '#events'
                }, 1000);
            } else {
                this.showMessage(messageEl, result.error, 'error');
            }
        } catch (error) {
            this.showMessage(messageEl, 'An unexpected error occurred', 'error');
            console.error('Login error:', error);
        } finally {
            this.setLoadingState(btn, false);
        }
    }

    /**
     * Handle registration submission
     */
    async handleRegister() {
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const btn = document.getElementById('registerBtn');
        const messageEl = document.getElementById('registerMessage');

        // Validate inputs
        if (!name) {
            this.showMessage(messageEl, 'Please enter your full name', 'error');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showMessage(messageEl, 'Please enter a valid email address', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage(messageEl, 'Password must be at least 6 characters', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showMessage(messageEl, 'Passwords do not match', 'error');
            return;
        }

        // Show loading state
        this.setLoadingState(btn, true);
        this.clearMessages();

        try {
            const result = await authService.register(email, password, name);

            if (result.success) {
                    this.showMessage(messageEl, 'Account created successfully! Redirecting...', 'success');    
                    // Redirect to home page after short delay
                    setTimeout(() => {
                    window.location.hash = '#home'; // Changed from '#events'
                }, 1000);
            }
            else {
                this.showMessage(messageEl, result.error, 'error');
            }
        } catch (error) {
            this.showMessage(messageEl, 'An unexpected error occurred', 'error');
            console.error('Registration error:', error);
        } finally {
            this.setLoadingState(btn, false);
        }
    }

    /**
     * Validate email format
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Show message to user
     */
    showMessage(element, message, type) {
        if (!element) return;
        
        element.textContent = message;
        element.className = `auth-message auth-message-${type}`;
        element.classList.remove('hidden');
    }

    /**
     * Clear all messages
     */
    clearMessages() {
        document.getElementById('loginMessage')?.classList.add('hidden');
        document.getElementById('registerMessage')?.classList.add('hidden');
    }

    /**
     * Set button loading state
     */
    setLoadingState(button, isLoading) {
        if (!button) return;
        
        const text = button.querySelector('.btn-text');
        const loader = button.querySelector('.btn-loader');
        
        if (isLoading) {
            button.disabled = true;
            text?.classList.add('hidden');
            loader?.classList.remove('hidden');
        } else {
            button.disabled = false;
            text?.classList.remove('hidden');
            loader?.classList.add('hidden');
        }
    }
}

export default LoginView;