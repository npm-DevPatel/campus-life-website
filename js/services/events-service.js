/* ===========================
   EVENTS SERVICE
   IST4035 - Campus Life App
   =========================== */

/**
 * Events service using Firebase Firestore
 * Handles CRUD operations for campus events
 */

class EventsService {
    constructor() {
        this.db = null;
        this.eventsCollection = 'events';
    }

    /**
     * Initialize Firestore
     */
    init() {
        if (!firebase.apps.length) {
            throw new Error('Firebase must be initialized before EventsService');
        }
        this.db = firebase.firestore();
        console.log('Events Service initialized');
    }

    /**
     * Get all events with optional filtering
     */
    async getEvents(filters = {}) {
        try {
            let query = this.db.collection(this.eventsCollection);
            
            // Apply filters
            if (filters.category && filters.category !== 'all') {
                query = query.where('category', '==', filters.category);
            }
            
            if (filters.startDate) {
                query = query.where('date', '>=', filters.startDate);
            }
            
            // Order by date
            query = query.orderBy('date', 'asc');
            
            const snapshot = await query.get();
            
            const events = [];
            snapshot.forEach(doc => {
                events.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return {
                success: true,
                events: events
            };
        } catch (error) {
            console.error('Error fetching events:', error);
            return {
                success: false,
                error: error.message,
                events: []
            };
        }
    }

    /**
     * Get single event by ID
     */
    async getEventById(eventId) {
        try {
            const doc = await this.db.collection(this.eventsCollection).doc(eventId).get();
            
            if (!doc.exists) {
                return {
                    success: false,
                    error: 'Event not found'
                };
            }
            
            return {
                success: true,
                event: {
                    id: doc.id,
                    ...doc.data()
                }
            };
        } catch (error) {
            console.error('Error fetching event:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Create new event (admin only)
     */
    async createEvent(eventData) {
        try {
            const docRef = await this.db.collection(this.eventsCollection).add({
                ...eventData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return {
                success: true,
                eventId: docRef.id
            };
        } catch (error) {
            console.error('Error creating event:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Update event
     */
    async updateEvent(eventId, eventData) {
        try {
            await this.db.collection(this.eventsCollection).doc(eventId).update({
                ...eventData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return { success: true };
        } catch (error) {
            console.error('Error updating event:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Delete event
     */
    async deleteEvent(eventId) {
        try {
            await this.db.collection(this.eventsCollection).doc(eventId).delete();
            return { success: true };
        } catch (error) {
            console.error('Error deleting event:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Search events by title or description
     */
    async searchEvents(searchTerm) {
        try {
            const snapshot = await this.db.collection(this.eventsCollection).get();
            
            const events = [];
            const lowerSearchTerm = searchTerm.toLowerCase();
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const titleMatch = data.title?.toLowerCase().includes(lowerSearchTerm);
                const descMatch = data.description?.toLowerCase().includes(lowerSearchTerm);
                
                if (titleMatch || descMatch) {
                    events.push({
                        id: doc.id,
                        ...data
                    });
                }
            });
            
            return {
                success: true,
                events: events
            };
        } catch (error) {
            console.error('Error searching events:', error);
            return {
                success: false,
                error: error.message,
                events: []
            };
        }
    }

    /**
     * Register user for an event
     */
    async registerForEvent(eventId, userId) {
        try {
            const eventRef = this.db.collection(this.eventsCollection).doc(eventId);
            
            await eventRef.update({
                registeredUsers: firebase.firestore.FieldValue.arrayUnion(userId)
            });
            
            return { success: true };
        } catch (error) {
            console.error('Error registering for event:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Unregister user from event
     */
    async unregisterFromEvent(eventId, userId) {
        try {
            const eventRef = this.db.collection(this.eventsCollection).doc(eventId);
            
            await eventRef.update({
                registeredUsers: firebase.firestore.FieldValue.arrayRemove(userId)
            });
            
            return { success: true };
        } catch (error) {
            console.error('Error unregistering from event:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Export singleton instance
const eventsService = new EventsService();
export default eventsService;