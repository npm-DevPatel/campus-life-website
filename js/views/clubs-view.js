/* ===========================
   CLUBS VIEW
   IST4035 - Campus Life App
   =========================== */

import clubsService from '../services/clubs-service.js';
import authService from '../services/auth-service.js';

/**
 * Student Clubs listing and management view
 */

class ClubsView {
    constructor() {
        this.clubs = [];
        this.filteredClubs = [];
        this.userRequests = [];
        this.selectedCategory = 'all';
        this.selectedStatus = 'all';
        this.searchTerm = '';
        this.searchDebounceTimer = null;
        this.currentView = 'browse'; // browse, my-clubs, create
    }

    /**
     * Render clubs page
     */
    render() {
        const user = authService.getCurrentUser();
        
        return `
            <div class="clubs-container">
                <!-- Page Header -->
                <header class="page-header">
                    <div class="page-header-content">
                        <h1 class="page-title">Student Clubs</h1>
                        <p class="page-subtitle">Find your community and connect with like-minded students</p>
                    </div>
                    <div class="page-header-actions">
                        <button class="btn btn-primary" id="createClubBtn">
                            <span>➕ Create Club</span>
                        </button>
                    </div>
                </header>

                <!-- View Tabs -->
                <section class="clubs-tabs">
                    <button class="tab-btn active" data-view="browse" id="browseTab">
                        Browse Clubs
                    </button>
                    <button class="tab-btn" data-view="my-clubs" id="myClubsTab">
                        My Clubs
                    </button>
                </section>

                <!-- Browse View -->
                <div id="browseView" class="tab-content active">
                    <!-- Filters Section -->
                    <section class="clubs-filters">
                        <div class="search-box">
                            <input 
                                type="search" 
                                id="clubSearch" 
                                class="search-input"
                                placeholder="Search clubs..."
                                aria-label="Search clubs">
                            <span class="search-icon">🔍</span>
                        </div>

                        <div class="filter-group">
                            <label class="filter-label">Category:</label>
                            <select id="categoryFilter" class="filter-select" aria-label="Filter by category">
                                <option value="all">All Categories</option>
                                <option value="academic">Academic</option>
                                <option value="sports">Sports</option>
                                <option value="arts">Arts & Culture</option>
                                <option value="technology">Technology</option>
                                <option value="social">Social</option>
                                <option value="volunteer">Volunteer</option>
                                <option value="professional">Professional</option>
                            </select>
                        </div>

                        <div class="filter-group">
                            <label class="filter-label">Status:</label>
                            <select id="statusFilter" class="filter-select" aria-label="Filter by status">
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="full">Full</option>
                            </select>
                        </div>

                        <button class="btn btn-secondary" id="clearFiltersBtn">
                            Clear Filters
                        </button>
                    </section>

                    <!-- Clubs Grid -->
                    <section class="clubs-section">
                        <div id="clubsGrid" class="clubs-grid">
                            <div class="loading-container">
                                <div class="loading-spinner"></div>
                                <p>Loading clubs...</p>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- My Clubs View -->
                <div id="myClubsView" class="tab-content">
                    <div class="my-clubs-content">
                        <!-- Will be populated dynamically -->
                    </div>
                </div>

                <!-- Club Detail Modal -->
                <div id="clubModal" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
                    <div class="modal-overlay" id="modalOverlay"></div>
                    <div class="modal-content modal-large">
                        <button class="modal-close" id="modalClose" aria-label="Close modal">✕</button>
                        <div id="modalBody">
                            <!-- Dynamic content -->
                        </div>
                    </div>
                </div>

                <!-- Create/Edit Club Modal -->
                <div id="clubFormModal" class="modal hidden" role="dialog" aria-modal="true">
                    <div class="modal-overlay" id="formModalOverlay"></div>
                    <div class="modal-content modal-large">
                        <button class="modal-close" id="formModalClose" aria-label="Close modal">✕</button>
                        <div id="clubFormBody">
                            <!-- Form will be rendered here -->
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
        await this.loadClubs();
        await this.loadUserRequests();
        this.attachEventListeners();
    }

    /**
     * Load all clubs
     */
    async loadClubs() {
        try {
            const result = await clubsService.getClubs();
            
            if (result.success) {
                this.clubs = result.clubs;
                this.filteredClubs = [...this.clubs];
                this.renderClubs();
            } else {
                this.showError('Failed to load clubs. Please try again later.');
            }
        } catch (error) {
            console.error('Error loading clubs:', error);
            this.showError('An unexpected error occurred.');
        }
    }

    /**
     * Load user's pending join requests
     */
    async loadUserRequests() {
        const user = authService.getCurrentUser();
        if (!user) return;

        try {
            const result = await clubsService.getUserJoinRequests(user.uid);
            if (result.success) {
                this.userRequests = result.requests;
            }
        } catch (error) {
            console.error('Error loading user requests:', error);
        }
    }

    /**
     * Render clubs grid
     */
    renderClubs() {
        const grid = document.getElementById('clubsGrid');
        if (!grid) return;

        if (this.filteredClubs.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎭</div>
                    <h3>No clubs found</h3>
                    <p>${this.searchTerm || this.selectedCategory !== 'all' || this.selectedStatus !== 'all'
                        ? 'Try adjusting your filters' 
                        : 'Be the first to create a club!'}</p>
                    <button class="btn btn-primary" onclick="document.getElementById('createClubBtn').click()">
                        Create a Club
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.filteredClubs.map(club => this.renderClubCard(club)).join('');

        // Attach click listeners
        grid.querySelectorAll('.club-card').forEach(card => {
            card.addEventListener('click', () => {
                const clubId = card.dataset.clubId;
                this.showClubDetail(clubId);
            });
        });
    }

    /**
     * Render single club card
     */
    renderClubCard(club) {
        const user = authService.getCurrentUser();
        const isMember = user && clubsService.isClubMember(club, user.uid);
        const isCreator = user && clubsService.isClubAdmin(club, user.uid);
        const hasPendingRequest = user && this.userRequests.some(r => r.clubId === club.id);
        const spotsLeft = club.capacity - club.memberCount;
        const statusClass = club.status === 'full' ? 'status-full' : 'status-active';

        return `
            <article class="club-card" data-club-id="${club.id}" tabindex="0" role="button">
                <div class="club-card-header" style="background: ${this.getCategoryGradient(club.category)};">
                    <span class="club-category-badge">${club.category}</span>
                    <span class="club-status-badge ${statusClass}">${club.status}</span>
                </div>

                <div class="club-card-body">
                    <h3 class="club-name">${this.escapeHtml(club.name)}</h3>
                    
                    <p class="club-description">${this.truncateText(this.escapeHtml(club.description), 120)}</p>

                    <div class="club-meta">
                        <div class="club-meta-item">
                            <span class="meta-icon">👥</span>
                            <span>${club.memberCount} / ${club.capacity} members</span>
                        </div>
                        <div class="club-meta-item">
                            <span class="meta-icon">📅</span>
                            <span>${club.meetingDay}s</span>
                        </div>
                        <div class="club-meta-item">
                            <span class="meta-icon">⏰</span>
                            <span>${club.meetingTime}</span>
                        </div>
                        <div class="club-meta-item">
                            <span class="meta-icon">📍</span>
                            <span>${this.escapeHtml(club.meetingLocation)}</span>
                        </div>
                    </div>

                    <div class="club-footer">
                        <div class="club-leader">
                            <span class="leader-icon">👤</span>
                            <span class="leader-name">${this.escapeHtml(club.createdByName)}</span>
                        </div>
                        
                        <div class="club-badges">
                            ${isCreator ? '<span class="badge badge-creator">Creator</span>' : ''}
                            ${isMember && !isCreator ? '<span class="badge badge-member">Member</span>' : ''}
                            ${hasPendingRequest ? '<span class="badge badge-pending">Pending</span>' : ''}
                            ${spotsLeft <= 5 && spotsLeft > 0 ? `<span class="badge badge-warning">${spotsLeft} spots left</span>` : ''}
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    /**
     * Show club detail modal
     */
    async showClubDetail(clubId) {
        const modal = document.getElementById('clubModal');
        const modalBody = document.getElementById('modalBody');
        
        if (!modal || !modalBody) return;

        const club = this.clubs.find(c => c.id === clubId);
        if (!club) return;

        const user = authService.getCurrentUser();
        const isMember = user && clubsService.isClubMember(club, user.uid);
        const isCreator = user && clubsService.isClubAdmin(club, user.uid);
        const hasPendingRequest = user && this.userRequests.some(r => r.clubId === club.id);
        const canJoin = user && !isMember && !hasPendingRequest && club.status !== 'full';

        // Load join requests if user is creator
        let joinRequests = [];
        if (isCreator) {
            console.log('Fetching join requests for club:', clubId); // Debug
            const result = await clubsService.getClubJoinRequests(clubId);
            console.log('Join requests result:', result); // Debug
            if (result.success) {
                joinRequests = result.requests;
                console.log('Number of requests:', joinRequests.length); // Debug
            } else {
                console.error('Failed to fetch join requests:', result.error); // Debug
            }
        }

        modalBody.innerHTML = `
            <div class="club-detail">
                <div class="club-detail-header" style="background: ${this.getCategoryGradient(club.category)};">
                    <div class="club-detail-header-content">
                        <span class="club-detail-category">${club.category}</span>
                        <h2 id="modalTitle" class="club-detail-title">${this.escapeHtml(club.name)}</h2>
                        <div class="club-detail-stats">
                            <span class="stat-item">
                                <strong>${club.memberCount}</strong> / ${club.capacity} Members
                            </span>
                            <span class="stat-divider">•</span>
                            <span class="stat-item status-${club.status}">${club.status.toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                <div class="club-detail-body">
                    <div class="club-detail-section">
                        <h3>About This Club</h3>
                        <p>${this.escapeHtml(club.description)}</p>
                    </div>

                    <div class="club-detail-grid">
                        <div class="detail-card">
                            <div class="detail-card-icon">📅</div>
                            <div class="detail-card-content">
                                <strong>Meeting Schedule</strong>
                                <p>${club.meetingDay}s at ${club.meetingTime}</p>
                            </div>
                        </div>

                        <div class="detail-card">
                            <div class="detail-card-icon">📍</div>
                            <div class="detail-card-content">
                                <strong>Location</strong>
                                <p>${this.escapeHtml(club.meetingLocation)}</p>
                            </div>
                        </div>

                        <div class="detail-card">
                            <div class="detail-card-icon">📧</div>
                            <div class="detail-card-content">
                                <strong>Contact</strong>
                                <p><a href="mailto:${club.contactEmail}">${club.contactEmail}</a></p>
                                ${club.contactPhone ? `<p>${club.contactPhone}</p>` : ''}
                            </div>
                        </div>

                        <div class="detail-card">
                            <div class="detail-card-icon">👤</div>
                            <div class="detail-card-content">
                                <strong>Club Leader</strong>
                                <p>${this.escapeHtml(club.createdByName)}</p>
                            </div>
                        </div>
                        </div>

                    ${club.requirements ? `
                        <div class="club-detail-section">
                            <h3>Requirements</h3>
                            <p>${this.escapeHtml(club.requirements)}</p>
                        </div>
                    ` : ''}

                    ${club.socialLinks && Object.keys(club.socialLinks).length > 0 ? `
                        <div class="club-detail-section">
                            <h3>Social Links</h3>
                            <div class="social-links">
                                ${club.socialLinks.website ? `<a href="${club.socialLinks.website}" target="_blank" class="social-link">🌐 Website</a>` : ''}
                                ${club.socialLinks.instagram ? `<a href="${club.socialLinks.instagram}" target="_blank" class="social-link">📷 Instagram</a>` : ''}
                                ${club.socialLinks.twitter ? `<a href="${club.socialLinks.twitter}" target="_blank" class="social-link">🐦 Twitter</a>` : ''}
                                ${club.socialLinks.discord ? `<a href="${club.socialLinks.discord}" target="_blank" class="social-link">💬 Discord</a>` : ''}
                            </div>
                        </div>
                    ` : ''}

                    <div class="club-detail-section">
                        <h3>Members (${club.memberCount})</h3>
                        <div class="members-grid">
                            ${club.members.map(member => `
                                <div class="member-card">
                                    <div class="member-avatar">${member.userName.charAt(0).toUpperCase()}</div>
                                    <div class="member-info">
                                        <strong>${this.escapeHtml(member.userName)}</strong>
                                        <span class="member-role">${member.role}</span>
                                    </div>
                                    ${isCreator && member.userId !== user.uid ? `
                                        <button class="btn-icon-danger" onclick="window.clubsViewInstance.removeMember('${clubId}', '${member.userId}')" title="Remove member">
                                            ✕
                                        </button>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    ${isCreator && joinRequests.length > 0 ? `
                        <div class="club-detail-section">
                            <h3>Join Requests (${joinRequests.length})</h3>
                            <div class="requests-list">
                                ${joinRequests.map(request => `
                                    <div class="request-card">
                                        <div class="request-info">
                                            <div class="request-avatar">${request.userName.charAt(0).toUpperCase()}</div>
                                            <div class="request-details">
                                                <strong>${this.escapeHtml(request.userName)}</strong>
                                                ${request.message ? `<p class="request-message">"${this.escapeHtml(request.message)}"</p>` : ''}
                                            </div>
                                        </div>
                                        <div class="request-actions">
                                            <button class="btn btn-sm btn-primary" onclick="window.clubsViewInstance.acceptRequest('${request.id}', '${clubId}')">
                                                Accept
                                            </button>
                                            <button class="btn btn-sm btn-secondary" onclick="window.clubsViewInstance.rejectRequest('${request.id}')">
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <div class="club-actions">
                        ${canJoin ? `
                            <button class="btn btn-primary btn-block" id="joinClubBtn" data-club-id="${clubId}">
                                Request to Join
                            </button>
                        ` : ''}
                        
                        ${hasPendingRequest ? `
                            <button class="btn btn-secondary btn-block" id="cancelRequestBtn" data-club-id="${clubId}">
                                Cancel Request
                            </button>
                            <p class="request-status">⏳ Your join request is pending approval</p>
                        ` : ''}

                        ${isMember && !isCreator ? `
                            <button class="btn btn-accent btn-block" onclick="window.clubsViewInstance.leaveClub('${clubId}')">
                                Leave Club
                            </button>
                        ` : ''}

                        ${isCreator ? `
                            <div class="admin-actions">
                                <button class="btn btn-primary" onclick="window.clubsViewInstance.editClub('${clubId}')">
                                    ✏️ Edit Club
                                </button>
                                <button class="btn btn-accent" onclick="window.clubsViewInstance.deleteClub('${clubId}')">
                                    🗑️ Delete Club
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Attach event listeners for join/cancel buttons
        const joinBtn = document.getElementById('joinClubBtn');
        const cancelBtn = document.getElementById('cancelRequestBtn');

        if (joinBtn) {
            joinBtn.addEventListener('click', () => this.showJoinRequestForm(clubId));
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelJoinRequest(clubId));
        }
    }

    /**
     * Show join request form
     */
    showJoinRequestForm(clubId) {
        const club = this.clubs.find(c => c.id === clubId);
        if (!club) return;

        const formHtml = `
            <div class="join-request-form">
                <h3>Request to Join ${this.escapeHtml(club.name)}</h3>
                <p class="form-description">Tell the club leader why you'd like to join (optional)</p>
                
                <form id="joinRequestForm">
                    <div class="form-group">
                        <label for="joinMessage" class="form-label">Message to Club Leader</label>
                        <textarea 
                            id="joinMessage" 
                            class="form-input"
                            rows="4"
                            maxlength="500"
                            placeholder="I'm interested in joining because..."></textarea>
                        <small class="form-hint">Optional - Max 500 characters</small>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="window.clubsViewInstance.closeModal()">
                            Cancel
                        </button>
                        <button type="submit" class="btn btn-primary">
                            Send Request
                        </button>
                    </div>
                </form>
            </div>
        `;

        const modalBody = document.getElementById('modalBody');
        if (modalBody) {
            modalBody.innerHTML = formHtml;

            const form = document.getElementById('joinRequestForm');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const message = document.getElementById('joinMessage').value.trim();
                    this.submitJoinRequest(clubId, message);
                });
            }
        }
    }

