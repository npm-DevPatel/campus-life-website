/* ===========================
   HOME/DASHBOARD VIEW
   IST4035 - Campus Life App
   =========================== */

import authService from '../services/auth-service.js';

/**
 * Home/Dashboard view - Landing page with overview
 */

class HomeView {
    constructor() {
        this.canvasCleanup = null;
    }

    /**
     * Render home page
     */
    render() {
        const user = authService.getCurrentUser();
        
        return `
            <section class="hero" aria-labelledby="hero-title">
                <div class="container">
                    <h1 id="hero-title" class="hero-title">Welcome to Campus Life</h1>
                    <p class="hero-description">
                        Your central hub for events, clubs, room bookings, and support services
                    </p>
                    
                    ${user ? `
                        <p class="hero-welcome">
                            Hello, <strong>${user.displayName || user.email}</strong>! 👋
                        </p>
                    ` : ''}
                    
                    <div class="canvas-container">
                        <canvas 
                            id="welcomeCanvas" 
                            width="600" 
                            height="100"
                            role="img"
                            aria-label="Animated welcome banner showing Campus Life text">
                            Your browser does not support the canvas element. Please update to a modern browser.
                        </canvas>
                    </div>
                </div>
            </section>
            
            <section class="container" aria-labelledby="features-title">
                <h2 id="features-title" class="sr-only">Main Features</h2>
                
                <div class="features-grid">
                    <article class="feature-card ${user ? '' : 'feature-card-locked'}" data-link="${user ? 'events' : 'login'}" tabindex="0" role="button">
                        <span class="feature-icon" role="img" aria-label="Calendar icon">📅</span>
                        <h3 class="feature-title">Campus Events</h3>
                        <p class="feature-description">
                            Discover upcoming events, workshops, and activities happening around campus. 
                            Stay connected with your university community.
                        </p>
                        ${!user ? '<span class="feature-lock">🔒 Login required</span>' : ''}
                    </article>
                    
                    <article class="feature-card ${user ? '' : 'feature-card-locked'}" data-link="${user ? 'clubs' : 'login'}" tabindex="0" role="button">
                        <span class="feature-icon" role="img" aria-label="People icon">👥</span>
                        <h3 class="feature-title">Student Clubs</h3>
                        <p class="feature-description">
                            Explore student clubs and organizations. Find your passion and connect 
                            with like-minded students.
                        </p>
                        ${!user ? '<span class="feature-lock">🔒 Login required</span>' : ''}
                    </article>
                    
                    <article class="feature-card ${user ? '' : 'feature-card-locked'}" data-link="${user ? 'bookings' : 'login'}" tabindex="0" role="button">
                        <span class="feature-icon" role="img" aria-label="Building icon">🏢</span>
                        <h3 class="feature-title">Room Bookings</h3>
                        <p class="feature-description">
                            Reserve study rooms, meeting spaces, and facilities. Check availability and book instantly.
                        </p>
                        ${!user ? '<span class="feature-lock">🔒 Login required</span>' : ''}
                    </article>
                    
                    <article class="feature-card" data-link="helpdesk" tabindex="0" role="button">
                        <span class="feature-icon" role="img" aria-label="Support icon">💬</span>
                        <h3 class="feature-title">Helpdesk</h3>
                        <p class="feature-description">
                            Get assistance with IT issues, administrative queries, and general support. 
                            Find answers to common questions.
                        </p>
                    </article>
                </div>
            </section>
            
            <footer class="footer" role="contentinfo">
                <div class="footer-content">
                    <div class="footer-section">
                        <h3 class="footer-heading">Campus Life</h3>
                        <p class="footer-text">
                            Your one-stop platform for all campus activities and services.
                        </p>
                    </div>
                    
                    <div class="footer-section">
                        <h3 class="footer-heading">Quick Links</h3>
                        <nav aria-label="Footer navigation">
                            <ul class="footer-links" role="list">
                                <li><a href="#events" class="footer-link">Events</a></li>
                                <li><a href="#clubs" class="footer-link">Clubs</a></li>
                                <li><a href="#bookings" class="footer-link">Bookings</a></li>
                                <li><a href="#helpdesk" class="footer-link">Helpdesk</a></li>
                            </ul>
                        </nav>
                    </div>
                    
                    <div class="footer-section">
                        <p class="footer-text footer-copyright">
                            &copy; 2024 Campus Life App.<br>
                            IST4035 Advanced Web Design Project.
                        </p>
                    </div>
                </div>
            </footer>
        `;
    }

    /**
     * Initialize view
     */
    init() {
        this.initCanvasDemo();
        this.attachEventListeners();
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Feature card navigation
        document.querySelectorAll('.feature-card').forEach(card => {
            const link = card.dataset.link;
            
            // Click handler
            card.addEventListener('click', () => {
                if (link) {
                    window.location.hash = `#${link}`;
                }
            });
            
            // Keyboard handler
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (link) {
                        window.location.hash = `#${link}`;
                    }
                }
            });
        });
    }

    /**
     * Initialize Canvas Animation
     */
    initCanvasDemo() {
        const canvas = document.getElementById('welcomeCanvas');
        
        if (!canvas || !canvas.getContext) {
            console.warn('Canvas API not supported or canvas element not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        let animationFrame;
        let offset = 0;
        
        function drawBackground(context, width, height) {
            const gradient = context.createLinearGradient(0, 0, width, 0);
            gradient.addColorStop(0, '#1e40af');
            gradient.addColorStop(1, '#1e3a8a');
            
            context.fillStyle = gradient;
            context.fillRect(0, 0, width, height);
        }
        
        function drawAnimatedText(context, width, height, animOffset) {
            context.fillStyle = 'white';
            context.font = 'bold 36px sans-serif';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            
            const yPosition = height / 2 + Math.sin(animOffset * 0.05) * 5;
            context.fillText('Campus Life Hub', width / 2, yPosition);
        }
        
        function drawDecorativeCircles(context, width, animOffset) {
            context.fillStyle = 'rgba(255, 255, 255, 0.2)';
            
            for (let i = 0; i < 3; i++) {
                const x = (width / 4) * (i + 1);
                const baseRadius = 10;
                const pulseAmount = Math.sin(animOffset * 0.1 + i * Math.PI / 3) * 5;
                const radius = baseRadius + pulseAmount;
                
                context.beginPath();
                context.arc(x, 25, radius, 0, Math.PI * 2);
                context.fill();
            }
        }
        
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBackground(ctx, canvas.width, canvas.height);
            drawAnimatedText(ctx, canvas.width, canvas.height, offset);
            drawDecorativeCircles(ctx, canvas.width, offset);
            
            offset++;
            animationFrame = requestAnimationFrame(animate);
        }
        
        animate();
        
        // Store cleanup function
        this.canvasCleanup = () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }

    /**
     * Cleanup when view is destroyed
     */
    destroy() {
        if (this.canvasCleanup) {
            this.canvasCleanup();
        }
    }
}

export default HomeView;
