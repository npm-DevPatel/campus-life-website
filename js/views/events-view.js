/* ===========================
   EVENTS VIEW
   IST4035 - Campus Life App
   =========================== */

import eventsService from '../services/events-service.js';
import authService from '../services/auth-service.js';

/**
 * Events listing and detail view
 * Displays campus events with filtering and search
 */

class EventsView {
    constructor() {
        this.events = [];
        this.filteredEvents = [];
        this.selectedCategory = 'all';
        this.searchTerm = '';
        this.searchDebounceTimer = null;
    }

    /**
     * Render events page
     */
    render() {
        const user = authService.getCurrentUser();
        
        return `
            <div class="events-container">
                <!-- Page Header -->
                <header class="page-header">
                    <div class="page-header-content">
                        <h1 class="page-title">Campus Events</h1>
                        <p class="page-subtitle">Discover upcoming activities and workshops</p>
                    </div>
                    ${user ? `
                        <div class="user-info">
                            <span class="user-welcome">Welcome, ${user.displayName || user.email}</span>
                            <button class="btn btn-secondary btn-sm" id="logoutBtn">Logout</button>
                        </div>
                    ` : ''}
                </header>

                <!-- Filters Section -->
                <section class="events-filters">
                    <div class="search-box">
                        <input 
                            type="search" 
                            id="eventSearch" 
                            class="search-input"
                            placeholder="Search events..."
                            aria-label="Search events">
                        <span class="search-icon">🔍</span>
                    </div>

                    <div class="filter-group">
                        <label class="filter-label">Category:</label>
                        <select id="categoryFilter" class="filter-select" aria-label="Filter by category">
                            <option value="all">All Categories</option>
                            <option value="academic">Academic</option>
                            <option value="social">Social</option>
                            <option value="sports">Sports</option>
                            <option value="cultural">Cultural</option>
                            <option value="career">Career</option>
                            <option value="workshop">Workshop</option>
                        </select>
                    </div>

                    <button class="btn btn-secondary" id="clearFiltersBtn">
                        Clear Filters
                    </button>
                </section>

                <!-- Events Grid -->
                <section class="events-section">
                    <div id="eventsGrid" class="events-grid">
                        <!-- Loading state -->
                        <div class="loading-container">
                            <div class="loading-spinner"></div>
                            <p>Loading events...</p>
                        </div>
                    </div>
                </section>

                <!-- Event Detail Modal -->
                <div id="eventModal" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
                    <div class="modal-overlay" id="modalOverlay"></div>
                    <div class="modal-content">
                        <button class="modal-close" id="modalClose" aria-label="Close modal">✕</button>
                        <div id="modalBody">
                            <!-- Dynamic content will be inserted here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Initialize view and load events
     */
    async init() {
        await this.loadEvents();
        this.attachEventListeners();
    }

    /**
     * Load events from Firebase
     */
    async loadEvents() {
        try {
            const result = await eventsService.getEvents();
            
            if (result.success) {
                this.events = result.events;
                this.filteredEvents = [...this.events];
                this.renderEvents();
            } else {
                this.showError('Failed to load events. Please try again later.');
            }
        } catch (error) {
            console.error('Error loading events:', error);
            this.showError('An unexpected error occurred.');
        }
    }

    /**
     * Render events grid
     */
    renderEvents() {
        const grid = document.getElementById('eventsGrid');
        if (!grid) return;

        // Show empty state if no events
        if (this.filteredEvents.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📅</div>
                    <h3>No events found</h3>
                    <p>${this.searchTerm || this.selectedCategory !== 'all' 
                        ? 'Try adjusting your filters' 
                        : 'Check back soon for upcoming events'}</p>
                </div>
            `;
            return;
        }

        // Render event cards
        grid.innerHTML = this.filteredEvents.map(event => this.renderEventCard(event)).join('');

