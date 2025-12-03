/* ===========================
   ROOM BOOKINGS VIEW
   IST4035 - Campus Life App
   =========================== */

import authService from '../services/auth-service.js';
import bookingsService from '../services/bookings-service.js';

/**
 * Room Bookings view
 * Allows users to browse and book rooms with real-time availability
 */
export default class BookingsView {
    constructor() {
        this.rooms = [];
        this.filteredRooms = [];
        this.userBookings = [];
        this.filters = {
            date: '',
            time: 'all',
            type: 'all',
            search: ''
        };
        this.searchDebounceTimer = null;
        this.currentView = 'browse'; // browse, my-bookings
    }

    /**
     * Render the main layout
     */
    render() {
        const user = authService.getCurrentUser();

        return `
            <div class="bookings-container">
                <header class="page-header">
                    <div class="page-header-content">
                        <h1 class="page-title">Room Bookings</h1>
                        <p class="page-subtitle">Reserve study rooms, labs, and facilities across campus</p>
                    </div>
                    ${user ? `
                        <div class="user-info">
                            <span class="user-welcome">Welcome, ${user.displayName || user.email.split('@')[0]}</span>
                        </div>
                    ` : ''}
                </header>

                <!-- View Tabs -->
                <section class="bookings-tabs">
                    <button class="tab-btn active" data-view="browse" id="browseTab">
                        Browse Rooms
                    </button>
                    <button class="tab-btn" data-view="my-bookings" id="myBookingsTab">
                        My Bookings
                    </button>
                </section>

                <!-- Browse View -->
                <div id="browseView" class="tab-content active">
                    <section class="bookings-filters">
                        <div class="search-box">
                            <input 
                                type="search" 
                                id="roomSearch" 
                                class="search-input"
                                placeholder="Search rooms (e.g., Library, Lab)..."
                                aria-label="Search rooms">
                            <span class="search-icon">🔍</span>
                        </div>

                        <div class="filter-group">
                            <label class="filter-label">Date:</label>
                            <input type="date" id="dateFilter" class="filter-input">
                        </div>

                        <div class="filter-group">
                            <label class="filter-label">Type:</label>
                            <select id="typeFilter" class="filter-select">
                                <option value="all">All Rooms</option>
                                <option value="Study">Study Rooms</option>
                                <option value="Lab">Computer Labs</option>
                                <option value="Event">Event Halls</option>
                            </select>
                        </div>

                        <button class="btn btn-secondary" id="clearFiltersBtn">
                            Clear Filters
                        </button>
                    </section>

                    <section class="bookings-section">
                        <div id="bookingsGrid" class="bookings-grid">
                            <div class="loading-container">
                                <div class="loading-spinner"></div>
                                <p>Loading rooms...</p>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- My Bookings View -->
                <div id="myBookingsView" class="tab-content">
                    <div class="my-bookings-content">
                        <!-- Will be populated dynamically -->
                    </div>
                </div>

                <!-- Booking Modal -->
                <div id="bookingModal" class="modal hidden" role="dialog" aria-modal="true">
                    <div class="modal-overlay" id="modalOverlay"></div>
                    <div class="modal-content modal-large">
                        <button class="modal-close" id="modalClose">✕</button>
                        <div id="modalBody"></div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Initialize view
     */
    async init() {
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        this.filters.date = today;
        
        await this.loadRooms();
        
        const dateInput = document.getElementById('dateFilter');
        if (dateInput) dateInput.value = today;

        this.attachEventListeners();
        
        // Expose instance globally
        window.bookingsViewInstance = this;
    }

    /**
     * Load rooms from Firebase
     */
    async loadRooms() {
        try {
            const result = await bookingsService.getRooms();
            
            if (result.success) {
                this.rooms = result.rooms;
                
                // Calculate availability status for each room
                await this.updateRoomStatuses();
                
                this.filteredRooms = [...this.rooms];
                this.renderRooms();
            } else {
                this.showError('Failed to load rooms. Please try again later.');
            }
        } catch (error) {
            console.error('Error loading rooms:', error);
            this.showError('An unexpected error occurred.');
        }
    }

    /**
     * Update room availability statuses
     */
    async updateRoomStatuses() {
        const date = this.filters.date;
        
        for (const room of this.rooms) {
            const slotsResult = await bookingsService.getAvailableSlots(room.id, date);
            
            if (slotsResult.success) {
                const availableCount = slotsResult.slots.filter(s => s.available).length;
                const totalSlots = slotsResult.slots.length;
                
                if (availableCount === 0) {
                    room.status = 'Full';
                } else if (availableCount <= 3) {
                    room.status = 'Limited';
                } else {
                    room.status = 'Available';
                }
                
                room.availableSlots = availableCount;
                room.totalSlots = totalSlots;
            }
        }
    }

    /**
     * Render the grid of cards
     */
    renderRooms() {
        const grid = document.getElementById('bookingsGrid');
        if (!grid) return;

        if (this.filteredRooms.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🚪</div>
                    <h3>No rooms found</h3>
                    <p>Try adjusting your filters or search terms.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.filteredRooms.map(room => `
            <article class="room-card" tabindex="0" data-room-id="${room.id}">
                <div class="room-image" style="background: ${room.gradient}">
                    <span class="room-icon">${room.icon}</span>
                </div>
                <div class="room-details">
                    <span class="room-badge">${room.type}</span>
                    <h3>${this.escapeHtml(room.name)}</h3>
                    <p class="room-desc">${this.escapeHtml(room.description)}</p>
                    
                    <div class="room-meta">
                        <span class="meta-item">👤 ${room.capacity} Capacity</span>
                        <span class="meta-item status-${room.status.toLowerCase()}">${room.status}</span>
                    </div>

                    ${room.availableSlots !== undefined ? `
                        <div class="availability-info">
                            <small>${room.availableSlots} of ${room.totalSlots} slots available on ${this.formatDateShort(this.filters.date)}</small>
                        </div>
                    ` : ''}

                    <button class="btn-book" onclick="window.bookingsViewInstance.openBookingModal('${room.id}')">
                        ${room.status === 'Full' ? 'View Schedule' : 'Book Now'}
                    </button>
                </div>
            </article>
        `).join('');
    }

    /**
     * Open the Booking Modal
     */
    async openBookingModal(roomId) {
        const user = authService.getCurrentUser();
        if (!user) {
            this.showToast("Please login to book a room", 'error');
            window.location.hash = '#login';
            return;
        }

        const room = this.rooms.find(r => r.id === roomId);
        if (!room) return;

        const modal = document.getElementById('bookingModal');
        const modalBody = document.getElementById('modalBody');
        
        // Show loading
        modalBody.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Loading availability...</p></div>';
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Get available slots
        const slotsResult = await bookingsService.getAvailableSlots(roomId, this.filters.date);
        
        if (!slotsResult.success) {
            modalBody.innerHTML = `<div class="error-state"><p>${slotsResult.error}</p></div>`;
            return;
        }

        const slots = slotsResult.slots;
        const availableSlots = slots.filter(s => s.available);

        modalBody.innerHTML = `
            <div class="booking-form-container">
                <div class="modal-header-custom" style="background: ${room.gradient}; padding: 1.5rem; border-radius: 8px 8px 0 0; color: white; margin: -1.5rem -1.5rem 1.5rem -1.5rem;">
                    <h2>${this.escapeHtml(room.name)}</h2>
                    <p><span style="font-size: 1.2em; margin-right: 5px;">${room.icon}</span> ${room.type} Room • Capacity: ${room.capacity}</p>
                </div>
                
                ${availableSlots.length === 0 ? `
                    <div class="no-slots-message">
                        <h3>No Available Slots</h3>
                        <p>All time slots are booked for ${bookingsService.formatDate(this.filters.date)}.</p>
                        <p>Please select a different date or check back later.</p>
                        <button class="btn btn-primary" onclick="window.bookingsViewInstance.closeModal()">Close</button>
                    </div>
                ` : `
                    <form id="bookingForm">
                        <div class="form-group">
                            <label class="form-label">Date</label>
                            <input type="date" id="bookingDate" class="form-input" value="${this.filters.date}" required min="${new Date().toISOString().split('T')[0]}">
                            <small class="form-hint">Selected: ${bookingsService.formatDate(this.filters.date)}</small>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Select Time Slot</label>
                            <div class="time-slots-grid">
                                ${slots.map(slot => `
                                    <label class="time-slot ${slot.available ? '' : 'disabled'}">
                                        <input 
                                            type="radio" 
                                            name="timeSlot" 
                                            value="${slot.start}-${slot.end}"
                                            ${!slot.available ? 'disabled' : ''}
                                            required>
                                        <span class="slot-time">
                                            ${bookingsService.formatTime(slot.start)} - ${bookingsService.formatTime(slot.end)}
                                        </span>
                                        <span class="slot-status">${slot.available ? '✓ Available' : '✕ Booked'}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Purpose of Booking *</label>
                            <textarea id="bookingPurpose" class="form-input" rows="3" placeholder="e.g., Group Project Discussion, Study Session" required maxlength="200"></textarea>
                            <small class="form-hint">Max 200 characters</small>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="window.bookingsViewInstance.closeModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Confirm Booking</button>
                        </div>
                    </form>
                `}
            </div>
        `;

        // Add form submit handler
        const form = document.getElementById('bookingForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleBookingSubmit(room);
            });

            // Add date change handler
            const dateInput = document.getElementById('bookingDate');
            if (dateInput) {
                dateInput.addEventListener('change', async (e) => {
                    this.filters.date = e.target.value;
                    await this.updateRoomStatuses();
                    this.openBookingModal(roomId); // Reload modal with new date
                });
            }
        }
    }

    /**
     * Handle booking form submission
     */
    async handleBookingSubmit(room) {
        const user = authService.getCurrentUser();
        if (!user) return;

        const form = document.getElementById('bookingForm');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Get form data
        const date = document.getElementById('bookingDate').value;
        const timeSlot = form.querySelector('input[name="timeSlot"]:checked')?.value;
        const purpose = document.getElementById('bookingPurpose').value.trim();

        if (!timeSlot) {
            this.showToast('Please select a time slot', 'error');
            return;
        }

        const [startTime, endTime] = timeSlot.split('-');

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Booking...';

        try {
            const result = await bookingsService.createBooking(
                {
                    roomId: room.id,
                    roomName: room.name,
                    date: date,
                    startTime: startTime,
                    endTime: endTime,
                    purpose: purpose
                },
                user.uid,
                user.displayName || user.email
            );

            if (result.success) {
                this.showToast(`Successfully booked ${room.name}!`, 'success');
                this.closeModal();
                await this.loadRooms(); // Refresh room statuses
            } else {
                this.showToast(result.error, 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Confirm Booking';
            }
        } catch (error) {
            console.error('Error submitting booking:', error);
            this.showToast('Failed to create booking', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirm Booking';
        }
    }

    /**
     * Render My Bookings view
     */
    async renderMyBookingsView() {
        const user = authService.getCurrentUser();
        if (!user) return;

        const content = document.querySelector('.my-bookings-content');
        if (!content) return;

        content.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Loading your bookings...</p></div>';

        try {
            const result = await bookingsService.getUserBookings(user.uid);

            if (result.success) {
                this.userBookings = result.bookings;

                // Separate upcoming and past bookings
                const today = new Date().toISOString().split('T')[0];
                const upcoming = this.userBookings.filter(b => b.date >= today);
                const past = this.userBookings.filter(b => b.date < today);

                content.innerHTML = `
                    <div class="my-bookings-sections">
                        <section class="my-bookings-section">
                            <h2 class="section-title">Upcoming Bookings (${upcoming.length})</h2>
                            ${upcoming.length > 0 ? `
                                <div class="bookings-list">
                                    ${upcoming.map(booking => this.renderBookingCard(booking)).join('')}
                                </div>
                            ` : `
                                <div class="empty-state-small">
                                    <p>You have no upcoming bookings.</p>
                                    <button class="btn btn-primary" onclick="window.bookingsViewInstance.switchView('browse')">
                                        Browse Rooms
                                    </button>
                                </div>
                            `}
                        </section>

                        ${past.length > 0 ? `
                            <section class="my-bookings-section">
                                <h2 class="section-title">Past Bookings (${past.length})</h2>
                                <div class="bookings-list">
                                    ${past.map(booking => this.renderBookingCard(booking, true)).join('')}
                                </div>
                            </section>
                        ` : ''}
                    </div>
                `;
            } else {
                content.innerHTML = '<div class="error-state"><p>Failed to load your bookings</p></div>';
            }
        } catch (error) {console.error('Error loading user bookings:', error);
        content.innerHTML = '<div class="error-state"><p>An error occurred</p></div>';
    }
}

/**
 * Render single booking card
 */
renderBookingCard(booking, isPast = false) {
    return `
        <div class="booking-card ${isPast ? 'past' : ''}">
            <div class="booking-header">
                <h3>${this.escapeHtml(booking.roomName)}</h3>
                ${!isPast ? '<span class="booking-status">Confirmed</span>' : '<span class="booking-status past-status">Completed</span>'}
            </div>
            <div class="booking-details">
                <div class="booking-detail-item">
                    <span class="detail-icon">📅</span>
                    <span>${bookingsService.formatDate(booking.date)}</span>
                </div>
                <div class="booking-detail-item">
                    <span class="detail-icon">⏰</span>
                    <span>${bookingsService.formatTime(booking.startTime)} - ${bookingsService.formatTime(booking.endTime)}</span>
                </div>
                <div class="booking-detail-item">
                    <span class="detail-icon">📝</span>
                    <span>${this.escapeHtml(booking.purpose)}</span>
                </div>
            </div>
            ${!isPast ? `
                <div class="booking-actions">
                    <button class="btn btn-secondary btn-sm" onclick="window.bookingsViewInstance.cancelBooking('${booking.id}')">
                        Cancel Booking
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Cancel a booking
 */
async cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }

    const user = authService.getCurrentUser();
    if (!user) return;

    try {
        const result = await bookingsService.cancelBooking(bookingId, user.uid);

        if (result.success) {
            this.showToast('Booking cancelled successfully', 'info');
            await this.renderMyBookingsView();
            await this.loadRooms(); // Refresh room availability
        } else {
            this.showToast(result.error, 'error');
        }
    } catch (error) {
        console.error('Error cancelling booking:', error);
        this.showToast('Failed to cancel booking', 'error');
    }
}

/**
 * Switch between views
 */
switchView(view) {
    this.currentView = view;

    // Update tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    if (view === 'browse') {
        document.getElementById('browseView').classList.add('active');
    } else if (view === 'my-bookings') {
        document.getElementById('myBookingsView').classList.add('active');
        this.renderMyBookingsView();
    }
}

