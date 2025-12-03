/* ===========================
   APPLICATION ENTRY POINT
   IST4035 - Campus Life App
   =========================== */

import authService from './services/auth-service.js';
import eventsService from './services/events-service.js';
import router from './router.js';
import bookingsService from './services/bookings-service.js'; // Add this line
import clubsService from './services/clubs-service.js';

/**
 * Main application initialization
 */

class App {
    constructor() {
        this.initialized = false;
    }

    /**
     * Initialize application
     */
async init() {
    try {
        console.log('%c Campus Life App ', 
                    'background: #1e40af; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold;');
        console.log('Initializing application...');

        // Initialize Firebase services
        await authService.init();
        eventsService.init();
        clubsService.init();
        bookingsService.init(); // Add this line

        // Initialize router
        router.init();

        // Set up auth state observer
        authService.onAuthStateChange((user) => {
            this.handleAuthStateChange(user);
        });

        this.initialized = true;
        console.log('✓ Application initialized successfully');

    } catch (error) {
        console.error('Failed to initialize application:', error);
        this.showInitError();
    }
}

    /**
     * Handle authentication state changes
     */
    handleAuthStateChange(user) {
        if (user) {
            console.log('User logged in:', user.email);
            
            // Update UI if needed
            this.updateUserUI(user);
        } else {
            console.log('User logged out');
        }
    }

    /**
     * Update UI based on user state
     */
    updateUserUI(user) {
        // Update navigation or header if needed
        const userInfo = document.querySelector('.user-info');
        if (userInfo) {
            userInfo.querySelector('.user-welcome').textContent = 
                `Welcome, ${user.displayName || user.email}`;
        }
    }

    /**
     * Show initialization error
     */
    showInitError() {
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = `
                <div class="error-container">
                    <div class="error-icon">⚠️</div>
                    <h1>Initialization Error</h1>
                    <p>Failed to initialize the application. Please check your configuration.</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        Retry
                    </button>
                </div>
            `;
        }
    }
}

// Create and initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});

// Export for potential external use
export default App;