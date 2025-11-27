// js/views/bookings.js

export default class BookingsView {
    render() {
        
        const rooms = [
            {
                id: 1,
                name: "Group Study Room A",
                capacity: 6,
                type: "Study",
                icon: "fa-book-open",
                // Purple/Indigo gradient (Like Academic events)
                gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", 
                status: "Available"
            },
            {
                id: 2,
                name: "Conference Hall B",
                capacity: 50,
                type: "Event",
                icon: "fa-users",
                // Blue/Cyan gradient (Like Social events)
                gradient: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
                status: "Available"
            },
            {
                id: 3,
                name: "Media Lab 4",
                capacity: 12,
                type: "Lab",
                icon: "fa-desktop",
                // Orange/Pink gradient (Distinct look)
                gradient: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)",
                status: "Limited"
            }
        ];

        
        const roomsHtml = rooms.map(room => `
            <article class="room-card">
                <div class="room-image" style="background: ${room.gradient}">
                    <i class="fas ${room.icon}"></i> 
                </div>
                <div class="room-details">
                    <span class="room-badge">${room.type}</span>
                    <h3>${room.name}</h3>
                    <p style="color: #666; font-size: 0.9rem; margin-top: 5px;">
                        Perfect for group discussions and project work.
                    </p>
                    <div class="room-meta">
                        <span><i class="fas fa-user"></i> ${room.capacity} People</span>
                        <button class="btn-book" onclick="alert('Booking feature for ${room.name} coming next!')">Book Now</button>
                    </div>
                </div>
            </article>
        `).join('');

        return `
            <div class="bookings-view">
                <div class="bookings-header">
                    <h1>Room Bookings</h1>
                    <p style="color: #666;">Reserve study rooms, meeting spaces, and facilities instantly.</p>
                </div>

                <div class="bookings-filter-container">
                    <div class="filter-group">
                        <label style="font-size: 0.85rem; font-weight: 600;">Date</label>
                        <input type="date" class="filter-input">
                    </div>
                    <div class="filter-group">
                        <label style="font-size: 0.85rem; font-weight: 600;">Time</label>
                        <select class="filter-input">
                            <option>08:00 AM - 10:00 AM</option>
                            <option>10:00 AM - 12:00 PM</option>
                            <option>02:00 PM - 04:00 PM</option>
                        </select>
                    </div>
                     <div class="filter-group">
                        <label style="font-size: 0.85rem; font-weight: 600;">Room Type</label>
                        <select class="filter-input">
                            <option value="all">All Rooms</option>
                            <option value="study">Study Rooms</option>
                            <option value="lab">Computer Labs</option>
                            <option value="hall">Halls</option>
                        </select>
                    </div>
                </div>

                <div class="bookings-grid">
                    ${roomsHtml}
                </div>
            </div>
        `;
    }
}