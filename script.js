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

document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

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
                    item.style.display = 'block';
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

            alert("✅ Inquiry sent! Opening WhatsApp...");
            bookingForm.reset();
            btn.textContent = "Send Inquiry";

        } catch (error) {
            console.error("Error: ", error);
            alert("Something went wrong. Please try again.\nError: " + error.message);
            btn.textContent = "Send Inquiry";
        }
    });
}
