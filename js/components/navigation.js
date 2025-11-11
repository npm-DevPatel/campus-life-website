/* ===========================
   NAVIGATION COMPONENT
   IST4035 - Campus Life App
   =========================== */

import authService from '../services/auth-service.js';

/**
 * Navigation header component
 */

export function renderNavigation() {
    const user = authService.getCurrentUser();
    const currentHash = window.location.hash.slice(1) || 'home';
    
    return `
        <header class="header" role="banner">
            <div class="header-container">
                <a href="#home" class="logo" aria-label="Campus Life Home">
                    🏫 Campus Life
                </a>
                
                <button 
                    class="menu-toggle" 
                    aria-label="Toggle navigation menu"
                    aria-expanded="false"
                    aria-controls="main-nav"
                    id="menuToggle"
                    type="button">
                    ☰ Menu
                </button>
                
                <nav class="nav" id="main-nav" aria-label="Main navigation">
                    <ul class="nav-list" role="list">
                        <li><a href="#home" class="nav-link ${currentHash === 'home' || currentHash === '' ? 'active' : ''}">Home</a></li>
                        
                        ${user ? `
                            <li><a href="#events" class="nav-link ${currentHash === 'events' ? 'active' : ''}">Events</a></li>
                            <li><a href="#clubs" class="nav-link ${currentHash === 'clubs' ? 'active' : ''}" title="Coming soon">Clubs</a></li>
                            <li><a href="#bookings" class="nav-link ${currentHash === 'bookings' ? 'active' : ''}" title="Coming soon">Bookings</a></li>
                            <li><a href="#helpdesk" class="nav-link ${currentHash === 'helpdesk' ? 'active' : ''}" title="Coming soon">Help</a></li>
                            
                            <li class="nav-divider"></li>
                            
                            <li class="user-status">
                                <span class="user-indicator">🟢</span>
                                <span class="user-name">${user.displayName || user.email.split('@')[0]}</span>
                            </li>
                            
                            <li><button class="nav-link nav-logout" id="navLogout">Logout</button></li>
                        ` : `
                            <li><a href="#login" class="nav-link nav-login ${currentHash === 'login' ? 'active' : ''}">Login / Register</a></li>
                        `}
                    </ul>
                </nav>
            </div>
        </header>
    `;
}

export function initNavigation() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('main-nav');
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            const isOpen = nav.classList.contains('is-open');
            nav.classList.toggle('is-open');
            menuToggle.setAttribute('aria-expanded', !isOpen);
            menuToggle.textContent = isOpen ? '☰ Menu' : '✕ Close';
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('navLogout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            const confirmLogout = confirm('Are you sure you want to logout?');
            if (confirmLogout) {
                await authService.logout();
                window.location.hash = '#home';
                
                // Show toast notification
                showToast('Logged out successfully', 'info');
            }
        });
    }
    
    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 768 && nav) {
                nav.classList.remove('is-open');
                if (menuToggle) {
                    menuToggle.setAttribute('aria-expanded', 'false');
                    menuToggle.textContent = '☰ Menu';
                }
            }
        });
    });
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}