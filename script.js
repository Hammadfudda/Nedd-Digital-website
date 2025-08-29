import { 
  initializeApp 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import { 
  getFirestore, collection, addDoc, getDocs, query, orderBy, limit, 
  doc, updateDoc, where 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ---------------- Firebase ----------------
const firebaseConfig = {
  apiKey: "AIzaSyAgkzgYPYpCHZbJddkoFkzWswSh3H5tsIo",
  authDomain: "nedddigitalwebsite.firebaseapp.com",
  projectId: "nedddigitalwebsite",
  storageBucket: "nedddigitalwebsite.firebasestorage.app",
  messagingSenderId: "360940743614",
  appId: "1:360940743614:web:7eca9a842919ad569067ef",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ---------------- Popup ----------------
window.showPopup = function(message, isSuccess = true) {
  const popup = document.getElementById("popup");
  const popupMessage = document.getElementById("popupMessage");
  if (!popup || !popupMessage) return;
  popupMessage.textContent = message;
  popupMessage.className = isSuccess ? "text-green-600 font-semibold" : "text-red-600 font-semibold";
  popup.classList.remove("hidden");
  popup.classList.add("flex");
};
window.closePopup = function() {
  const popup = document.getElementById("popup");
  if (popup) popup.classList.add("hidden");
};

// ---------------- DOM Loaded ----------------
document.addEventListener("DOMContentLoaded", async () => {
  // Mobile Nav Toggle
  const navToggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => {
      mobileNav.classList.toggle("hidden");
    });
  }

  // Load slots
  await loadSlots();

  // Load testimonials
  await loadTestimonials();
  await loadLatestTestimonials();
});

// ---------------- Load Slots ----------------
async function loadSlots() {
  const slotSelect = document.getElementById("slot");
  if (!slotSelect) return;

  slotSelect.innerHTML = `<option value="">Loading slots...</option>`;
  try {
    const q = query(collection(db, "slots"), orderBy("date"));
    const snapshot = await getDocs(q);
    const slots = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Only show slots that are not booked
      if (data.date && data.time && !data.booked) {
        slots.push(`${data.date} - ${data.time}`);
      }
    });

    if (slots.length > 0) {
      slotSelect.innerHTML = `<option value="">Select a slot</option>`;
      slots.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s;
        opt.textContent = s;
        slotSelect.appendChild(opt);
      });
    } else {
      slotSelect.innerHTML = `<option value="">No slots available</option>`;
    }
  } catch (err) {
    console.error("Error loading slots:", err);
    slotSelect.innerHTML = `<option value="">Failed to load slots</option>`;
  }
}

// ---------------- Contact Form ----------------
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", async e => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const company = document.getElementById("company").value.trim();
    const message = document.getElementById("message").value.trim();
    const slot = document.getElementById("slot").value;

    if (!name || !email || !message || !slot) {
      showPopup("❌ Please fill in all required fields.", false);
      return;
    }

    try {
      // Save booking into "contacts" (admin reads this)
      await addDoc(collection(db, "contacts"), {
        name,
        email,
        company,
        message,
        slot,
        timestamp: new Date()
      });

      // Also keep in "bookings" (optional log)
      await addDoc(collection(db, "bookings"), {
        name,
        email,
        company,
        message,
        slot,
        createdAt: new Date()
      });

      // Update slot status as booked
      const [date, time] = slot.split(" - ");
      const slotsRef = collection(db, "slots");
      const q = query(slotsRef, where("date", "==", date), where("time", "==", time));
      const snapshot = await getDocs(q);

      snapshot.forEach(async (docSnap) => {
        await updateDoc(doc(db, "slots", docSnap.id), { booked: true });
      });

      showPopup("✅ Your message and demo call request have been sent!");
      contactForm.reset();
      await loadSlots(); // refresh slots
    } catch (err) {
      console.error(err);
      showPopup("❌ Failed to send. Please try again.", false);
    }
  });
}

// ---------------- Testimonials ----------------
const testimonialForm = document.getElementById("testimonialForm");
if (testimonialForm) {
  testimonialForm.addEventListener("submit", async e => {
    e.preventDefault();
    const name = document.getElementById("testimonialName").value.trim();
    const testimonial = document.getElementById("testimonialMessage").value.trim();

    try {
      await addDoc(collection(db, "testimonials"), {
        name, testimonial, approved: false, timestamp: new Date()
      });
      showPopup("✅ Your testimonial has been submitted for approval.");
      testimonialForm.reset();
    } catch (err) {
      console.error(err);
      showPopup("❌ Failed to submit testimonial.", false);
    }
  });
}

// ---------------- Load All Testimonials ----------------
async function loadTestimonials() {
  const list = document.getElementById("testimonialsList");
  if (!list) return;

  const q = query(collection(db, "testimonials"), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);

  list.innerHTML = "";
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.approved) {
      const card = document.createElement("div");
      card.className = "bg-white shadow rounded-xl p-4";
      card.innerHTML = `<p class="text-slate-600">"${data.testimonial}"</p><div class="mt-2 font-bold">- ${data.name}</div>`;
      list.appendChild(card);
    }
  });
}

// ---------------- Load Latest 3 Testimonials ----------------
async function loadLatestTestimonials() {
  const latestDiv = document.getElementById("latestTestimonials");
  if (!latestDiv) return;

  const q = query(collection(db, "testimonials"), orderBy("timestamp", "desc"), limit(3));
  const snapshot = await getDocs(q);

  latestDiv.innerHTML = "";
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.approved) {
      const card = document.createElement("div");
      card.className = "bg-white shadow rounded-xl p-4";
      card.innerHTML = `<p class="text-slate-600">"${data.testimonial}"</p><div class="mt-2 font-bold">- ${data.name}</div>`;
      latestDiv.appendChild(card);
    }
  });
}
