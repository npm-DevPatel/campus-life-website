/* ===========================
   MAIN APPLICATION LOGIC
   IST4035 - Upload 1
   =========================== */

/**
 * Main JavaScript file for Campus Life Web App
 * Handles navigation, localStorage, keyboard interactions
 * 
 * @module main
 */

/* ===========================
   CONSTANTS
   =========================== */

const STORAGE_KEYS = {
    LAST_VISIT: 'campuslife_last_visit',
    USER_PREFERENCES: 'campuslife_preferences'
};

/* ===========================
   MOBILE NAVIGATION
   =========================== */

/**
 * Initializes mobile menu toggle functionality
 * Updates ARIA attributes for accessibility
 * 
 * @function initMobileMenu
 */
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('main-nav');
    
    // Verify elements exist before adding listeners
    if (!menuToggle || !nav) {
        console.warn('Menu toggle or nav element not found');
        return;
    }
    
    /**
     * Toggles menu visibility and updates ARIA states
     * @param {Event} event - Click event
     */
    menuToggle.addEventListener('click', (event) => {
        event.preventDefault();
        
        const isOpen = nav.classList.contains('is-open');
        
        // Toggle menu visibility
        nav.classList.toggle('is-open');
        
        // Update ARIA attributes for screen readers
        menuToggle.setAttribute('aria-expanded', !isOpen);
        
        // Update button text for clarity
        menuToggle.textContent = isOpen ? '☰ Menu' : '✕ Close';
        
        console.log('Mobile menu toggled:', !isOpen ? 'open' : 'closed');
    });
    
    // Close menu when clicking navigation links (mobile only)
    const navLinks = nav.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Only auto-close on mobile viewport
            if (window.innerWidth < 768) {
                nav.classList.remove('is-open');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.textContent = '☰ Menu';
            }
        });
    });
    
    console.log('Mobile menu initialized');
}

/* ===========================
   HTML5 WEB STORAGE API
   =========================== */

/**
 * Demonstrates HTML5 localStorage API
 * Tracks user's last visit and stores preferences
 * 
 * @function initLocalStorage
 */
function initLocalStorage() {
    // Check if Web Storage API is supported
    if (typeof(Storage) === "undefined") {
        console.warn('Web Storage API not supported in this browser');
        return;
    }
    
    try {
        // Retrieve last visit timestamp
        const lastVisit = localStorage.getItem(STORAGE_KEYS.LAST_VISIT);
        
        if (lastVisit) {
            const lastVisitDate = new Date(lastVisit);
            console.log('Welcome back! Last visit:', lastVisitDate.toLocaleString());
            
            // Calculate time since last visit
            const timeSince = Date.now() - lastVisitDate.getTime();
            const daysSince = Math.floor(timeSince / (1000 * 60 * 60 * 24));
            
            if (daysSince > 0) {
                console.log(`You last visited ${daysSince} day(s) ago`);
            }
        } else {
            console.log('Welcome to Campus Life for the first time!');
        }
        
        // Store current visit timestamp
        const currentVisit = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.LAST_VISIT, currentVisit);
        
        // Store user preferences (example for future use)
        const defaultPreferences = {
            theme: 'light',
            notifications: true,
            language: 'en'
        };
        
        // Only set if preferences don't exist
        if (!localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)) {
            localStorage.setItem(
                STORAGE_KEYS.USER_PREFERENCES, 
                JSON.stringify(defaultPreferences)
            );
        }
        
        // Log storage for evidence
        console.log('localStorage demo active:', {
            lastVisit: localStorage.getItem(STORAGE_KEYS.LAST_VISIT),
            preferences: JSON.parse(
                localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES) || '{}'
            )
        });
        
    } catch (error) {
        console.error('localStorage error:', error);
    }
}

/* ===========================
   KEYBOARD NAVIGATION
   =========================== */

/**
 * Enhances keyboard navigation for feature cards
 * Allows Enter and Space keys to activate cards
 * 
 * @function enhanceKeyboardNav
 */
