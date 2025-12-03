/* ===========================
   AUTHENTICATION SERVICE
   IST4035 - Campus Life App
   =========================== */

import firebaseConfig from '../config/firebase-config.js';

/**
 * Authentication service using Firebase Auth
 * Handles login, registration, logout, and session management
 */

class AuthService {
    constructor() {
        this.auth = null;
        this.currentUser = null;
        this.authStateListeners = [];
        this.authReady = false;
    }

    /**
     * Initialize Firebase Authentication
     */
    async init() {
        try {
            // Initialize Firebase
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            
            this.auth = firebase.auth();
            
            // CRITICAL FIX: Set default persistence to LOCAL before any auth state changes
            // This ensures the session persists even on page refresh
            await this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
            
            // Wait for auth state to be ready
            return new Promise((resolve) => {
                // Set up auth state observer
                this.auth.onAuthStateChanged((user) => {
                    this.currentUser = user;
                    this.notifyAuthStateChange(user);
                    
                    if (user) {
                        console.log('User authenticated:', user.email);
                        this.saveUserToLocalStorage(user);
                    } else {
                        console.log('User signed out');
                        this.clearUserFromLocalStorage();
                    }
                    
                    // Mark auth as ready on first state change
                    if (!this.authReady) {
                        this.authReady = true;
                        console.log('Firebase Auth initialized and ready');
                        resolve();
                    }
                });
            });
        } catch (error) {
            console.error('Firebase initialization error:', error);
            throw error;
        }
    }

    /**
     * Register new user with email and password
     */
    async register(email, password, displayName) {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Update profile with display name
            await user.updateProfile({
                displayName: displayName
            });
            
            // Create user profile in Firestore
            await this.createUserProfile(user.uid, {
                email: email,
                displayName: displayName,
                createdAt: new Date().toISOString()
            });
            
            return {
                success: true,
                user: user
            };
        } catch (error) {
            return {
                success: false,
                error: this.handleAuthError(error)
            };
        }
    }

    /**
     * Sign in existing user
     */
    async login(email, password, rememberMe = false) {
        try {
            // Set persistence based on "Remember Me" checkbox
            // LOCAL = persistent across browser sessions
            // SESSION = only for current browser session (cleared on close)
            const persistenceType = rememberMe 
                ? firebase.auth.Auth.Persistence.LOCAL 
                : firebase.auth.Auth.Persistence.SESSION;
            
            await this.auth.setPersistence(persistenceType);
            
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            
            console.log('Login successful with persistence:', rememberMe ? 'LOCAL' : 'SESSION');
            
            return {
                success: true,
                user: userCredential.user
            };
        } catch (error) {
            return {
                success: false,
                error: this.handleAuthError(error)
            };
        }
    }

    /**
     * Sign out current user
     */
    async logout() {
        try {
            await this.auth.signOut();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Create user profile in Firestore
     */
    async createUserProfile(uid, userData) {
        try {
            const db = firebase.firestore();
            await db.collection('users').doc(uid).set(userData);
        } catch (error) {
            console.error('Error creating user profile:', error);
        }
    }

    /**
     * Get current authenticated user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Add auth state change listener
     */
    onAuthStateChange(callback) {
        this.authStateListeners.push(callback);
    }

    /**
     * Notify all listeners of auth state change
     */
    notifyAuthStateChange(user) {
        this.authStateListeners.forEach(callback => callback(user));
    }

    /**
     * Save user data to localStorage (for offline access)
     */
    saveUserToLocalStorage(user) {
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            lastLogin: new Date().toISOString()
        };
        localStorage.setItem('campuslife_user', JSON.stringify(userData));
    }

    /**
     * Clear user data from localStorage
     */
    clearUserFromLocalStorage() {
        localStorage.removeItem('campuslife_user');
    }

    /**
     * Handle Firebase auth errors with user-friendly messages
     */
    handleAuthError(error) {
        const errorMessages = {
            'auth/email-already-in-use': 'This email is already registered. Please login instead.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
            'auth/weak-password': 'Password should be at least 6 characters long.',
            'auth/user-disabled': 'This account has been disabled. Please contact support.',
            'auth/user-not-found': 'No account found with this email. Please register first.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your connection.'
        };

        return errorMessages[error.code] || `Authentication error: ${error.message}`;
    }
}

// Export singleton instance
const authService = new AuthService();
export default authService;