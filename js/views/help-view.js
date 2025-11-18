/* ===========================
   HELP VIEW (Knowledge Base)
   IST4035 - Campus Life App
   =========================== */

import authService from '../services/auth-service.js';

/**
 * Helpdesk View - Knowledge Base and Contact Info
 */

class HelpView {
    constructor() {
        this.searchTerm = '';
        this.faqs = [
            {
                id: 1,
                category: 'Academic',
                question: 'How do I register for next semester classes?',
                answer: 'Log into the CX portal (<a href="http://cx.usiu.ac.ke" target="_blank">cx.usiu.ac.ke</a>). Navigate to <strong>Student</strong>, and under <strong>Academic Information</strong>, go to <strong>Course Schedule and Registration</strong>.'
            },
            {
                id: 2,
                category: 'IT Support',
                question: 'How do I reset my student email password?',
                answer: 'You can contact USIU Tech on this line: <a href="tel:+254735000377">+254 735 000377</a> or follow the reset instructions sent via links on Outlook.'
            },
            {
                id: 3,
                category: 'Facilities',
                question: 'What are the library opening hours?',
                answer: 'The library is open <strong>Monday to Sunday from 8:00 AM to 9:00 PM</strong>. During exam weeks, you can request permission to stay past closing hours.'
            },
            {
                id: 4,
                category: 'Financial',
                question: 'Where can I view my tuition balance?',
                answer: 'You can view your current tuition balances under the <strong>Finance Information</strong> section on the CX portal.'
            },
            {
                id: 5,
                category: 'IT Support',
                question: 'How do I connect to the Campus Wi-Fi?',
                answer: 'Look for the network named <strong>"usiu wifi"</strong>. Log in using your student ID number and your standard portal password.'
            },
            {
                id: 6,
                category: 'Clubs',
                question: 'How can I join a student club?',
                answer: 'Navigate to the "Clubs" tab in this app to browse active communities. Click "Request to Join" on any club that interests you.'
            }
        ];
    }

    /**
     * Render the Help Page
     */
    render() {
        return `
            <div class="help-container">
                <section class="help-search-section">
                    <h1 class="help-search-title">How can we help you?</h1>
                    <p class="help-search-subtitle">Search for answers or browse common topics below</p>
                    
                    <div class="help-search-box">
                        <span class="help-search-icon">🔍</span>
                        <input 
                            type="text" 
                            id="helpSearch" 
                            class="help-search-input" 
                            placeholder="Search for issues (e.g. 'password', 'library')..."
                            aria-label="Search help topics">
                    </div>
                </section>

                <section class="contact-grid">
                    <div class="contact-card">
                        <span class="contact-icon">💻</span>
                        <h3 class="contact-title">IT Support</h3>
                        <p class="contact-desc">Wifi, Email, CX Portal</p>
                        <a href="tel:+254735000377" class="contact-link">+254 735 000377</a>
                    </div>
                    
                    <div class="contact-card">
                        <span class="contact-icon">🎓</span>
                        <h3 class="contact-title">Registrar</h3>
                        <p class="contact-desc">Transcripts, Enrollment</p>
                        <a href="mailto:registra@usiu.ac.ke" class="contact-link">registra@usiu.ac.ke</a>
                    </div>

                    <div class="contact-card">
                        <span class="contact-icon">🛡️</span>
                        <h3 class="contact-title">Campus Safety</h3>
                        <p class="contact-desc"><strong>USIU Pilot Line:</strong> <br><a href="tel:+254730116000" class="contact-link">(+254) 730 116 000</a></p>
                        <p class="contact-desc" style="margin-top: 10px; font-size: 0.9em;">
                            <strong>999</strong> (Police)<br>
                            <strong>911</strong> (Safaricom/Police)
                        </p>
                    </div>
                </section>

                <section class="faq-section">
                    <div class="section-header">
                        <h2>Frequently Asked Questions</h2>
                    </div>
                    <div id="faqList" class="faq-list">
                        </div>
                </section>
            </div>
        `;
    }

    /**
     * Initialize View
     */
    init() {
        this.renderFAQs();
        this.attachEventListeners();
        
        // Expose instance for global access
        window.helpViewInstance = this;
    }

    /**
     * Render the list of FAQs based on search
     */
    renderFAQs() {
        const container = document.getElementById('faqList');
        if (!container) return;

        // Filter based on search term
        const filtered = this.faqs.filter(faq => {
            const term = this.searchTerm.toLowerCase();
            return faq.question.toLowerCase().includes(term) || 
                   faq.answer.toLowerCase().includes(term) ||
                   faq.category.toLowerCase().includes(term);
        });

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">❓</div>
                    <h3>No results found</h3>
                    <p>Try searching for a different keyword or contact support directly.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(faq => `
            <div class="faq-item" id="faq-${faq.id}">
                <button class="faq-question" onclick="window.helpViewInstance.toggleAccordion(${faq.id})">
                    <span>
                        <span class="badge" style="margin-right: 10px; background: var(--color-surface-hover); color: var(--color-text-secondary);">${faq.category}</span>
                        ${faq.question}
                    </span>
                    <span class="faq-toggle">+</span>
                </button>
                <div class="faq-answer">
                    <div class="faq-answer-content">
                        ${faq.answer}
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Toggle Accordion Open/Close
     */
    toggleAccordion(id) {
        const item = document.getElementById(`faq-${id}`);
        if (item) {
            // Collapse other open accordion items
            document.querySelectorAll('.faq-item').forEach(el => {
                if (el.id !== `faq-${id}`) el.classList.remove('active');
            });

            // Toggle current
            item.classList.toggle('active');
        }
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const searchInput = document.getElementById('helpSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.trim();
                this.renderFAQs();
            });
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        window.helpViewInstance = null;
    }
}

export default HelpView;