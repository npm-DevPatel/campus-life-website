/* ===========================
   ROUTER
   IST4035 - Campus Life App
   =========================== */

import HomeView from './views/home-view.js';
import LoginView from './views/login-view.js';
import EventsView from './views/events-view.js';
import authService from './services/auth-service.js';
import { renderNavigation, initNavigation } from './components/navigation.js';

/**
 * Simple hash-based router
 */

class Router {
    constructor() {
        this.routes = {};
        this.currentView = null;
        this.mainContent = null;
    }

    /**
     * Initialize router
     */
    init() {
        this.mainContent = document.getElementById('app');
        
        if (!this.mainContent) {
            console.error('Main content element (#app) not found');
            return;
        }

        this.registerRoutes();
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRoute());
        
        // Listen for auth state changes
        authService.onAuthStateChange(() => {
            this.refreshNavigation();
        });
        
        // Handle initial route
        this.handleRoute();
    }

    /**
     * Register all application routes
     */
    registerRoutes() {
        this.routes = {
            '': {
                view: HomeView,
                requiresAuth: false
            },
            'home': {
                view: HomeView,
                requiresAuth: false
            },
            'login': {
                view: LoginView,
                requiresAuth: false
            },
            'events': {
                view: EventsView,
                requiresAuth: true
            }
        };
    }

    /**
     * Handle route change
     */
    async handleRoute() {
        const hash = window.location.hash.slice(1) || 'home'; // Changed from 'login'
        const route = this.routes[hash];

        if (!route) {
            console.warn(`Route not found: ${hash}`);
            window.location.hash = '#home'; // Changed from '#login'
            return;
        }

        const isAuthenticated = authService.isAuthenticated();
        
        if (route.requiresAuth && !isAuthenticated) {
            console.log('Route requires authentication, redirecting to login');
            window.location.hash = '#login';
            return;
        }

        // If logged in and trying to access login, redirect to home instead
        if (hash === 'login' && isAuthenticated) {
            window.location.hash = '#home'; // Changed from '#events'
            return;
        }

        await this.loadView(route.view);
    }

    /**
     * Load and render view
     */
    async loadView(ViewClass, hideNav = false) {
        try {
            // Clean up previous view
            if (this.currentView && typeof this.currentView.destroy === 'function') {
                this.currentView.destroy();
            }

            // Create view instance
            const view = new ViewClass();
            
            // Render view with or without navigation
            if (this.mainContent) {
                this.mainContent.innerHTML = `
                    ${!hideNav ? renderNavigation() : ''}
                    <div class="view-content">
                        ${view.render()}
                    </div>
                `;
                
                if (!hideNav) {
                    initNavigation();
                }
            }

            // Initialize view if it has init method
            if (typeof view.init === 'function') {
                await view.init();
            }

            // Attach event listeners if method exists
            if (typeof view.attachEventListeners === 'function') {
                view.attachEventListeners();
            }

            this.currentView = view;
            
            // Scroll to top
            window.scrollTo(0, 0);
            
        } catch (error) {
            console.error('Error loading view:', error);
            this.showError();
        }
    }

    /**
     * Refresh navigation without reloading entire view
     */
    refreshNavigation() {
        const nav = document.querySelector('.header');
        if (nav) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = renderNavigation();
            nav.replaceWith(tempDiv.firstElementChild);
            initNavigation();
        }
    }

    /**
     * Show error page
     */
    showError() {
        if (this.mainContent) {
            this.mainContent.innerHTML = `
                <div class="error-container">
                    <h1>Something went wrong</h1>
                    <p>We're sorry, but something unexpected happened.</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        Reload Page
                    </button>
                </div>
            `;
        }
    }
}

// Export singleton instance
const router = new Router();
export default router;