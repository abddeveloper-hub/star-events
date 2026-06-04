// ============================================================
// STAR WEDDINGS AND EVENTS - Main Script
// ============================================================

// --- Firebase Imports (MUST be at the top of an ES module) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// --- Firebase Config & Init ---
const firebaseConfig = {
  apiKey: "AIzaSyDW1lZBIUUDqCciWb3HjTQQIKCDStNmZds",
  authDomain: "star-events-4d803.firebaseapp.com",
  projectId: "star-events-4d803",
  storageBucket: "star-events-4d803.firebasestorage.app",
  messagingSenderId: "407728990447",
  appId: "1:407728990447:web:0a6ae03a6f027e27db131a",
  measurementId: "G-G0915EJ85C"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// ============================================================
// 1. Scroll Fade-in Animations (runs on all pages)
// ============================================================
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-up').forEach((el) => observer.observe(el));

// ============================================================
// 2. Mobile Menu Toggle
// ============================================================
const mobileMenuBtn = document.getElementById('mobile-menu');
const navMenu = document.querySelector('nav');

if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenuBtn.innerHTML = navMenu.classList.contains('active') ? '✕' : '☰';
    });
}

// ============================================================
// 3. Animated Counters (homepage)
// ============================================================
const counters = document.querySelectorAll('.counter-number');
if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.getAttribute('data-target');
                const duration = 2000;
                const increment = target / (duration / 16);
                let current = 0;
                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        counter.innerText = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.innerText = target;
                    }
                };
                updateCounter();
                counterObserver.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
}

// ============================================================
// 4. Gallery Filters (gallery page)
// ============================================================
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'inline-block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => { item.style.display = 'none'; }, 300);
                }
            });
        });
    });
}

// ============================================================
// 5. FAQ Accordion (services page)
// ============================================================
const faqItems = document.querySelectorAll('.faq-item');
if (faqItems.length > 0) {
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                faqItems.forEach(faq => faq.classList.remove('active'));
                if (!isActive) item.classList.add('active');
            });
        }
    });
}

// ============================================================
// 6. Contact Form — WhatsApp + Firebase (contact page only)
// ============================================================
const whatsappNumbers = [
    { name: 'Primary', number: '919480156353' }
];

const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = bookingForm.querySelector('.cta-button');
        btn.textContent = "Sending...";

        try {
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const eventDate = document.getElementById('eventDate').value;
            const eventType = document.getElementById('eventType').value;
            const eventLocation = document.getElementById('eventLocation').value;
            const guests = document.getElementById('guests').value;
            const note = document.getElementById('message').value;

            const message = `🎉 New Event Inquiry\n\nName: ${name}\nPhone: ${phone}\nEvent Type: ${eventType}\nEvent Date: ${eventDate}\nLocation: ${eventLocation}\nGuests: ${guests}\nNotes: ${note}\n\nPlease contact them to finalize the booking.`;
            const encodedMessage = encodeURIComponent(message);

            whatsappNumbers.forEach((contact, index) => {
                const whatsappUrl = `https://wa.me/${contact.number}?text=${encodedMessage}`;
                setTimeout(() => {
                    window.open(whatsappUrl, '_blank');
                }, index * 1000);
            });

            // Save to Firebase in the background
            try {
                await addDoc(collection(db, "inquiries"), {
                    name,
                    phone,
                    eventType,
                    eventDate,
                    location: eventLocation,
                    guests,
                    notes: note,
                    submittedAt: new Date()
                });
            } catch (firebaseError) {
                console.warn("Firebase save warning: ", firebaseError);
            }

            window.showToast("✅ Inquiry sent! Opening WhatsApp...", "success");
            bookingForm.reset();
            btn.textContent = "Send Inquiry";

        } catch (error) {
            console.error("Error: ", error);
            window.showToast("❌ Something went wrong. Please try again.", "error");
            btn.textContent = "Send Inquiry";
        }
    });
}

// ============================================================
// 7. Customer Review Submission
// ============================================================
const reviewForm = document.getElementById('reviewForm');
if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = reviewForm.querySelector('.cta-button');
        const originalText = btn.textContent;
        btn.textContent = "Submitting...";
        
        try {
            const name = document.getElementById('reviewName').value;
            const rating = document.getElementById('reviewRating').value;
            const text = document.getElementById('reviewText').value;
            
            // Save to Firebase
            try {
                await addDoc(collection(db, "reviews"), {
                    name,
                    rating: parseInt(rating),
                    text,
                    status: 'pending',
                    submittedAt: new Date()
                });
            } catch (firebaseError) {
                console.warn("Firebase save warning: ", firebaseError);
            }
            
            window.showToast("✅ Thank you for your review! It has been submitted successfully.", "success");
            reviewForm.reset();
            btn.textContent = originalText;
            
        } catch (error) {
            console.error("Error submitting review: ", error);
            window.showToast("❌ Something went wrong. Please try again.", "error");
            btn.textContent = originalText;
        }
    });
}

