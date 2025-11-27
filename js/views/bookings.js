import authService from '../services/auth-service.js';

/**
 * Room Bookings view
 * Allows users to browse and book rooms with filters and modals
 */
export default class BookingsView {
    constructor() {
        this.rooms = [];
        this.filteredRooms = [];
        this.filters = {
            date: '',
            time: 'all',
            type: 'all',
            search: ''
        };
        this.searchDebounceTimer = null;
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
                        <p class="page-subtitle">Reserve study rooms, labs, and facilities across USIU campus</p>
                    </div>
                    ${user ? `
                        <div class="user-info">
                            <span class="user-welcome">Welcome, ${user.displayName || 'Student'}</span>
                        </div>
                    ` : ''}
                </header>

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
                        <label class="filter-label">Time:</label>
                        <select id="timeFilter" class="filter-select">
                            <option value="all">Any Time</option>
                            <option value="morning">Morning (8AM - 12PM)</option>
                            <option value="afternoon">Afternoon (12PM - 4PM)</option>
                            <option value="evening">Evening (4PM - 8PM)</option>
                        </select>
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

                <div id="bookingModal" class="modal hidden" role="dialog" aria-modal="true">
                    <div class="modal-overlay" id="modalOverlay"></div>
                    <div class="modal-content">
                        <button class="modal-close" id="modalClose">✕</button>
                        <div id="modalBody">
                            </div>
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
    }

    /**
     * Load rooms (USIU Mock Data)
     */
    async loadRooms() {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 600));

        this.rooms = [
            {
                id: 1,
                name: "Lillian Beam - Lab 2",
                capacity: 30,
                type: "Study",
                icon: "📚", 
                gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", 
                status: "Available",
                description: "Quiet study lab on the ground floor of the Lillian K. Beam. Whiteboard included."
            },
            {
                id: 2,
                name: "USIU Auditorium",
                capacity: 300,
                type: "Event",
                icon: "🎤", 
                gradient: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
                status: "Available",
                description: "Main university auditorium for large student assemblies, guest lectures, and performances."
            },
            {
                id: 3,
                name: "SST Computer Lab 2",
                capacity: 30,
                type: "Lab",
                icon: "💻", 
                gradient: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)",
                status: "Limited",
                description: "High-performance lab in the School of Science & Technology. Equipped with programming software."
            },
            {
                id: 4,
                name: "Student Center Meeting Room",
                capacity: 25,
                type: "Study",
                icon: "🤝", 
                gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                status: "Available",
                description: "Located in the Freida Brown Student Center. Ideal for club meetings and group discussions."
            },
            {
                id: 5,
                name: "Study Pod 1 - SHSS",
                capacity: 2,
                type: "Study",
                icon: "🎧",
                gradient: "linear-gradient(135deg, #333abcff 0%, #0f036aff 100%)",
                status: "Available",
                description: "Private pod for focused individual study."
            }
        ];

        this.filteredRooms = [...this.rooms];
        this.renderRooms();
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
            <article class="room-card" tabindex="0">
                <div class="room-image" style="background: ${room.gradient}">
                    <span class="room-icon">${room.icon}</span> 
                </div>
                <div class="room-details">
                    <span class="room-badge">${room.type}</span>
                    <h3>${room.name}</h3>
                    <p class="room-desc">${room.description}</p>
                    
                    <div class="room-meta">
                        <span class="meta-item">👤 ${room.capacity} Capacity</span>
                        <span class="meta-item status-${room.status.toLowerCase()}">${room.status}</span>
                    </div>

                    <button class="btn-book" onclick="window.bookingsViewInstance.openBookingModal(${room.id})">
                        Book Now
                    </button>
                </div>
            </article>
        `).join('');
    }

    /**
     * Open the Booking Modal
     */
    openBookingModal(roomId) {
        const user = authService.getCurrentUser();
        if (!user) {
            alert("Please login to book a room.");
            return;
        }

        const room = this.rooms.find(r => r.id === roomId);
        if (!room) return;

        const modal = document.getElementById('bookingModal');
        const modalBody = document.getElementById('modalBody');
        
        modalBody.innerHTML = `
            <div class="booking-form-container">
                <div class="modal-header-custom" style="background: ${room.gradient}; padding: 1.5rem; border-radius: 8px 8px 0 0; color: white; margin: -1.5rem -1.5rem 1.5rem -1.5rem;">
                    <h2>Book ${room.name}</h2>
                    <p><span style="font-size: 1.2em; margin-right: 5px;">${room.icon}</span> ${room.type} Room • Capacity: ${room.capacity}</p>
                </div>
                
                <form id="bookingForm">
                    <div class="form-group">
                        <label class="form-label">Date</label>
                        <input type="date" class="form-input" value="${this.filters.date}" required>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Start Time</label>
                            <input type="time" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">End Time</label>
                            <input type="time" class="form-input" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Purpose of Booking</label>
                        <textarea class="form-input" rows="3" placeholder="e.g. Group Project Discussion" required></textarea>
                    </div>

                    <div class="form-actions" style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 1rem;">
                        <button type="button" class="btn btn-secondary" onclick="window.bookingsViewInstance.closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Confirm Booking</button>
                    </div>
                </form>
            </div>
        `;

        modal.classList.remove('hidden');

        document.getElementById('bookingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBookingSubmit(room.name);
        });
    }

    handleBookingSubmit(roomName) {
        this.closeModal();
        
        const toast = document.createElement('div');
        toast.className = 'toast toast-success show';
        toast.textContent = `Success! You have booked ${roomName}.`;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    closeModal() {
        document.getElementById('bookingModal').classList.add('hidden');
    }

    /**
     * Attach Event Listeners
     */
    attachEventListeners() {
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

        document.getElementById('dateFilter')?.addEventListener('change', (e) => {
            this.filters.date = e.target.value;
        });

        document.getElementById('typeFilter')?.addEventListener('change', (e) => {
            this.filters.type = e.target.value;
            this.applyFilters();
        });

        document.getElementById('clearFiltersBtn')?.addEventListener('click', () => {
            document.getElementById('roomSearch').value = '';
            document.getElementById('typeFilter').value = 'all';
            this.filters.search = '';
            this.filters.type = 'all';
            this.applyFilters();
        });

        document.getElementById('modalClose')?.addEventListener('click', () => this.closeModal());
        document.getElementById('modalOverlay')?.addEventListener('click', () => this.closeModal());

        window.bookingsViewInstance = this;
    }

    applyFilters() {
        this.filteredRooms = this.rooms.filter(room => {
            const matchesType = this.filters.type === 'all' || room.type === this.filters.type;
            const matchesSearch = room.name.toLowerCase().includes(this.filters.search) || 
                                  room.description.toLowerCase().includes(this.filters.search);
            return matchesType && matchesSearch;
        });
        this.renderRooms();
    }
}
