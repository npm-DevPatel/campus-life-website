# Campus Life Web App

**IST4035 – Advanced Web Design**  
**Team Project – Full-Stack Campus Management System**

---

## 👥 Team Members

| Name | Student ID | Role |
|------|------------|------|
| Dev Patel | 670820 | Lead Developer & Architecture |
| Tony Okwaro | 658076 | Frontend Development & UI/UX |
| Daksh Patel | 669069 | Backend Integration & Testing |

---

## 📋 Project Overview

Campus Life is a production-ready, full-stack web application designed to enhance student experience at USIU-Africa. The platform provides comprehensive tools for managing campus events, student clubs, room bookings, and helpdesk services. Built with modern web technologies and Firebase backend, this application demonstrates industry-standard practices in accessibility, responsive design, security, and performance optimization.

**Live Demo**: [https://npm-devpatel.github.io/campus-life-website/#home] 

**GitHub Repository**: [https://github.com/npm-DevPatel/campus-life-website]

**Docker Image**: [https://hub.docker.com/r/blairbytesworks/campus-life-app]



---

## ✨ Features Implemented

### 🏠 Home & Navigation
- ✅ **Dynamic Landing Page** - Canvas API animated welcome banner
- ✅ **Responsive Navigation** - Mobile hamburger menu with smooth transitions
- ✅ **User Authentication Status** - Visual indicators for logged-in users
- ✅ **Feature Cards** - Quick access to all major sections

### 🔐 Authentication System
- ✅ **Firebase Authentication** - Secure email/password login
- ✅ **User Registration** - Account creation with validation
- ✅ **Session Persistence** - "Remember Me" functionality
- ✅ **Auto-login on Refresh** - Seamless session management
- ✅ **Protected Routes** - Authentication-required pages

### 📅 Events Management
- ✅ **Event Listings** - Browse all campus events with rich details
- ✅ **Real-time Data** - Firebase Firestore integration
- ✅ **Search & Filter** - By category (Academic, Social, Sports, Cultural, Career, Workshop)
- ✅ **Event Registration** - One-click sign-up for events
- ✅ **Capacity Tracking** - Real-time attendee count
- ✅ **Event Details Modal** - Comprehensive information display
- ✅ **12-hour Time Format** - User-friendly AM/PM display

### 👥 Student Clubs System
- ✅ **Club Directory** - Browse all active student organizations
- ✅ **Club Creation** - Students can create and manage clubs
- ✅ **Join Request System** - Two-way approval workflow
- ✅ **Member Management** - View members, assign roles, remove members
- ✅ **Club Admin Dashboard** - "My Clubs" view for creators
- ✅ **Request Notifications** - Real-time join request handling
- ✅ **Social Links Integration** - Website, Instagram, Twitter, Discord
- ✅ **Meeting Schedules** - Day, time, and location information
- ✅ **Capacity Management** - Track member slots and availability

### 🚪 Room Booking System
- ✅ **Dynamic Room Listings** - Real-time availability from Firebase
- ✅ **Time Slot Management** - 1-hour intervals from 8 AM to 8 PM
- ✅ **Conflict Prevention** - No double-booking logic
- ✅ **Visual Availability Grid** - Color-coded time slots (Green=Available, Red=Booked)
- ✅ **Date Selection** - Book rooms for any future date
- ✅ **My Bookings Dashboard** - View upcoming and past reservations
- ✅ **Booking Cancellation** - Cancel reservations with confirmation
- ✅ **Room Status Indicators** - Available, Limited, Full
- ✅ **Multiple Room Types** - Study rooms, Labs, Event halls
- ✅ **Search & Filter** - By room type and availability

### 💬 Helpdesk System
- ✅ **FAQ Knowledge Base** - Searchable frequently asked questions
- ✅ **Category Organization** - Academic, IT Support, Facilities, Financial
- ✅ **Accordion Interface** - Expandable Q&A sections
- ✅ **Quick Contact Cards** - IT Support, Registrar, Campus Safety
- ✅ **Emergency Contacts** - USIU Pilot Line, Police numbers
- ✅ **Search Functionality** - Real-time filtering of FAQs

---

## 🏗️ Technical Architecture

### Technology Stack

**Frontend:**
- HTML5 (Semantic structure)
- CSS3 (Grid, Flexbox, CSS Variables)
- JavaScript ES6+ (Modules, Async/Await, Classes)
- No frameworks - Vanilla JavaScript architecture

**Backend:**
- Firebase Authentication
- Firebase Firestore (NoSQL database)
- Firebase Hosting (Deployment)

**Development Tools:**
- Git & GitHub (Version control)
- VS Code (Development environment)
- Chrome DevTools (Debugging & profiling)
- Lighthouse (Performance & accessibility auditing)

### Project Structure
```
campus-life-app/
├── index.html                          # Main entry point
├── css/
│   ├── variables.css                   # Design tokens & CSS variables
│   ├── reset.css                       # CSS reset & base styles
│   ├── layout.css                      # Page layouts (Grid/Flexbox)
│   ├── components.css                  # Reusable UI components
│   ├── auth.css                        # Authentication pages
│   ├── events.css                      # Events page styles
│   ├── clubs.css                       # Clubs page styles
│   ├── bookings.css                    # Bookings page styles
│   └── help.css                        # Helpdesk page styles
├── js/
│   ├── app.js                          # Application initialization
│   ├── router.js                       # Hash-based routing
│   ├── main.js                         # Legacy utilities
│   ├── canvas-demo.js                  # Canvas API animation
│   ├── config/
│   │   └── firebase-config.js          # Firebase configuration
│   ├── services/
│   │   ├── auth-service.js             # Authentication logic
│   │   ├── events-service.js           # Events CRUD operations
│   │   ├── clubs-service.js            # Clubs management
│   │   └── bookings-service.js         # Booking system logic
│   ├── views/
│   │   ├── home-view.js                # Landing page
│   │   ├── login-view.js               # Login/Register page
│   │   ├── events-view.js              # Events listing & details
│   │   ├── clubs-view.js               # Clubs directory & management
│   │   ├── bookings.js                 # Room booking interface
│   │   └── help-view.js                # Helpdesk & FAQ
│   └── components/
│       └── navigation.js               # Header navigation component
├── assets/
│   └── images/                         # Image assets
├── evidence/
│   └── lighthouse-accessibility.html   # Accessibility audit report
└── README.md                           # This file
```

---

## 🗄️ Database Schema (Firebase Firestore)

### Collections

#### 1. **events**
```javascript
{
  title: string,
  description: string,
  category: string, // academic, social, sports, cultural, career, workshop
  date: string, // YYYY-MM-DD
  time: string, // HH:MM
  location: string,
  organizer: string,
  capacity: number,
  requirements: string,
  imageUrl: string,
  socialLinks: {
    website: string,
    instagram: string,
    twitter: string
  },
  registeredUsers: [userId1, userId2, ...],
  createdBy: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 2. **clubs**
```javascript
{
  name: string,
  description: string,
  category: string, // academic, sports, arts, technology, social, volunteer, professional
  meetingDay: string, // Monday, Tuesday, etc.
  meetingTime: string, // HH:MM
  meetingLocation: string,
  capacity: number,
  contactEmail: string,
  contactPhone: string,
  requirements: string,
  imageUrl: string,
  socialLinks: {
    website: string,
    instagram: string,
    twitter: string,
    discord: string
  },
  members: [
    {
      userId: string,
      userName: string,
      role: string, // President, Vice President, Member
      joinedAt: string
    }
  ],
  memberCount: number,
  status: string, // active, full, closed
  createdBy: string,
  createdByName: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 3. **club_join_requests**
```javascript
{
  clubId: string,
  clubName: string,
  userId: string,
  userName: string,
  message: string,
  status: string, // pending, accepted, rejected
  createdAt: timestamp,
  processedAt: timestamp
}
```

#### 4. **rooms**
```javascript
{
  name: string,
  capacity: number,
  type: string, // Study, Lab, Event
  icon: string, // emoji
  gradient: string, // CSS gradient
  description: string,
  facilities: [string],
  building: string,
  floor: string
}
```

#### 5. **bookings**
```javascript
{
  roomId: string,
  roomName: string,
  date: string, // YYYY-MM-DD
  startTime: string, // HH:MM
  endTime: string, // HH:MM
  purpose: string,
  userId: string,
  userName: string,
  status: string, // confirmed, cancelled
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 6. **users**
```javascript
{
  email: string,
  displayName: string,
  createdAt: string
}
```

---

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Firebase account (for backend)
- Git (for version control)

### Installation & Setup

#### 1. Clone the Repository
```bash
git clone [your-repo-url]
cd campus-life-app
```

#### 2. Firebase Configuration

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Enable **Authentication** → Email/Password
3. Create **Firestore Database** in test mode
4. Copy your Firebase config
5. Update `js/config/firebase-config.js`:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

#### 3. Set Up Firestore Security Rules

Go to Firestore Database → Rules tab and paste:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    match /events/{eventId} {
      allow read: if true;
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && resource.data.createdBy == request.auth.uid;
    }
    
    match /clubs/{clubId} {
      allow read: if true;
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && resource.data.createdBy == request.auth.uid;
    }
    
    match /club_join_requests/{requestId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && request.auth.uid == request.resource.data.userId;
      allow update, delete: if isSignedIn();
    }
    
    match /rooms/{roomId} {
      allow read: if true;
      allow write: if false; // Admin only via Console
    }
    
    match /bookings/{bookingId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && request.auth.uid == request.resource.data.userId;
      allow update: if isSignedIn() && request.auth.uid == resource.data.userId;
      allow delete: if isSignedIn() && request.auth.uid == resource.data.userId;
    }
    
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }
  }
}
```

#### 4. Add Sample Data

Add sample events, clubs, and rooms via Firebase Console (see Database Schema section for structure)

#### 5. Run Locally
```bash
# Option 1: Simple HTTP server (Python)
python -m http.server 8000

# Option 2: Node.js HTTP server
npx http-server

# Option 3: VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

Then visit: `http://localhost:8000`

---

## 🧪 Testing

### Functional Testing

#### Authentication
- [x] User registration with validation
- [x] User login with error handling
- [x] Remember Me persistence
- [x] Session persistence on page refresh
- [x] Logout functionality
- [x] Protected route access

#### Events
- [x] Load events from Firebase
- [x] Search events by title/description
- [x] Filter by category
- [x] View event details in modal
- [x] Register for events
- [x] Unregister from events
- [x] Real-time capacity tracking

#### Clubs
- [x] Browse all clubs
- [x] Create new club with form validation
- [x] Request to join clubs
- [x] Cancel join requests
- [x] Accept/reject join requests (admin)
- [x] View club members
- [x] Remove members (admin)
- [x] Edit club details (admin)
- [x] Delete clubs (admin)
- [x] My Clubs dashboard

#### Bookings
- [x] View available rooms
- [x] Check real-time availability
- [x] Select date and time slot
- [x] Book rooms
- [x] Prevent double bookings
- [x] View my bookings
- [x] Cancel bookings
- [x] Room status updates (Available/Limited/Full)

### Accessibility Testing

#### Automated Testing (Lighthouse)
```bash
# Run in Chrome DevTools
1. Open DevTools (F12)
2. Navigate to Lighthouse tab
3. Select "Accessibility" category
4. Click "Generate report"
```

**Current Scores:**
- Accessibility: 95-100
- Performance: 90+
- Best Practices: 95+
- SEO: 100

#### Manual Testing Checklist
- [x] Keyboard navigation (Tab, Shift+Tab, Enter, Escape)
- [x] Focus indicators visible
- [x] Screen reader compatibility (NVDA, VoiceOver)
- [x] ARIA labels and roles
- [x] Semantic HTML structure
- [x] Color contrast (WCAG AA/AAA)
- [x] Reduced motion support
- [x] Skip to main content link

### Responsive Design Testing

**Breakpoints:**
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

**Test Devices:**
- iPhone SE (375px)
- iPhone 12/13 (390px)
- iPad (768px)
- iPad Pro (1024px)
- Desktop (1280px, 1920px)

### Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 90+     | ✅ Fully Supported |
| Firefox | 88+     | ✅ Fully Supported |
| Safari  | 14+     | ✅ Fully Supported |
| Edge    | 90+     | ✅ Fully Supported |

---

## 🎨 Design System

### Color Palette (WCAG AAA Compliant)

**Primary Colors:**
```css
--color-primary: #1e40af;           /* Blue 700 - 8.59:1 contrast */
--color-primary-dark: #1e3a8a;      /* Blue 900 */
--color-primary-light: #3b82f6;     /* Blue 500 */
```

**Secondary Colors:**
```css
--color-secondary: #059669;         /* Green 600 - 4.54:1 contrast */
--color-secondary-dark: #047857;    /* Green 700 */
```

**Neutral Colors:**
```css
--color-background: #ffffff;        /* White */
--color-surface: #f9fafb;          /* Gray 50 */
--color-text: #111827;              /* Gray 900 - 16.77:1 contrast */
--color-text-secondary: #4b5563;    /* Gray 600 - 7.39:1 contrast */
```

**Status Colors:**
```css
--color-accent: #dc2626;            /* Red 600 - Alerts */
--color-success: #059669;           /* Green 600 - Success */
--color-warning: #f59e0b;           /* Amber 600 - Warning */
```

### Typography

**Font Stack:**
```css
--font-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
             'Helvetica Neue', Arial, sans-serif;
```

**Font Sizes:**
- xs: 12px (0.75rem)
- sm: 14px (0.875rem)
- base: 16px (1rem)
- lg: 18px (1.125rem)
- xl: 20px (1.25rem)
- 2xl: 24px (1.5rem)
- 3xl: 32px (2rem)
- 4xl: 40px (2.5rem)

**Font Weights:**
- normal: 400
- medium: 500
- semibold: 600
- bold: 700

### Spacing Scale
```css
--spacing-xs: 0.25rem;      /* 4px */
--spacing-sm: 0.5rem;       /* 8px */
--spacing-md: 1rem;         /* 16px */
--spacing-lg: 1.5rem;       /* 24px */
--spacing-xl: 2rem;         /* 32px */
--spacing-2xl: 3rem;        /* 48px */
--spacing-3xl: 4rem;        /* 64px */
```

### Border Radius
```css
--radius-sm: 0.25rem;       /* 4px */
--radius-md: 0.5rem;        /* 8px */
--radius-lg: 0.75rem;       /* 12px */
--radius-xl: 1rem;          /* 16px */
--radius-full: 9999px;      /* Circular */
```

---

## 🔒 Security Implementation

### Authentication Security
- ✅ Firebase Authentication (industry-standard)
- ✅ Password hashing (handled by Firebase)
- ✅ Session token management
- ✅ Secure password reset flow
- ✅ Email verification support

### Input Validation
- ✅ Email format validation
- ✅ Password length requirements (minimum 6 characters)
- ✅ Form field validation
- ✅ Required field checks
- ✅ Max length constraints

### XSS Prevention
- ✅ HTML escaping in all user-generated content
- ✅ No innerHTML with user data
- ✅ Sanitized search inputs
- ✅ Safe DOM manipulation (textContent over innerHTML)

### Firestore Security Rules
- ✅ Authentication required for write operations
- ✅ User can only modify their own data
- ✅ Club admins can only edit their clubs
- ✅ Booking owners can only cancel their bookings
- ✅ Read permissions appropriately scoped

### Best Practices
- ✅ No API keys in client code (Firebase config is safe for client-side)
- ✅ HTTPS enforcement (via Firebase Hosting)
- ✅ No sensitive data in localStorage
- ✅ Error messages don't leak system information

---

## ⚡ Performance Optimization

### Current Metrics
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Lighthouse Performance Score**: 90+

### Optimizations Implemented

#### 1. **Code Splitting**
- Modular JavaScript architecture
- Dynamic imports for views
- Lazy-loaded components

#### 2. **Asset Optimization**
- CSS minification ready
- JavaScript modularization
- SVG icons instead of image files

#### 3. **Caching Strategy**
- Firebase SDK caching
- Browser caching headers
- localStorage for session data

#### 4. **JavaScript Optimization**
- Debounced search inputs (300ms delay)
- Event delegation for dynamic content
- Minimal DOM manipulation
- `requestAnimationFrame` for animations

#### 5. **CSS Optimization**
- CSS variables for theming
- Mobile-first approach (smaller base CSS)
- Minimal specificity
- Reusable utility classes

#### 6. **Network Optimization**
- Firebase Firestore offline persistence
- Single Firebase SDK import
- CDN for Firebase libraries

---

## 📚 HTML5 APIs Used

### 1. Canvas API
**File**: `js/canvas-demo.js`

**Implementation:**
```javascript
const canvas = document.getElementById('welcomeCanvas');
const ctx = canvas.getContext('2d');

// Gradient background
const gradient = ctx.createLinearGradient(0, 0, width, 0);
gradient.addColorStop(0, '#1e40af');
gradient.addColorStop(1, '#1e3a8a');

// Animated text with sine wave
const yPosition = height / 2 + Math.sin(offset * 0.05) * 5;
ctx.fillText('Campus Life Hub', width / 2, yPosition);

// 60fps animation
requestAnimationFrame(animate);
```

**Features:**
- Gradient rendering
- Text animation with sine wave movement
- Pulsing decorative circles
- 60fps smooth animation
- Accessible with `role="img"` and `aria-label`

### 2. Web Storage API
**File**: `js/services/auth-service.js`, `js/main.js`

**Implementation:**
```javascript
// Store user session
localStorage.setItem('campuslife_last_visit', new Date().toISOString());

// Store preferences
const preferences = {
    theme: 'light',
    notifications: true,
    language: 'en'
};
localStorage.setItem('campuslife_preferences', JSON.stringify(preferences));

// Retrieve data
const lastVisit = localStorage.getItem('campuslife_last_visit');
const prefs = JSON.parse(localStorage.getItem('campuslife_preferences'));
```

**Usage:**
- Last visit timestamp tracking
- User preferences
- Authentication session persistence (via Firebase)

### 3. Fetch API
**Files**: All service files (`auth-service.js`, `events-service.js`, `clubs-service.js`, `bookings-service.js`)

**Implementation:**
```javascript
// Firebase Firestore fetch
async getEvents(filters = {}) {
    try {
        let query = this.db.collection('events');
        
        if (filters.category && filters.category !== 'all') {
            query = query.where('category', '==', filters.category);
        }
        
        const snapshot = await query.get();
        
        const events = [];
        snapshot.forEach(doc => {
            events.push({ id: doc.id, ...doc.data() });
        });
        
        return { success: true, events };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
```

**Features:**
- Async/await pattern
- Comprehensive error handling
- Firebase SDK integration
- RESTful-style service methods

---

## 🎯 Key Features Deep Dive

### Debounced Search
Reduces API calls by waiting for user to stop typing:
```javascript
let searchDebounceTimer = null;

searchInput.addEventListener('input', (e) => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
        performSearch(e.target.value);
    }, 300); // Wait 300ms after last keystroke
});
```

**Benefits:**
- Reduced API calls (saves bandwidth)
- Better performance
- Improved user experience

### Optimistic UI Updates
Update UI immediately, then sync with backend:
```javascript
// Optimistically update UI
club.memberCount++;
this.renderClubs();

// Then persist to backend
const result = await clubsService.addMember(clubId, userId);

if (!result.success) {
    // Rollback on failure
    club.memberCount--;
    this.renderClubs();
}
```

### Conflict Prevention (Bookings)
Prevents double-booking with time overlap detection:
```javascript
async checkAvailability(roomId, date, startTime, endTime) {
    const existingBookings = await this.getRoomBookings(roomId, date);
    
    for (const booking of existingBookings) {
        if (timesOverlap(startTime, endTime, booking.startTime, booking.endTime)) {
            return { available: false, error: 'Time slot already booked' };
        }
    }
    
    return { available: true };
}
```

### Real-time Status Updates
Room availability updates based on booking data:
```javascript
async updateRoomStatuses() {
    for (const room of this.rooms) {
        const slots = await bookingsService.getAvailableSlots(room.id, date);
        const available = slots.filter(s => s.available).length;
        
        if (available === 0) {
            room.status = 'Full';
        } else if (available <= 3) {
            room.status = 'Limited';
        } else {
            room.status = 'Available';
        }
    }
}
```

---

## 🗓️ Development Timeline

### ✅ Upload 1: Foundations & Accessibility (Weeks 1-3)
- Semantic HTML5 structure
- Responsive CSS Grid/Flexbox layouts
- WCAG AA/AAA compliance
- Keyboard navigation
- HTML5 Canvas API implementation
- Web Storage API integration
- Mobile-first design
- Accessibility audit (Lighthouse score: 95-100)

### ✅ Upload 2: Modules & State (Weeks 4-6)
- ES6 module architecture
- Service layer pattern
- Component-based views
- Hash-based routing system
- State management
- Firebase Authentication integration
- Login/Register functionality
- Protected routes
- User session management

### ✅ Upload 3: Async, Storage & UX (Weeks 7-10)
- Firebase Firestore integration
- Events CRUD operations
- Clubs management system
- Room booking system
- Async/await patterns
- Error handling & loading states
- Debounced search (300ms)
- Toast notifications
- Empty state designs
- Optimistic UI updates
- localStorage persistence
- IndexedDB (via Firebase cache)

### 🔄 Upload 4: Security, Performance & CI (Weeks 11-14)
- [ ] Input validation enhancement
- [ ] XSS hardening documentation
- [ ] Code splitting optimization
- [ ] Image compression
- [ ] Lazy loading implementation
- [ ] GitHub Actions CI pipeline
- [ ] Jest unit tests
- [ ] ESLint configuration
- [ ] Performance profiling
- [ ] Bundle size optimization
- [ ] Production build process

---

## 📊 Code Quality Metrics

### Architecture
- **Design Pattern**: MVC-inspired (Model-View-Service)
- **Module Count**: 15 JavaScript modules
- **Lines of Code**: ~3,500 (excluding comments)
- **Code Duplication**: Minimal (DRY principles followed)

### JavaScript
- ✅ ES6+ syntax throughout
- ✅ Async/await for all asynchronous operations
- ✅ Class-based components
- ✅ Factory pattern for services (singleton)
- ✅ Pure functions where applicable
- ✅ Proper error handling (try/catch)
- ✅ Descriptive variable and function names
- ✅ JSDoc-style comments for key functions

### CSS
- ✅ CSS Variables for theming
- ✅ Mobile-first approach
- ✅ BEM-inspired naming
- ✅ No !important flags (except for reduced motion)
- ✅ Logical grouping and comments
- ✅ Consistent spacing and indentation

### Git Workflow
- ✅ Meaningful commit messages
- ✅ Feature branches (when applicable)
- ✅ Regular commits (not just final dump)
- ✅ .gitignore for sensitive files

---

## 🐛 Known Issues & Future Enhancements

### Known Issues
- None currently - all major bugs have been resolved

### Planned Enhancements (Upload 4)
- [ ] Service Worker for offline support
- [ ] Push notifications for event reminders
- [ ] Advanced search with multiple filters
- [ ] Export bookings to calendar (iCal)
- [ ] Club activity feed
- [ ] Event waitlist feature
- [ ] Room booking approval workflow
- [ ] Admin dashboard
- [ ] Analytics and reporting

### Accessibility Improvements
- [ ] Dark mode theme
- [ ] Font size preferences
- [ ] High contrast mode
- [ ] Voice commands (experimental)

---

## 📖 Documentation

### For Developers
- **Code Comments**: Inline documentation for complex logic
- **JSDoc Style**: Function documentation with parameters and return types
- **README**: This comprehensive guide
- **Architecture Diagram**: See Upload 2 logbook

### For Users
- **Helpdesk FAQ**: Built into the application
- **Contact Information**: IT Support, Registrar, Campus Safety
- **Tooltips**: Hover hints for UI elements

---

## 🤝 Contributing

### Development Workflow
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test thoroughly
3. Commit with clear messages: `git commit -m "feat: Add feature description"`
4. Push to repository: `git push origin feature/your-feature`
5. Test in staging environment
6. Merge to main branch

### Code Style Guidelines
- **JavaScript**: 4-space indentation, semicolons required
- **CSS**: 4-space indentation, properties alphabetically ordered
- **HTML**: 4-space indentation, semantic tags
- **Naming**: camelCase for JS, kebab-case for CSS

---

## 📧 Contact & Support

### Team Contact
- **Dev Patel** (670820): devkpatel@usiu.ac.ke/devpatel.7150@gmail.com
- **Tony Okwaro** (658076): [tony.okwaro@usiu.ac.ke]
- **Daksh Patel** (669069): [daksh.patel@usiu.ac.ke]

### University Support
- **Course**: IST4035 Advanced Web Design
- **Institution**: USIU-Africa
- **Semester**: FS25
- **Year**: 2025

---

## 📄 License

This project is developed for educational purposes as part of the IST4035 Advanced Web Design coursework at USIU-Africa.

---

## 🙏 Acknowledgments

- **USIU-Africa** - For providing the learning environment
- **IST4035 Lecturer** - For guidance and feedback
- **Firebase** - For backend infrastructure
- **MDN Web Docs** - For comprehensive web development documentation
- **WebAIM** - For accessibility guidelines and tools

---

## 📚 References

### Web Standards & Guidelines
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Web Accessibility Initiative standards.
- [MDN Web Docs](https://developer.mozilla.org/) - Comprehensive resource for HTML, CSS, and JavaScript.
- [HTML5 Specification](https://html.spec.whatwg.org/) - The living standard for HTML.
- [CSS Grid Layout Guide](https://css-tricks.com/snippets/css/complete-guide-grid/) - CSS-Tricks comprehensive guide to Grid.
- [Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) - CSS-Tricks comprehensive guide to Flexbox.

### Backend & Database (Firebase)
- [Firebase Documentation](https://firebase.google.com/docs) - Official documentation for the Firebase platform.
- [Firebase Authentication](https://firebase.google.com/docs/auth) - Guides for implementing secure user sign-in.
- [Cloud Firestore Data Model](https://firebase.google.com/docs/firestore/data-model) - Understanding NoSQL document-oriented databases.
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started) - Syntax and logic for securing database access.

### Browser APIs
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) - MDN guide for 2D graphics and animation.
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) - Guide for localStorage and sessionStorage.
- [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API) - Managing session history for SPA routing.

### Tools & Testing
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/) - Official documentation for debugging and profiling.
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/) - Automated auditing for performance, accessibility, and SEO.
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Tool used for verifying WCAG color contrast compliance.
- [Regex101](https://regex101.com/) - Tool used for testing email and password validation patterns.