    /**
     * Submit join request
     */
    async submitJoinRequest(clubId, message) {
        const user = authService.getCurrentUser();
        if (!user) return;

        try {
            const result = await clubsService.requestToJoin(
                clubId, 
                user.uid, 
                user.displayName || user.email,
                message
            );

            if (result.success) {
                this.showToast('Join request sent successfully!', 'success');
                await this.loadUserRequests();
                this.closeModal();
                await this.loadClubs();
            } else {
                this.showToast(result.error, 'error');
            }
        } catch (error) {
            console.error('Error submitting join request:', error);
            this.showToast('Failed to send request', 'error');
        }
    }

    /**
     * Cancel join request
     */
    async cancelJoinRequest(clubId) {
        const user = authService.getCurrentUser();
        if (!user) return;

        if (!confirm('Are you sure you want to cancel your join request?')) {
            return;
        }

        try {
            const result = await clubsService.cancelJoinRequest(clubId, user.uid);

            if (result.success) {
                this.showToast('Request canceled', 'info');
                await this.loadUserRequests();
                this.closeModal();
                await this.loadClubs();
            } else {
                this.showToast(result.error, 'error');
            }
        } catch (error) {
            console.error('Error canceling request:', error);
            this.showToast('Failed to cancel request', 'error');
        }
    }