// ============================================================
// 8. Gallery Lightbox Modal
// ============================================================
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.querySelector('.lightbox-close');

if (lightbox && galleryItems.length > 0) {
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            lightbox.style.display = 'block';
            lightboxImg.src = item.src;
        });
    });

    closeBtn.addEventListener('click', () => {
        lightbox.style.display = 'none';
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
        }
    });
}

// ============================================================
// 9. Toast Notification System
// ============================================================
const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
document.body.appendChild(toastContainer);

window.showToast = function(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = message;
    
    toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
};

// ============================================================
// 10. Scroll to Top Button
// ============================================================
const scrollTopBtn = document.createElement('button');
scrollTopBtn.className = 'scroll-top-btn';
scrollTopBtn.innerHTML = '↑';
document.body.appendChild(scrollTopBtn);

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============================================================
// 11. Interactive Seating Plans (services page)
// ============================================================
window.switchSeating = function(planId) {
    // Remove active class from all tabs
    document.querySelectorAll('.seat-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    // Add active class to clicked tab
    event.target.classList.add('active');

    // Hide all seating plans
    document.querySelectorAll('.seat-plan').forEach(plan => {
        plan.classList.remove('active');
    });
    // Show selected plan
    document.getElementById(planId).classList.add('active');
};

// ============================================================
// 12. Custom Cursor & Parallax Animations
// ============================================================
// Only enable custom cursor on non-touch devices
if (window.matchMedia("(pointer: fine)").matches) {
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    const cursorDot = document.createElement('div');
    cursorDot.classList.add('custom-cursor-dot');
    
    document.body.appendChild(cursor);
    document.body.appendChild(cursorDot);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';
    });

    // Add hover effect to interactive elements
    const hoverElements = document.querySelectorAll('a, button, .card, .gallery-item, .filter-btn, .faq-question');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

// Parallax scrolling effect
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    document.querySelectorAll('.parallax').forEach(el => {
        const speed = el.dataset.speed || 0.2;
        el.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Add floating effect to some elements to make it dynamic
setTimeout(() => {
    document.querySelectorAll('.card').forEach((card, index) => {
        // Optional floating effect
        if(index % 2 !== 0) {
            card.classList.add('floating');
        }
    });
}, 1000);

// ============================================================
// 13. Dynamic Seasonal Themes
// ============================================================
function applySeasonalTheme() {
    const month = new Date().getMonth(); // 0 = Jan, 11 = Dec
    let seasonObj = {
        name: "Welcome",
        message: "Premium Event Setups",
        color: "var(--gold-base)"
    };

    if (month >= 2 && month <= 4) { // Mar - May
        seasonObj = {
            name: "Summer Weddings",
            message: "Stay cool with our premium floral & airy event setups.",
            color: "#FFA726" // Warm Orange
        };
    } else if (month >= 5 && month <= 8) { // Jun - Sep
        seasonObj = {
            name: "Monsoon Season",
            message: "Don't let the rain stop you. Discover our waterproof, luxurious indoor hall decors.",
            color: "#29B6F6" // Cool Blue
        };
    } else { // Oct - Feb
        seasonObj = {
            name: "Winter Festivities",
            message: "Perfect weather for our grand outdoor lighting and spectacular evening setups.",
            color: "#AB47BC" // Deep Purple
        };
    }

    // Create a dynamic top banner
    const banner = document.createElement('div');
    banner.classList.add('seasonal-banner', 'fade-in', 'show');
    banner.style.background = `linear-gradient(90deg, rgba(10,10,10,1) 0%, rgba(25,25,25,1) 50%, rgba(10,10,10,1) 100%)`;
    banner.style.borderBottom = `2px solid ${seasonObj.color}`;
    
    banner.innerHTML = `
        <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: center; align-items: center; gap: 15px;">
            <span style="font-weight: bold; color: ${seasonObj.color}; text-transform: uppercase; letter-spacing: 2px; font-size: 0.85rem;">✨ ${seasonObj.name} Special:</span>
            <span style="color: #eee; font-size: 0.9rem;">${seasonObj.message}</span>
            <a href="contact.html" style="color: ${seasonObj.color}; font-size: 0.85rem; text-decoration: underline; margin-left: 10px; font-weight: 600;">Plan Now</a>
        </div>
    `;

    // Insert at the very top of the body
    document.body.insertBefore(banner, document.body.firstChild);
}

// Run the seasonal theme checker when DOM is loaded
if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applySeasonalTheme);
} else {
    applySeasonalTheme();
}