/**
 * Close modal
 */
closeModal() {
    document.getElementById('bookingModal').classList.add('hidden');
    document.body.style.overflow = '';
}

/**
 * Attach Event Listeners
 */
attachEventListeners() {
    // Search
    const searchInput = document.getElementById('roomSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchDebounceTimer);
            this.searchDebounceTimer = setTimeout(() => {
                this.filters.search = e.target.value.toLowerCase();
                this.applyFilters();
            }, 300);
        });
    }

    // Date filter
    document.getElementById('dateFilter')?.addEventListener('change', async (e) => {
        this.filters.date = e.target.value;
        await this.updateRoomStatuses();
        this.renderRooms();
    });

    // Type filter
    document.getElementById('typeFilter')?.addEventListener('change', (e) => {
        this.filters.type = e.target.value;
        this.applyFilters();
    });

    // Clear filters
    document.getElementById('clearFiltersBtn')?.addEventListener('click', () => {
        document.getElementById('roomSearch').value = '';
        document.getElementById('typeFilter').value = 'all';
        this.filters.search = '';
        this.filters.type = 'all';
        this.applyFilters();
    });

    // Tab buttons
    document.getElementById('browseTab')?.addEventListener('click', () => this.switchView('browse'));
    document.getElementById('myBookingsTab')?.addEventListener('click', () => this.switchView('my-bookings'));

    // Modal close
    document.getElementById('modalClose')?.addEventListener('click', () => this.closeModal());
    document.getElementById('modalOverlay')?.addEventListener('click', () => this.closeModal());

    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            this.closeModal();
        }
    });
}

/**
 * Apply filters
 */
applyFilters() {
    this.filteredRooms = this.rooms.filter(room => {
        const matchesType = this.filters.type === 'all' || room.type === this.filters.type;
        const matchesSearch = room.name.toLowerCase().includes(this.filters.search) || 
                              room.description.toLowerCase().includes(this.filters.search);
        return matchesType && matchesSearch;
    });
    this.renderRooms();
}

/**
 * Helper methods
 */
escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

formatDateShort(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

showError(message) {
    const grid = document.getElementById('bookingsGrid');
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

destroy() {
    window.bookingsViewInstance = null;
}
}