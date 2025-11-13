/* ===========================
   CLUBS SERVICE
   IST4035 - Campus Life App
   =========================== */

/**
 * Clubs service using Firebase Firestore
 * Handles CRUD operations for student clubs and membership management
 */

class ClubsService {
    constructor() {
        this.db = null;
        this.clubsCollection = 'clubs';
        this.joinRequestsCollection = 'club_join_requests';
    }

    /**
     * Initialize Firestore
     */
    init() {
        if (!firebase.apps.length) {
            throw new Error('Firebase must be initialized before ClubsService');
        }
        this.db = firebase.firestore();
        console.log('Clubs Service initialized');
    }

    /**
     * Get all clubs with optional filtering
     */
    async getClubs(filters = {}) {
        try {
            let query = this.db.collection(this.clubsCollection);
            
            // Apply filters
            if (filters.category && filters.category !== 'all') {
                query = query.where('category', '==', filters.category);
            }
            
            if (filters.status && filters.status !== 'all') {
                query = query.where('status', '==', filters.status);
            }
            
            // Order by creation date
            query = query.orderBy('createdAt', 'desc');
            
            const snapshot = await query.get();
            
            const clubs = [];
            snapshot.forEach(doc => {
                clubs.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return {
                success: true,
                clubs: clubs
            };
        } catch (error) {
            console.error('Error fetching clubs:', error);
            return {
                success: false,
                error: error.message,
                clubs: []
            };
        }
    }

    /**
     * Get single club by ID
     */
    async getClubById(clubId) {
        try {
            const doc = await this.db.collection(this.clubsCollection).doc(clubId).get();
            
            if (!doc.exists) {
                return {
                    success: false,
                    error: 'Club not found'
                };
            }
            
            return {
                success: true,
                club: {
                    id: doc.id,
                    ...doc.data()
                }
            };
        } catch (error) {
            console.error('Error fetching club:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Create new club
     */
    async createClub(clubData, userId, userName) {
        try {
            const clubDoc = {
                name: clubData.name,
                description: clubData.description,
                category: clubData.category,
                meetingDay: clubData.meetingDay,
                meetingTime: clubData.meetingTime,
                meetingLocation: clubData.meetingLocation,
                capacity: parseInt(clubData.capacity),
                contactEmail: clubData.contactEmail,
                contactPhone: clubData.contactPhone || '',
                socialLinks: clubData.socialLinks || {},
                requirements: clubData.requirements || '',
                imageUrl: clubData.imageUrl || '',
                
                // Metadata
                createdBy: userId,
                createdByName: userName,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                
                // Members management
                members: [{
                    userId: userId,
                    userName: userName,
                    role: 'President',
                    joinedAt: new Date().toISOString()
                }],
                memberCount: 1,
                
                // Status
                status: 'active' // active, full, closed
            };
            
            const docRef = await this.db.collection(this.clubsCollection).add(clubDoc);
            
            return {
                success: true,
                clubId: docRef.id
            };
        } catch (error) {
            console.error('Error creating club:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Update club information
     */
    async updateClub(clubId, clubData) {
        try {
            await this.db.collection(this.clubsCollection).doc(clubId).update({
                ...clubData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return { success: true };
        } catch (error) {
            console.error('Error updating club:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Delete club
     */
    async deleteClub(clubId, userId) {
        try {
            // First verify the user owns this club
            const clubDoc = await this.db.collection(this.clubsCollection).doc(clubId).get();
            
            if (!clubDoc.exists) {
                return {
                    success: false,
                    error: 'Club not found'
                };
            }
            
            const clubData = clubDoc.data();
            if (clubData.createdBy !== userId) {
                return {
                    success: false,
                    error: 'You do not have permission to delete this club'
                };
            }
            
            // Delete all join requests for this club
            const requestsSnapshot = await this.db
                .collection(this.joinRequestsCollection)
                .where('clubId', '==', clubId)
                .get();
            
            // Delete requests one by one (more reliable than batch for permissions)
            const deletePromises = [];
            requestsSnapshot.forEach(doc => {
                deletePromises.push(doc.ref.delete());
            });
            
            await Promise.all(deletePromises);
            
            // Delete the club
            await this.db.collection(this.clubsCollection).doc(clubId).delete();
            
            console.log('Club deleted successfully:', clubId); // Debug
            
            return { success: true };
        } catch (error) {
            console.error('Error deleting club:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Search clubs
     */
    async searchClubs(searchTerm) {
        try {
            const snapshot = await this.db.collection(this.clubsCollection).get();
            
            const clubs = [];
            const lowerSearchTerm = searchTerm.toLowerCase();
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const nameMatch = data.name?.toLowerCase().includes(lowerSearchTerm);
                const descMatch = data.description?.toLowerCase().includes(lowerSearchTerm);
                
                if (nameMatch || descMatch) {
                    clubs.push({
                        id: doc.id,
                        ...data
                    });
                }
            });
            
            return {
                success: true,
                clubs: clubs
            };
        } catch (error) {
            console.error('Error searching clubs:', error);
            return {
                success: false,
                error: error.message,
                clubs: []
            };
        }
    }

    /**
     * Request to join a club
     */
    async requestToJoin(clubId, userId, userName, message = '') {
        try {
            // Check if request already exists
            const existingRequest = await this.db
                .collection(this.joinRequestsCollection)
                .where('clubId', '==', clubId)
                .where('userId', '==', userId)
                .where('status', '==', 'pending')
                .get();
            
            if (!existingRequest.empty) {
                return {
                    success: false,
                    error: 'You already have a pending request for this club'
                };
            }
            
            // Check if already a member
            const clubDoc = await this.db.collection(this.clubsCollection).doc(clubId).get();
            const club = clubDoc.data();
            
            if (club.members.some(m => m.userId === userId)) {
                return {
                    success: false,
                    error: 'You are already a member of this club'
                };
            }
            
            // Create join request
            const requestDoc = {
                clubId: clubId,
                clubName: club.name,
                userId: userId,
                userName: userName,
                message: message,
                status: 'pending', // pending, accepted, rejected
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await this.db.collection(this.joinRequestsCollection).add(requestDoc);
            
            return { success: true };
        } catch (error) {
            console.error('Error requesting to join club:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Cancel join request
     */
    async cancelJoinRequest(clubId, userId) {
        try {
            const snapshot = await this.db
                .collection(this.joinRequestsCollection)
                .where('clubId', '==', clubId)
                .where('userId', '==', userId)
                .where('status', '==', 'pending')
                .get();
            
            if (snapshot.empty) {
                return {
                    success: false,
                    error: 'No pending request found'
                };
            }
            
            await snapshot.docs[0].ref.delete();
            
            return { success: true };
        } catch (error) {
            console.error('Error canceling join request:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get join requests for a club
     */
    async getClubJoinRequests(clubId) {
        try {
            const snapshot = await this.db
                .collection(this.joinRequestsCollection)
                .where('clubId', '==', clubId)
                .where('status', '==', 'pending')
                .get();
            
            const requests = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                requests.push({
                    id: doc.id,
                    ...data,
                    // Convert Firestore timestamp to readable format
                    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString()
                });
            });
            
            // Sort by createdAt manually (since we removed orderBy)
            requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            console.log('Join requests for club', clubId, ':', requests); // Debug
            
            return {
                success: true,
                requests: requests
            };
        } catch (error) {
            console.error('Error fetching join requests:', error);
            return {
                success: false,
                error: error.message,
                requests: []
            };
        }
    }

    /**
     * Get user's join requests
     */
    async getUserJoinRequests(userId) {
        try {
            const snapshot = await this.db
                .collection(this.joinRequestsCollection)
                .where('userId', '==', userId)
                .where('status', '==', 'pending')
                .get();
            
            const requests = [];
            snapshot.forEach(doc => {
                requests.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return {
                success: true,
                requests: requests
            };
        } catch (error) {
            console.error('Error fetching user requests:', error);
            return {
                success: false,
                error: error.message,
                requests: []
            };
        }
    }

    /**
     * Accept join request
     */
    async acceptJoinRequest(requestId, clubId) {
        try {
            // Get request details
            const requestDoc = await this.db
                .collection(this.joinRequestsCollection)
                .doc(requestId)
                .get();
            
            if (!requestDoc.exists) {
                return {
                    success: false,
                    error: 'Request not found'
                };
            }
            
            const request = requestDoc.data();
            
            // Get club details
            const clubDoc = await this.db.collection(this.clubsCollection).doc(clubId).get();
            const club = clubDoc.data();
            
            // Check capacity
            if (club.memberCount >= club.capacity) {
                return {
                    success: false,
                    error: 'Club is at full capacity'
                };
            }
            
            // Add member to club
            const newMember = {
                userId: request.userId,
                userName: request.userName,
                role: 'Member',
                joinedAt: new Date().toISOString()
            };
            
            await this.db.collection(this.clubsCollection).doc(clubId).update({
                members: firebase.firestore.FieldValue.arrayUnion(newMember),
                memberCount: firebase.firestore.FieldValue.increment(1),
                status: club.memberCount + 1 >= club.capacity ? 'full' : club.status
            });
            
            // Update request status
            await this.db.collection(this.joinRequestsCollection).doc(requestId).update({
                status: 'accepted',
                processedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return { success: true };
        } catch (error) {
            console.error('Error accepting join request:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Reject join request
     */
    async rejectJoinRequest(requestId) {
        try {
            await this.db.collection(this.joinRequestsCollection).doc(requestId).update({
                status: 'rejected',
                processedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return { success: true };
        } catch (error) {
            console.error('Error rejecting join request:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Remove member from club
     */
    async removeMember(clubId, memberId) {
        try {
            const clubDoc = await this.db.collection(this.clubsCollection).doc(clubId).get();
            const club = clubDoc.data();
            
            const updatedMembers = club.members.filter(m => m.userId !== memberId);
            
            await this.db.collection(this.clubsCollection).doc(clubId).update({
                members: updatedMembers,
                memberCount: firebase.firestore.FieldValue.increment(-1),
                status: 'active' // Reopen club if it was full
            });
            
            return { success: true };
        } catch (error) {
            console.error('Error removing member:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Check if user is club admin (creator)
     */
    isClubAdmin(club, userId) {
        return club.createdBy === userId;
    }

    /**
     * Check if user is club member
     */
    isClubMember(club, userId) {
        return club.members.some(m => m.userId === userId);
    }

    /**
 * Get clubs created by user
 */
async getUserCreatedClubs(userId) {
    try {
        const snapshot = await this.db
            .collection(this.clubsCollection)
            .where('createdBy', '==', userId)
            .get();
        
        const clubs = [];
        snapshot.forEach(doc => {
            clubs.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log('getUserCreatedClubs - Found:', clubs.length); // Debug
        
        return {
            success: true,
            clubs: clubs
        };
    } catch (error) {
        console.error('Error fetching user created clubs:', error);
        return {
            success: false,
            error: error.message,
            clubs: []
        };
    }
}

    /**
     * Get clubs user is a member of
     */
    async getUserMemberClubs(userId) {
        try {
            // Get all clubs
            const snapshot = await this.db.collection(this.clubsCollection).get();
            
            const clubs = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                // Check if user is in members array
                if (data.members && Array.isArray(data.members)) {
                    const isMember = data.members.some(member => member.userId === userId);
                    if (isMember) {
                        clubs.push({
                            id: doc.id,
                            ...data
                        });
                    }
                }
            });
            
            console.log('getUserMemberClubs - Found:', clubs.length); // Debug
            
            return {
                success: true,
                clubs: clubs
            };
        } catch (error) {
            console.error('Error fetching user member clubs:', error);
            return {
                success: false,
                error: error.message,
                clubs: []
            };
        }
    }

    /**
     * Get clubs user is a member of
     */
    async getUserMemberClubs(userId) {
        try {
            const snapshot = await this.db.collection(this.clubsCollection).get();
            
            const clubs = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.members.some(m => m.userId === userId)) {
                    clubs.push({
                        id: doc.id,
                        ...data
                    });
                }
            });
            
            return {
                success: true,
                clubs: clubs
            };
        } catch (error) {
            console.error('Error fetching user member clubs:', error);
            return {
                success: false,
                error: error.message,
                clubs: []
            };
        }
    }
}

// Export singleton instance
const clubsService = new ClubsService();
export default clubsService;