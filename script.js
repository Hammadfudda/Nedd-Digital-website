import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ---------------- Firebase ----------------
const firebaseConfig = {
  apiKey: "AIzaSyAgkzgYPYpCHZbJddkoFkzWswSh3H5tsIo",
  authDomain: "nedddigitalwebsite.firebaseapp.com",
  projectId: "nedddigitalwebsite",
  storageBucket: "nedddigitalwebsite.firebasestorage.app",
  messagingSenderId: "360940743614",
  appId: "1:360940743614:web:7eca9a842919ad569067ef",
  measurementId: "G-W9CBH3QEVP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ---------------- Popup Helper ----------------
window.showPopup = function (message, isSuccess = true) {
  const popup = document.getElementById("popup");
  if (!popup) return;
  const popupMessage = document.getElementById("popupMessage");
  popupMessage.textContent = message;
  popupMessage.className = isSuccess ? "text-green-600 font-semibold" : "text-red-600 font-semibold";
  popup.classList.remove("hidden");
};

window.closePopup = function () {
  const popup = document.getElementById("popup");
  if (popup) popup.classList.add("hidden");
};

// ---------------- Submit Testimonial ----------------
const testimonialForm = document.getElementById("testimonialForm");
if (testimonialForm) {
  testimonialForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("testimonialName").value.trim();
    const testimonial = document.getElementById("testimonialMessage").value.trim();

    try {
      await addDoc(collection(db, "testimonials"), {
        name,
        testimonial,
        approved: false,
        timestamp: new Date()
      });
      showPopup("✅ Your testimonial has been submitted for approval.");
      testimonialForm.reset();
    } catch (err) {
      console.error(err);
      showPopup("❌ Failed to submit testimonial.", false);
    }
  });
}

// ---------------- Load Testimonials ----------------
async function loadTestimonials() {
  const list = document.getElementById("testimonialsList");
  if (!list) return;

  const q = query(collection(db, "testimonials"), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);

  list.innerHTML = "";
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.approved) {
      const card = document.createElement("div");
      card.className = "bg-white shadow rounded-xl p-4";
      card.innerHTML = `<p class="text-slate-600">"${data.testimonial}"</p><div class="mt-2 font-bold">- ${data.name}</div>`;
      list.appendChild(card);
    }
  });
}
loadTestimonials();

// ---------------- Latest 3 for Index ----------------
async function loadLatestTestimonials() {
  const latestDiv = document.getElementById("latestTestimonials");
  if (!latestDiv) return;

  const q = query(collection(db, "testimonials"), orderBy("timestamp", "desc"), limit(3));
  const snapshot = await getDocs(q);

  latestDiv.innerHTML = "";
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.approved) {
      const card = document.createElement("div");
      card.className = "bg-white shadow rounded-xl p-4";
      card.innerHTML = `<p class="text-slate-600">"${data.testimonial}"</p><div class="mt-2 font-bold">- ${data.name}</div>`;
      latestDiv.appendChild(card);
    }
  });
}
loadLatestTestimonials();

// ---------------- Contact Form ----------------
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const company = document.getElementById("company").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {
      showPopup("❌ Please fill in all required fields.", false);
      return;
    }

    try {
      await addDoc(collection(db, "contacts"), {
        name,
        email,
        company,
        message,
        timestamp: new Date()
      });

      showPopup("✅ Your message has been sent successfully!");
      contactForm.reset();
    } catch (err) {
      console.error(err);
      showPopup("❌ Failed to send your message.", false);
    }
  });
}

// ---------------- Mobile Nav Toggle ----------------
document.addEventListener("DOMContentLoaded", function() {
  const navToggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function() {
      mobileNav.classList.toggle("hidden");
    });
  }
});