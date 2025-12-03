/* ===========================
   BOOKINGS SERVICE
   IST4035 - Campus Life App
   =========================== */

/**
 * Room Bookings service using Firebase Firestore
 * Handles CRUD operations for rooms and bookings with time slot management
 */

class BookingsService {
    constructor() {
        this.db = null;
        this.roomsCollection = 'rooms';
        this.bookingsCollection = 'bookings';
    }

    /**
     * Initialize Firestore
     */
    init() {
        if (!firebase.apps.length) {
            throw new Error('Firebase must be initialized before BookingsService');
        }
        this.db = firebase.firestore();
        console.log('Bookings Service initialized');
    }

    /**
     * Get all rooms
     */
    async getRooms() {
        try {
            const snapshot = await this.db
                .collection(this.roomsCollection)
                .orderBy('name', 'asc')
                .get();
            
            const rooms = [];
            snapshot.forEach(doc => {
                rooms.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return {
                success: true,
                rooms: rooms
            };
        } catch (error) {
            console.error('Error fetching rooms:', error);
            return {
                success: false,
                error: error.message,
                rooms: []
            };
        }
    }

    /**
     * Get single room by ID
     */
    async getRoomById(roomId) {
        try {
            const doc = await this.db.collection(this.roomsCollection).doc(roomId).get();
            
            if (!doc.exists) {
                return {
                    success: false,
                    error: 'Room not found'
                };
            }
            
            return {
                success: true,
                room: {
                    id: doc.id,
                    ...doc.data()
                }
            };
        } catch (error) {
            console.error('Error fetching room:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get bookings for a specific room on a specific date
     */
    async getRoomBookings(roomId, date) {
        try {
            const snapshot = await this.db
                .collection(this.bookingsCollection)
                .where('roomId', '==', roomId)
                .where('date', '==', date)
                .where('status', '==', 'confirmed')
                .get();
            
            const bookings = [];
            snapshot.forEach(doc => {
                bookings.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return {
                success: true,
                bookings: bookings
            };
        } catch (error) {
            console.error('Error fetching room bookings:', error);
            return {
                success: false,
                error: error.message,
                bookings: []
            };
        }
    }

    /**
     * Get user's bookings
     */
    async getUserBookings(userId) {
        try {
            const snapshot = await this.db
                .collection(this.bookingsCollection)
                .where('userId', '==', userId)
                .where('status', '==', 'confirmed')
                .get();
            
            const bookings = [];
            snapshot.forEach(doc => {
                bookings.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Sort by date and start time
            bookings.sort((a, b) => {
                const dateCompare = a.date.localeCompare(b.date);
                if (dateCompare !== 0) return dateCompare;
                return a.startTime.localeCompare(b.startTime);
            });
            
            return {
                success: true,
                bookings: bookings
            };
        } catch (error) {
            console.error('Error fetching user bookings:', error);
            return {
                success: false,
                error: error.message,
                bookings: []
            };
        }
    }

    /**
     * Check if time slot is available
     */
    async checkAvailability(roomId, date, startTime, endTime, excludeBookingId = null) {
        try {
            const result = await this.getRoomBookings(roomId, date);
            if (!result.success) return { available: false, error: result.error };

            const bookings = result.bookings.filter(b => b.id !== excludeBookingId);
            
            // Convert times to minutes for easier comparison
            const requestStart = this.timeToMinutes(startTime);
            const requestEnd = this.timeToMinutes(endTime);

            // Check for overlaps
            for (const booking of bookings) {
                const bookingStart = this.timeToMinutes(booking.startTime);
                const bookingEnd = this.timeToMinutes(booking.endTime);

                // Check if times overlap
                if (
                    (requestStart >= bookingStart && requestStart < bookingEnd) ||
                    (requestEnd > bookingStart && requestEnd <= bookingEnd) ||
                    (requestStart <= bookingStart && requestEnd >= bookingEnd)
                ) {
                    return {
                        available: false,
                        error: `Time slot conflicts with existing booking (${this.formatTime(booking.startTime)} - ${this.formatTime(booking.endTime)})`
                    };
                }
            }

            return { available: true };
        } catch (error) {
            console.error('Error checking availability:', error);
            return { available: false, error: error.message };
        }
    }

    /**
     * Create a new booking
     */
    async createBooking(bookingData, userId, userName) {
        try {
            // Validate booking data
            if (!bookingData.roomId || !bookingData.date || !bookingData.startTime || !bookingData.endTime) {
                return {
                    success: false,
                    error: 'Missing required booking information'
                };
            }

            // Validate times
            if (bookingData.startTime >= bookingData.endTime) {
                return {
                    success: false,
                    error: 'End time must be after start time'
                };
            }

            // Check availability
            const availabilityCheck = await this.checkAvailability(
                bookingData.roomId,
                bookingData.date,
                bookingData.startTime,
                bookingData.endTime
            );

            if (!availabilityCheck.available) {
                return {
                    success: false,
                    error: availabilityCheck.error
                };
            }

            // Create booking document
            const booking = {
                roomId: bookingData.roomId,
                roomName: bookingData.roomName,
                date: bookingData.date,
                startTime: bookingData.startTime,
                endTime: bookingData.endTime,
                purpose: bookingData.purpose,
                userId: userId,
                userName: userName,
                status: 'confirmed', // confirmed, cancelled
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await this.db.collection(this.bookingsCollection).add(booking);

            return {
                success: true,
                bookingId: docRef.id
            };
        } catch (error) {
            console.error('Error creating booking:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Cancel a booking
     */
    async cancelBooking(bookingId, userId) {
        try {
            const doc = await this.db.collection(this.bookingsCollection).doc(bookingId).get();
            
            if (!doc.exists) {
                return {
                    success: false,
                    error: 'Booking not found'
                };
            }

            const booking = doc.data();
            if (booking.userId !== userId) {
                return {
                    success: false,
                    error: 'You can only cancel your own bookings'
                };
            }

            await this.db.collection(this.bookingsCollection).doc(bookingId).update({
                status: 'cancelled',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            console.error('Error cancelling booking:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get available time slots for a room on a specific date
     */
    async getAvailableSlots(roomId, date) {
        try {
            const result = await this.getRoomBookings(roomId, date);
            if (!result.success) return { success: false, error: result.error, slots: [] };

            const bookings = result.bookings;
            
            // Define business hours (8 AM to 8 PM)
            const dayStart = 8 * 60; // 8:00 AM in minutes
            const dayEnd = 20 * 60; // 8:00 PM in minutes
            const slotDuration = 60; // 1 hour slots

            const availableSlots = [];
            const bookedSlots = bookings.map(b => ({
                start: this.timeToMinutes(b.startTime),
                end: this.timeToMinutes(b.endTime)
            }));

            // Generate time slots
            for (let time = dayStart; time < dayEnd; time += slotDuration) {
                const slotEnd = time + slotDuration;
                let isAvailable = true;

                // Check if this slot overlaps with any booking
                for (const booked of bookedSlots) {
                    if (
                        (time >= booked.start && time < booked.end) ||
                        (slotEnd > booked.start && slotEnd <= booked.end) ||
                        (time <= booked.start && slotEnd >= booked.end)
                    ) {
                        isAvailable = false;
                        break;
                    }
                }

                availableSlots.push({
                    start: this.minutesToTime(time),
                    end: this.minutesToTime(slotEnd),
                    available: isAvailable
                });
            }

            return {
                success: true,
                slots: availableSlots
            };
        } catch (error) {
            console.error('Error getting available slots:', error);
            return {
                success: false,
                error: error.message,
                slots: []
            };
        }
    }

    /**
     * Helper: Convert time string (HH:MM) to minutes
     */
    timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    /**
     * Helper: Convert minutes to time string (HH:MM)
     */
    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    /**
     * Helper: Format time to 12-hour format with AM/PM
     */
    formatTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }

    /**
     * Helper: Format date to readable format
     */
    formatDate(dateStr) {
        const date = new Date(dateStr);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
}

// Export singleton instance
const bookingsService = new BookingsService();
export default bookingsService;