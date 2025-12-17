import { 
  initializeApp 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";


import { 
  getFirestore, collection, addDoc, getDocs, query, orderBy, limit
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

// ---------------- Helper: Format 12-Hour Time ----------------

// ---------------- Helper: Convert PK Time to US Eastern ----------------
function convertPKtoUS(date, time) {
  try {
    const [hour, minute] = time.split(":").map(Number);
    const pkDate = new Date(`${date}T${time}:00+05:00`); // Pakistan time
    return pkDate.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour12: true, hour: "numeric", minute: "numeric" });
  } catch {
    return "";
  }
}

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
        const usTime = convertPKtoUS(data.date, data.time);
        slots.push(`${data.date} - ${usTime}`);
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

    if (!name || !email || !company || !message) {
      showPopup("❌ Please fill in all required fields.", false);
      return;
    }

    // Show loader
    showPopup("⏳ Sending your message...");

    try {
      // Save booking into "contacts"
      await addDoc(collection(db, "contacts"), {
        name,
        email,
        company,
        message,
        timestamp: new Date()
      });

      // Also keep in "bookings"
      await addDoc(collection(db, "bookings"), {
        name,
        email,
        company,
        message,
        createdAt: new Date()
      });

      showPopup("✅ Our team will contact you soon!");
      contactForm.reset();
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

    // Show loader
    showPopup("⏳ Submitting your testimonial...");

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
// ---------------- Load All Testimonials (for testimonials.html page) ----------------
async function loadTestimonials() {
  const list = document.getElementById("testimonialsList");
  const skeleton = document.getElementById("testimonialsSkeleton");
  const noTestimonials = document.getElementById("noTestimonials");
  
  if (!list) return;

  try {
    const q = query(collection(db, "testimonials"), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);

    // Hide skeleton
    if (skeleton) skeleton.classList.add('hidden');
    
    // Show the list container
    list.classList.remove('hidden');
    list.innerHTML = "";
    
    let approvedCount = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.approved) {
        approvedCount++;
        const card = document.createElement("div");
        card.className = "testimonial-card bg-white rounded-2xl shadow-lg p-6 border border-slate-200";
        card.innerHTML = `
          <div class="flex items-center gap-2 mb-4">
            <div class="flex text-amber-400">
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
            </div>
          </div>
          <p class="text-slate-700 italic mb-4">"${data.testimonial}"</p>
          <div class="flex items-center gap-3 pt-4 border-t border-slate-200">
            <div class="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center text-white font-bold">
              ${data.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div class="font-bold text-slate-900">${data.name}</div>
              <div class="text-xs text-slate-500">Verified Client</div>
            </div>
          </div>
        `;
        list.appendChild(card);
      }
    });

    // If no approved testimonials, show message
    if (approvedCount === 0 && noTestimonials) {
      list.classList.add('hidden');
      noTestimonials.classList.remove('hidden');
    }
  } catch (err) {
    console.error("Error loading testimonials:", err);
    if (skeleton) skeleton.classList.add('hidden');
    if (list) {
      list.classList.remove('hidden');
      list.innerHTML = '<p class="text-center text-red-600">Error loading testimonials. Please refresh the page.</p>';
    }
  }
}

// ---------------- Load Latest 3 Testimonials (for index.html page) ----------------
async function loadLatestTestimonials() {
  const latestDiv = document.getElementById("latestTestimonials");
  if (!latestDiv) return;

  try {
    const q = query(collection(db, "testimonials"), orderBy("timestamp", "desc"), limit(3));
    const snapshot = await getDocs(q);

    latestDiv.innerHTML = "";
    
    let approvedCount = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.approved) {
        approvedCount++;
        const card = document.createElement("div");
        card.className = "testimonial-card bg-white rounded-2xl shadow-lg p-6 border border-slate-200";
        card.innerHTML = `
          <div class="flex items-center gap-2 mb-4">
            <div class="flex text-amber-400">
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
            </div>
          </div>
          <p class="text-slate-700 italic mb-4">"${data.testimonial}"</p>
          <div class="flex items-center gap-3 pt-4 border-t border-slate-200">
            <div class="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center text-white font-bold">
              ${data.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div class="font-bold text-slate-900">${data.name}</div>
              <div class="text-xs text-slate-500">Verified Client</div>
            </div>
          </div>
        `;
        latestDiv.appendChild(card);
      }
    });

    // If no approved testimonials, show placeholder
    if (approvedCount === 0) {
      latestDiv.innerHTML = '<p class="text-center text-slate-600 col-span-full py-8">No testimonials yet. Be the first to share your experience!</p>';
    }
  } catch (err) {
    console.error("Error loading latest testimonials:", err);
    latestDiv.innerHTML = '<p class="text-center text-red-600">Error loading testimonials.</p>';
  }
}