function enhanceKeyboardNav() {
    const cards = document.querySelectorAll('.feature-card');
    
    if (cards.length === 0) {
        console.warn('No feature cards found');
        return;
    }
    
    cards.forEach((card, index) => {
        /**
         * Handles keyboard events on cards
         * @param {KeyboardEvent} event - Keyboard event
         */
        card.addEventListener('keydown', (event) => {
            // Activate card on Enter or Space
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault(); // Prevent page scroll on Space
                
                // Get card title for logging
                const cardTitle = card.querySelector('.feature-title');
                const title = cardTitle ? cardTitle.textContent : `Card ${index + 1}`;
                
                console.log('Card activated via keyboard:', title);
                
                // Trigger click event for consistent behavior
                card.click();
                
                // Visual feedback (optional - can be enhanced with CSS)
                card.style.transform = 'translateY(-2px)';
                setTimeout(() => {
                    card.style.transform = '';
                }, 100);
            }
        });
    });
    
    console.log(`Keyboard navigation enhanced for ${cards.length} cards`);
}

/* ===========================
   ACTIVE NAVIGATION LINK
   =========================== */

/**
 * Updates active navigation link based on current section
 * Prepares for hash-based routing in Upload 2
 * 
 * @function updateActiveNavLink
 */
function updateActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentHash = window.location.hash || '#events';
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        if (href === currentHash) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });
}

/* ===========================
   ACCESSIBILITY HELPERS
   =========================== */

/**
 * Announces page changes to screen readers
 * Uses aria-live region for dynamic content updates
 * 
 * @function announceToScreenReader
 * @param {string} message - Message to announce
 */
function announceToScreenReader(message) {
    // Create or get aria-live region
    let liveRegion = document.getElementById('aria-live-region');
    
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'aria-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
    }
    
    // Update message
    liveRegion.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
        liveRegion.textContent = '';
    }, 1000);
}

/* ===========================
   PERFORMANCE MONITORING
   =========================== */

/**
 * Logs page load performance metrics
 * Prepares for performance optimization in Upload 4
 * 
 * @function logPerformanceMetrics
 */
function logPerformanceMetrics() {
    // Check if Performance API is available
    if (!window.performance || !window.performance.timing) {
        console.warn('Performance API not supported');
        return;
    }
    
    // Wait for page to fully load
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
            
            console.log('Performance Metrics:', {
                pageLoadTime: `${pageLoadTime}ms`,
                domReadyTime: `${domReadyTime}ms`,
                timestamp: new Date().toISOString()
            });
        }, 0);
    });
}

/* ===========================
   INITIALIZATION
   =========================== */

/**
 * Main initialization function
 * Runs when DOM is fully loaded
 * 
 * @function init
 */
function init() {
    console.log('%c Campus Life App - Upload 1 ', 
                'background: #1e40af; color: white; padding: 5px 10px; border-radius: 3px;');
    console.log('Initializing application...');
    
    // Initialize all features
    initMobileMenu();
    initCanvasDemo();
    initLocalStorage();
    enhanceKeyboardNav();
    updateActiveNavLink();
    logPerformanceMetrics();
    
    // Listen for hash changes (preparation for routing in Upload 2)
    window.addEventListener('hashchange', updateActiveNavLink);
    
    // Log accessibility features
    console.log('%c Accessibility Features Active ', 
                'background: #059669; color: white; padding: 5px 10px; border-radius: 3px;');
    console.log('✓ Semantic HTML5 structure');
    console.log('✓ ARIA labels and roles');
    console.log('✓ Keyboard navigation');
    console.log('✓ Focus management');
    console.log('✓ Color contrast compliance (WCAG AA/AAA)');
    console.log('✓ Skip to main content link');
    console.log('✓ Screen reader support');
    
    // Announce initialization to screen readers
    announceToScreenReader('Campus Life application loaded and ready');
    
    console.log('Application initialized successfully');
}

/* ===========================
   DOM READY
   =========================== */

/**
 * Execute initialization when DOM is ready
 * Handles both initial load and dynamic scenarios
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM already loaded
    init();
}

// Export functions for potential module use in Upload 2
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initMobileMenu,
        initLocalStorage,
        enhanceKeyboardNav,
        updateActiveNavLink,
        announceToScreenReader
    };
}