    /**
     * Accept join request
     */
    async acceptRequest(requestId, clubId) {
        try {
            const result = await clubsService.acceptJoinRequest(requestId, clubId);

            if (result.success) {
                this.showToast('Member added successfully!', 'success');
                await this.loadClubs();
                this.showClubDetail(clubId);
            } else {
                this.showToast(result.error, 'error');
            }
        } catch (error) {
            console.error('Error accepting request:', error);
            this.showToast('Failed to accept request', 'error');
        }
    }

    /**
     * Reject join request
     */
    async rejectRequest(requestId) {
        if (!confirm('Are you sure you want to reject this request?')) {
            return;
        }

        try {
            const result = await clubsService.rejectJoinRequest(requestId);

            if (result.success) {
                this.showToast('Request rejected', 'info');
                const clubId = this.clubs.find(c => 
                    c.id === this.userRequests.find(r => r.id === requestId)?.clubId
                )?.id;
                if (clubId) {
                    this.showClubDetail(clubId);
                }
            } else {
                this.showToast(result.error, 'error');
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
            this.showToast('Failed to reject request', 'error');
        }
    }

    /**
     * Remove member from club
     */
    async removeMember(clubId, memberId) {
        if (!confirm('Are you sure you want to remove this member?')) {
            return;
        }

        try {
            const result = await clubsService.removeMember(clubId, memberId);

            if (result.success) {
                this.showToast('Member removed', 'info');
                await this.loadClubs();
                this.showClubDetail(clubId);
            } else {
                this.showToast(result.error, 'error');
            }
        } catch (error) {
            console.error('Error removing member:', error);
            this.showToast('Failed to remove member', 'error');
        }
    }

    /**
     * Leave club
     */
    async leaveClub(clubId) {
        if (!confirm('Are you sure you want to leave this club?')) {
            return;
        }

        const user = authService.getCurrentUser();
        if (!user) return;

        try {
            const result = await clubsService.removeMember(clubId, user.uid);

            if (result.success) {
                this.showToast('You have left the club', 'info');
                await this.loadClubs();
                this.closeModal();
            } else {
                this.showToast(result.error, 'error');
            }
        } catch (error) {
            console.error('Error leaving club:', error);
            this.showToast('Failed to leave club', 'error');
        }
    }

    /**
     * Show create club form
     */
    showCreateClubForm() {
        this.showClubForm();
    }

    /**
     * Edit club
     */
    editClub(clubId) {
        const club = this.clubs.find(c => c.id === clubId);
        if (!club) return;

        this.closeModal();
        setTimeout(() => {
            this.showClubForm(club);
        }, 300);
    }

    /**
     * Show club form (create or edit)
     */
    showClubForm(club = null) {
        const modal = document.getElementById('clubFormModal');
        const formBody = document.getElementById('clubFormBody');
        
        if (!modal || !formBody) return;

        const isEdit = club !== null;

        formBody.innerHTML = `
            <div class="club-form-container">
                <h2 class="form-title">${isEdit ? 'Edit Club' : 'Create New Club'}</h2>
                <p class="form-subtitle">Fill in the details to ${isEdit ? 'update your' : 'create a new'} club</p>

                <form id="clubForm" class="club-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="clubName" class="form-label">Club Name *</label>
                            <input 
                                type="text" 
                                id="clubName" 
                                class="form-input"
                                value="${isEdit ? this.escapeHtml(club.name) : ''}"
                                required
                                maxlength="100"
                                placeholder="e.g., Photography Club">
                        </div>

                        <div class="form-group">
                            <label for="clubCategory" class="form-label">Category *</label>
                            <select id="clubCategory" class="form-input" required>
                                <option value="">Select category</option>
                                <option value="academic" ${isEdit && club.category === 'academic' ? 'selected' : ''}>Academic</option>
                                <option value="sports" ${isEdit && club.category === 'sports' ? 'selected' : ''}>Sports</option>
                                <option value="arts" ${isEdit && club.category === 'arts' ? 'selected' : ''}>Arts & Culture</option>
                                <option value="technology" ${isEdit && club.category === 'technology' ? 'selected' : ''}>Technology</option>
                                <option value="social" ${isEdit && club.category === 'social' ? 'selected' : ''}>Social</option>
                                <option value="volunteer" ${isEdit && club.category === 'volunteer' ? 'selected' : ''}>Volunteer</option>
                                <option value="professional" ${isEdit && club.category === 'professional' ? 'selected' : ''}>Professional</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="clubDescription" class="form-label">Description *</label>
                        <textarea 
                            id="clubDescription" 
                            class="form-input"
                            rows="4"
                            required
                            maxlength="500"
                            placeholder="Describe your club's mission, activities, and what makes it special...">${isEdit ? this.escapeHtml(club.description) : ''}</textarea>
                        <small class="form-hint">Max 500 characters</small>
                    </div>

                    <div class="form-section-title">Meeting Information</div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="meetingDay" class="form-label">Meeting Day *</label>
                            <select id="meetingDay" class="form-input" required>
                                <option value="">Select day</option>
                                <option value="Monday" ${isEdit && club.meetingDay === 'Monday' ? 'selected' : ''}>Monday</option>
                                <option value="Tuesday" ${isEdit && club.meetingDay === 'Tuesday' ? 'selected' : ''}>Tuesday</option>
                                <option value="Wednesday" ${isEdit && club.meetingDay === 'Wednesday' ? 'selected' : ''}>Wednesday</option>
                                <option value="Thursday" ${isEdit && club.meetingDay === 'Thursday' ? 'selected' : ''}>Thursday</option>
                                <option value="Friday" ${isEdit && club.meetingDay === 'Friday' ? 'selected' : ''}>Friday</option>
                                <option value="Saturday" ${isEdit && club.meetingDay === 'Saturday' ? 'selected' : ''}>Saturday</option>
                                <option value="Sunday" ${isEdit && club.meetingDay === 'Sunday' ? 'selected' : ''}>Sunday</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="meetingTime" class="form-label">Meeting Time *</label>
                            <input 
                                type="time" 
                                id="meetingTime" 
                                class="form-input"
                                value="${isEdit ? club.meetingTime : ''}"
                                required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="meetingLocation" class="form-label">Meeting Location *</label>
                            <input 
                                type="text" 
                                id="meetingLocation" 
                                class="form-input"
                                value="${isEdit ? this.escapeHtml(club.meetingLocation) : ''}"
                                required
                                placeholder="e.g., Building A, Room 301">
                        </div>

                        <div class="form-group">
                            <label for="clubCapacity" class="form-label">Member Capacity *</label>
                            <input 
                                type="number" 
                                id="clubCapacity" 
                                class="form-input"
                                value="${isEdit ? club.capacity : '20'}"
                                required
                                min="${isEdit ? club.memberCount : '1'}"
                                max="500">
                        </div>
                    </div>

                    <div class="form-section-title">Contact Information</div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="contactEmail" class="form-label">Contact Email *</label>
                            <input 
                                type="email" 
                                id="contactEmail" 
                                class="form-input"
                                value="${isEdit ? club.contactEmail : authService.getCurrentUser()?.email || ''}"
                                required
                                placeholder="club.email@university.edu">
                        </div>

                        <div class="form-group">
                            <label for="contactPhone" class="form-label">Contact Phone</label>
                            <input 
                                type="tel" 
                                id="contactPhone" 
                                class="form-input"
                                value="${isEdit && club.contactPhone ? club.contactPhone : ''}"
                                placeholder="+1 (555) 123-4567">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="clubRequirements" class="form-label">Requirements</label>
                        <textarea 
                            id="clubRequirements" 
                            class="form-input"
                            rows="3"
                            maxlength="300"
                            placeholder="Any prerequisites or requirements to join...">${isEdit && club.requirements ? this.escapeHtml(club.requirements) : ''}</textarea>
                    </div>

                    <div class="form-section-title">Social Links (Optional)</div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="socialWebsite" class="form-label">Website</label>
                            <input 
                                type="url" 
                                id="socialWebsite" 
                                class="form-input"
                                value="${isEdit && club.socialLinks?.website ? club.socialLinks.website : ''}"
                                placeholder="https://clubwebsite.com">
                        </div>

                        <div class="form-group">
                            <label for="socialInstagram" class="form-label">Instagram</label>
                            <input 
                                type="url" 
                                id="socialInstagram" 
                                class="form-input"
                                value="${isEdit && club.socialLinks?.instagram ? club.socialLinks.instagram : ''}"
                                placeholder="https://instagram.com/clubname">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="socialTwitter" class="form-label">Twitter</label>
                            <input 
                                type="url" 
                                id="socialTwitter" 
                                class="form-input"
                                value="${isEdit && club.socialLinks?.twitter ? club.socialLinks.twitter : ''}"
                                placeholder="https://twitter.com/clubname">
                        </div>

                        <div class="form-group">
                            <label for="socialDiscord" class="form-label">Discord</label>
                            <input 
                                type="url" 
                                id="socialDiscord" 
                                class="form-input"
                                value="${isEdit && club.socialLinks?.discord ? club.socialLinks.discord : ''}"
                                placeholder="https://discord.gg/invite">
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary btn-lg" onclick="window.clubsViewInstance.closeFormModal()">
                            Cancel
                        </button>
                        <button type="submit" class="btn btn-primary btn-lg">
                            ${isEdit ? 'Update Club' : 'Create Club'}
                        </button>
                    </div>
                </form>
            </div>
        `;

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        const form = document.getElementById('clubForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitClubForm(isEdit ? club.id : null);
            });
        }
    }

    /**
     * Submit club form
     */
    async submitClubForm(clubId = null) {
        const user = authService.getCurrentUser();
        if (!user) return;

        const formData = {
            name: document.getElementById('clubName').value.trim(),
            category: document.getElementById('clubCategory').value,
            description: document.getElementById('clubDescription').value.trim(),
            meetingDay: document.getElementById('meetingDay').value,
            meetingTime: document.getElementById('meetingTime').value,
            meetingLocation: document.getElementById('meetingLocation').value.trim(),
            capacity: parseInt(document.getElementById('clubCapacity').value),
            contactEmail: document.getElementById('contactEmail').value.trim(),
            contactPhone: document.getElementById('contactPhone').value.trim(),
            requirements: document.getElementById('clubRequirements').value.trim(),
            socialLinks: {
                website: document.getElementById('socialWebsite').value.trim(),
                instagram: document.getElementById('socialInstagram').value.trim(),
                twitter: document.getElementById('socialTwitter').value.trim(),
                discord: document.getElementById('socialDiscord').value.trim()
            }
        };

        try {
            let result;
            if (clubId) {
                // Update existing club
                result = await clubsService.updateClub(clubId, formData);
                if (result.success) {
                    this.showToast('Club updated successfully!', 'success');
                }
            } else {
                // Create new club
                result = await clubsService.createClub(
                    formData, 
                    user.uid, 
                    user.displayName || user.email
                );
                if (result.success) {
                    this.showToast('Club created successfully!', 'success');
                }
            }

            if (result.success) {
                this.closeFormModal();
                await this.loadClubs();
                this.switchView('my-clubs');
            } else {
                this.showToast(result.error, 'error');
            }
        } catch (error) {
            console.error('Error submitting club form:', error);
            this.showToast('Failed to save club', 'error');
        }
    }

    /**
     * Delete club
     */
    async deleteClub(clubId) {
        if (!confirm('Are you sure you want to delete this club? This action cannot be undone.')) {
            return;
        }

        const user = authService.getCurrentUser();
        if (!user) {
            this.showToast('You must be logged in to delete a club', 'error');
            return;
        }

        try {
            const result = await clubsService.deleteClub(clubId, user.uid);

            if (result.success) {
                this.showToast('Club deleted successfully', 'success');
                this.closeModal();
                await this.loadClubs();
            } else {
                this.showToast(result.error, 'error');
            }
        } catch (error) {
            console.error('Error deleting club:', error);
            this.showToast('Failed to delete club', 'error');
        }
    }

    /**
     * Render My Clubs view
     */

    async renderMyClubsView() {
        const user = authService.getCurrentUser();
        if (!user) return;

        const content = document.querySelector('.my-clubs-content');
        if (!content) return;

        content.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Loading your clubs...</p></div>';

        try {
            const [createdResult, memberResult] = await Promise.all([
                clubsService.getUserCreatedClubs(user.uid),
                clubsService.getUserMemberClubs(user.uid)
            ]);

            const createdClubs = createdResult.success ? createdResult.clubs : [];
            const memberClubs = memberResult.success ? memberResult.clubs.filter(c => c.createdBy !== user.uid) : [];

            console.log('Created clubs:', createdClubs); // Debug
            console.log('Member clubs:', memberClubs);   // Debug

            content.innerHTML = `
                <div class="my-clubs-sections">
                    <section class="my-clubs-section">
                        <h2 class="section-title">Clubs I Manage (${createdClubs.length})</h2>
                        ${createdClubs.length > 0 ? `
                            <div class="clubs-grid">
                                ${createdClubs.map(club => this.renderClubCard(club)).join('')}
                            </div>
                        ` : `
                            <div class="empty-state-small">
                                <p>You haven't created any clubs yet.</p>
                                <button class="btn btn-primary" onclick="window.clubsViewInstance.showCreateClubForm()">
                                    Create Your First Club
                                </button>
                            </div>
                        `}
                    </section>

                    <section class="my-clubs-section">
                        <h2 class="section-title">Clubs I'm a Member Of (${memberClubs.length})</h2>
                        ${memberClubs.length > 0 ? `
                            <div class="clubs-grid">
                                ${memberClubs.map(club => this.renderClubCard(club)).join('')}
                            </div>
                        ` : `
                            <div class="empty-state-small">
                                <p>You're not a member of any clubs yet.</p>
                                <button class="btn btn-primary" onclick="window.clubsViewInstance.switchView('browse')">
                                    Browse Clubs
                                </button>
                            </div>
                        `}
                    </section>
                </div>
            `;

            // Reattach click listeners
            content.querySelectorAll('.club-card').forEach(card => {
                card.addEventListener('click', () => {
                    const clubId = card.dataset.clubId;
                    this.showClubDetail(clubId);
                });
            });

        } catch (error) {
            console.error('Error loading user clubs:', error);
            content.innerHTML = '<div class="error-state"><p>Failed to load your clubs</p></div>';
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
        } else if (view === 'my-clubs') {
            document.getElementById('myClubsView').classList.add('active');
            this.renderMyClubsView();
        }
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Search with debounce
        const searchInput = document.getElementById('clubSearch');
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

        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.selectedStatus = e.target.value;
                this.applyFilters();
            });
        }

        // Clear filters
        const clearBtn = document.getElementById('clearFiltersBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearFilters());
        }

        // Create club button
        const createBtn = document.getElementById('createClubBtn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.showCreateClubForm());
        }

        // Tab buttons
        document.getElementById('browseTab')?.addEventListener('click', () => this.switchView('browse'));
        document.getElementById('myClubsTab')?.addEventListener('click', () => this.switchView('my-clubs'));

        // Modal close buttons
        document.getElementById('modalClose')?.addEventListener('click', () => this.closeModal());
        document.getElementById('modalOverlay')?.addEventListener('click', () => this.closeModal());
        document.getElementById('formModalClose')?.addEventListener('click', () => this.closeFormModal());
        document.getElementById('formModalOverlay')?.addEventListener('click', () => this.closeFormModal());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeFormModal();
            }
        });

        // Store instance globally for onclick handlers
        window.clubsViewInstance = this;
    }

    /**
     * Apply filters
     */
    applyFilters() {
        console.log('Search triggered for:', this.searchTerm);
        this.filteredClubs = this.clubs.filter(club => {
            const categoryMatch = this.selectedCategory === 'all' || club.category === this.selectedCategory;
            const statusMatch = this.selectedStatus === 'all' || club.status === this.selectedStatus;
            const searchMatch = !this.searchTerm || 
                               club.name.toLowerCase().includes(this.searchTerm) ||
                               club.description.toLowerCase().includes(this.searchTerm);

            return categoryMatch && statusMatch && searchMatch;
        });

        this.renderClubs();
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        this.searchTerm = '';
        this.selectedCategory = 'all';
        this.selectedStatus = 'all';
        
        const searchInput = document.getElementById('clubSearch');
        const categoryFilter = document.getElementById('categoryFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = 'all';
        if (statusFilter) statusFilter.value = 'all';
        
        this.applyFilters();
    }

    /**
     * Get category gradient
     */
    getCategoryGradient(category) {
        const gradients = {
            academic: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            sports: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            arts: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            technology: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            social: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            volunteer: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
            professional: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
        };
        return gradients[category] || gradients.academic;
    }

    /**
     * Truncate text
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Close club detail modal
     */
    closeModal() {
        const modal = document.getElementById('clubModal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    /**
     * Close club form modal
     */
    closeFormModal() {
        const modal = document.getElementById('clubFormModal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        const grid = document.getElementById('clubsGrid');
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

    /**
     * Cleanup when view is destroyed
     */
    destroy() {
        window.clubsViewInstance = null;
    }
}

export default ClubsView;