        // Attach click listeners to cards
        grid.querySelectorAll('.event-card').forEach(card => {
            card.addEventListener('click', () => {
                const eventId = card.dataset.eventId;
                this.showEventDetail(eventId);
            });
        });
    }

    /**
     * Render single event card
     */
    renderEventCard(event) {
        const eventDate = new Date(event.date);
        const isUpcoming = eventDate > new Date();
        const formattedDate = this.formatDate(eventDate);
        const categoryColor = this.getCategoryColor(event.category);

        return `
            <article class="event-card" data-event-id="${event.id}" tabindex="0" role="button">
                <div class="event-image" style="background: ${categoryColor};">
                    <span class="event-icon">${this.getCategoryIcon(event.category)}</span>
                </div>
                
                <div class="event-content">
                    <div class="event-meta">
                        <span class="event-category">${event.category}</span>
                        <span class="event-status ${isUpcoming ? 'upcoming' : 'past'}">
                            ${isUpcoming ? 'Upcoming' : 'Past'}
                        </span>
                        </div>
                    
                    <h3 class="event-title">${this.escapeHtml(event.title)}</h3>
                    
                    <p class="event-description">${this.truncateText(this.escapeHtml(event.description), 100)}</p>
                    
                    <div class="event-details">
                        <div class="event-detail-item">
                            <span class="detail-icon">📅</span>
                            <span>${formattedDate}</span>
                        </div>
                        <div class="event-detail-item">
                            <span class="detail-icon">⏰</span>
                            <span>${event.time}</span>
                        </div>
                        <div class="event-detail-item">
                            <span class="detail-icon">📍</span>
                            <span>${this.escapeHtml(event.location)}</span>
                        </div>
                    </div>

                    ${event.registeredUsers?.length > 0 ? `
                        <div class="event-attendees">
                            <span class="attendee-icon">👥</span>
                            <span>${event.registeredUsers.length} registered</span>
                        </div>
                    ` : ''}
                </div>
            </article>
        `;
    }

    /**
     * Show event detail modal
     */
    async showEventDetail(eventId) {
        const modal = document.getElementById('eventModal');
        const modalBody = document.getElementById('modalBody');
        
        if (!modal || !modalBody) return;

        // Find event
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        const user = authService.getCurrentUser();
        const isRegistered = event.registeredUsers?.includes(user?.uid);
        const eventDate = new Date(event.date);
        const isUpcoming = eventDate > new Date();

        // Render modal content
        modalBody.innerHTML = `
            <div class="event-detail">
                <div class="event-detail-header" style="background: ${this.getCategoryColor(event.category)};">
                    <span class="event-detail-icon">${this.getCategoryIcon(event.category)}</span>
                    <span class="event-detail-category">${event.category}</span>
                </div>

                <div class="event-detail-body">
                    <h2 id="modalTitle" class="event-detail-title">${this.escapeHtml(event.title)}</h2>
                    
                    <div class="event-detail-meta">
                        <div class="detail-meta-item">
                            <strong>📅 Date:</strong>
                            <span>${this.formatDate(eventDate)}</span>
                        </div>
                        <div class="detail-meta-item">
                            <strong>⏰ Time:</strong>
                            <span>${event.time}</span>
                        </div>
                        <div class="detail-meta-item">
                            <strong>📍 Location:</strong>
                            <span>${this.escapeHtml(event.location)}</span>
                        </div>
                        ${event.organizer ? `
                            <div class="detail-meta-item">
                                <strong>👤 Organizer:</strong>
                                <span>${this.escapeHtml(event.organizer)}</span>
                            </div>
                        ` : ''}
                    </div>

                    <div class="event-detail-description">
                        <h3>About This Event</h3>
                        <p>${this.escapeHtml(event.description)}</p>
                    </div>

                    ${event.requirements ? `
                        <div class="event-detail-requirements">
                            <h3>Requirements</h3>
                            <p>${this.escapeHtml(event.requirements)}</p>
                        </div>
                    ` : ''}

                    ${event.capacity ? `
                        <div class="event-capacity">
                            <strong>Capacity:</strong>
                            <span>${event.registeredUsers?.length || 0} / ${event.capacity}</span>
                        </div>
                    ` : ''}

                    ${user && isUpcoming ? `
                        <div class="event-actions">
                            ${!isRegistered ? `
                                <button class="btn btn-primary btn-block" id="registerEventBtn" data-event-id="${event.id}">
                                    Register for Event
                                </button>
                            ` : `
                                <button class="btn btn-secondary btn-block" id="unregisterEventBtn" data-event-id="${event.id}">
                                    Cancel Registration
                                </button>
                                <p class="registration-success">✓ You're registered for this event</p>
                            `}
                        </div>
                    ` : !user ? `
                        <div class="event-actions">
                            <p class="auth-prompt">Please <a href="#login">login</a> to register for events</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        // Show modal
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Attach event listeners for registration buttons
        if (user && isUpcoming) {
            const registerBtn = document.getElementById('registerEventBtn');
            const unregisterBtn = document.getElementById('unregisterEventBtn');

            if (registerBtn) {
                registerBtn.addEventListener('click', () => this.handleRegister(eventId));
            }

            if (unregisterBtn) {
                unregisterBtn.addEventListener('click', () => this.handleUnregister(eventId));
            }
        }
    }

    /**
     * Handle event registration
     */
    async handleRegister(eventId) {
        const user = authService.getCurrentUser();
        if (!user) return;

        const btn = document.getElementById('registerEventBtn');
        if (!btn) return;

        btn.disabled = true;
        btn.textContent = 'Registering...';

        try {
            const result = await eventsService.registerForEvent(eventId, user.uid);

            if (result.success) {
                // Update local events data
                const event = this.events.find(e => e.id === eventId);
                if (event) {
                    if (!event.registeredUsers) event.registeredUsers = [];
                    event.registeredUsers.push(user.uid);
                }

                // Reload modal and events list
                await this.loadEvents();
                this.showEventDetail(eventId);
                this.showToast('Successfully registered for event!', 'success');
            } else {
                this.showToast('Failed to register. Please try again.', 'error');
                btn.disabled = false;
                btn.textContent = 'Register for Event';
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showToast('An error occurred. Please try again.', 'error');
            btn.disabled = false;
            btn.textContent = 'Register for Event';
        }
    }

    /**
     * Handle event unregistration
     */
    async handleUnregister(eventId) {
        const user = authService.getCurrentUser();
        if (!user) return;

        const btn = document.getElementById('unregisterEventBtn');
        if (!btn) return;

        btn.disabled = true;
        btn.textContent = 'Canceling...';

        try {
            const result = await eventsService.unregisterFromEvent(eventId, user.uid);

            if (result.success) {
                // Update local events data
                const event = this.events.find(e => e.id === eventId);
                if (event && event.registeredUsers) {
                    event.registeredUsers = event.registeredUsers.filter(id => id !== user.uid);
                }

                // Reload modal and events list
                await this.loadEvents();
                this.showEventDetail(eventId);
                this.showToast('Registration canceled', 'info');
            } else {
                this.showToast('Failed to cancel. Please try again.', 'error');
                btn.disabled = false;
                btn.textContent = 'Cancel Registration';
            }
        } catch (error) {
            console.error('Unregistration error:', error);
            this.showToast('An error occurred. Please try again.', 'error');
            btn.disabled = false;
            btn.textContent = 'Cancel Registration';
        }
    }

    /**
     * Close event detail modal
     */
    closeModal() {
        const modal = document.getElementById('eventModal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Search with debounce
        const searchInput = document.getElementById('eventSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchDebounceTimer);
                this.searchDebounceTimer = setTimeout(() => {
                    this.searchTerm = e.target.value.trim().toLowerCase();
                    this.applyFilters();
                }, 300);
            });
        }

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.selectedCategory = e.target.value;
                this.applyFilters();
            });
        }

        // Clear filters
        const clearBtn = document.getElementById('clearFiltersBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        // Modal close
        const modalClose = document.getElementById('modalClose');
        const modalOverlay = document.getElementById('modalOverlay');
        
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeModal());
        }
        
        if (modalOverlay) {
            modalOverlay.addEventListener('click', () => this.closeModal());
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await authService.logout();
                window.location.hash = '#login';
            });
        }

        // Keyboard navigation for event cards
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('eventModal');
            if (modal && !modal.classList.contains('hidden') && e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    /**
     * Apply search and category filters
     */
    applyFilters() {
        this.filteredEvents = this.events.filter(event => {
            // Category filter
            const categoryMatch = this.selectedCategory === 'all' || 
                                 event.category === this.selectedCategory;

            // Search filter
            const searchMatch = !this.searchTerm || 
                               event.title.toLowerCase().includes(this.searchTerm) ||
                               event.description.toLowerCase().includes(this.searchTerm) ||
                               event.location.toLowerCase().includes(this.searchTerm);

            return categoryMatch && searchMatch;
        });

        this.renderEvents();
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        this.searchTerm = '';
        this.selectedCategory = 'all';
        
        const searchInput = document.getElementById('eventSearch');
        const categoryFilter = document.getElementById('categoryFilter');
        
        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = 'all';
        
        this.applyFilters();
    }

    /**
     * Get category color
     */
    getCategoryColor(category) {
        const colors = {
            academic: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            social: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            sports: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            cultural: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            career: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            workshop: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
        };
        return colors[category] || colors.academic;
    }

    /**
     * Get category icon
     */
    getCategoryIcon(category) {
        const icons = {
            academic: '📚',
            social: '🎉',
            sports: '⚽',
            cultural: '🎭',
            career: '💼',
            workshop: '🛠️'
        };
        return icons[category] || '📅';
    }

    /**
     * Format date
     */
    formatDate(date) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    }

    /**
     * Truncate text
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show error message
     */
    showError(message) {
        const grid = document.getElementById('eventsGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h3>Oops! Something went wrong</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">Retry</button>
                </div>
            `;
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
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
}

export default EventsView;