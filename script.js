// --- 1. Scroll Animations (Runs on all pages) ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target); 
        }
    });
}, { threshold: 0.1 });

const hiddenElements = document.querySelectorAll('.fade-in');
hiddenElements.forEach((el) => observer.observe(el));


// --- 2. Firebase Form Logic (Only runs on the contact page) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const bookingForm = document.getElementById('bookingForm');

// WhatsApp phone numbers to receive inquiries (country code 91 + number without +)
const whatsappNumbers = [
    { name: 'Primary', number: '919480156353' },
    { name: 'Alternate', number: '919731756353' }
];

// Only run this if the form exists on the current page
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = bookingForm.querySelector('.cta-button');
        btn.textContent = "Sending...";

        try {
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const eventDate = document.getElementById('eventDate').value;
            const guests = document.getElementById('guests').value;

            // Format message for WhatsApp
            const message = `🎉 New Event Inquiry\n\nName: ${name}\nPhone: ${phone}\nEvent Date: ${eventDate}\nGuests: ${guests}\n\nPlease contact them to finalize the booking.`;
            const encodedMessage = encodeURIComponent(message);

            // Open WhatsApp with both numbers
            whatsappNumbers.forEach((contact, index) => {
                const whatsappUrl = `https://wa.me/${contact.number}?text=${encodedMessage}`;
                setTimeout(() => {
                    window.open(whatsappUrl, '_blank');
                }, index * 1000); // Stagger by 1 second
            });

            // Save to Firebase in the background
            try {
                await addDoc(collection(db, "inquiries"), {
                    name: name,
                    phone: phone,
                    eventDate: eventDate,
                    guests: guests,
                    submittedAt: new Date()
                });
            } catch (firebaseError) {
                console.warn("Firebase save warning: ", firebaseError);
            }

            // Show success message
            alert("✅ Inquiry sent to both numbers! Opening WhatsApp...");

            bookingForm.reset();
            btn.textContent = "Send Inquiry";
            
        } catch (error) {
            console.error("Error: ", error);
            alert("Something went wrong. Please try again.\nError: " + error.message);
            btn.textContent = "Send Inquiry";
        }
    });
}
