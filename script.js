// Quick Contact toggle
const qcToggle = document.getElementById('qcToggle');
const qcMenu = document.getElementById('qcMenu');

qcToggle.addEventListener('click', () => {
  const visible = qcMenu.style.display === 'flex';
  qcMenu.style.display = visible ? 'none' : 'flex';
  qcMenu.setAttribute('aria-hidden', visible ? 'true' : 'false');
});

// Close quick contact when clicking outside
document.addEventListener('click', (e) => {
  const quick = document.getElementById('quickContact');
  if (!quick.contains(e.target) && qcMenu.style.display === 'flex') {
    qcMenu.style.display = 'none';
    qcMenu.setAttribute('aria-hidden', 'true');
  }
});

// Testimonials - add new testimonial to UI
document.getElementById('addTestimonialBtn').addEventListener('click', () => {
  const name = document.getElementById('tName').value.trim();
  const message = document.getElementById('tMessage').value.trim();
  if (!name || !message) {
    alert('Please enter your name and testimonial.');
    return;
  }

  const list = document.getElementById('testimonialList');
  const block = document.createElement('blockquote');
  block.className = 'testimonial card';
  block.innerHTML = `<p>"${escapeHtml(message)}"</p><cite>- ${escapeHtml(name)}</cite>`;
  list.appendChild(block);

  // clear inputs
  document.getElementById('tName').value = '';
  document.getElementById('tMessage').value = '';
});

// Contact form demo send with popup animation on empty required fields
document.getElementById('sendBtn').addEventListener('click', () => {
  const nameInput = document.getElementById('cName');
  const emailInput = document.getElementById('cEmail');
  const messageInput = document.getElementById('cMessage');

  let valid = true;

  // Remove previous error classes
  [nameInput, emailInput, messageInput].forEach(input => input.classList.remove('input-error'));

  // Validate fields
  if (!nameInput.value.trim()) {
    valid = false;
    triggerInputError(nameInput);
  }
  if (!emailInput.value.trim()) {
    valid = false;
    triggerInputError(emailInput);
  }
  if (!messageInput.value.trim()) {
    valid = false;
    triggerInputError(messageInput);
  }

  if (!valid) {
    return;
  }

  document.getElementById('sendBtn').disabled = true;
  document.getElementById('sendBtn').textContent = 'Sending...';

  // simulate send (replace with real AJAX/backend later)
  setTimeout(() => {
    alert('Request sent! We will reply to ' + emailInput.value.trim());
    document.getElementById('sendBtn').disabled = false;
    document.getElementById('sendBtn').textContent = 'Send Request';
    document.getElementById('contactForm').reset();
  }, 1000);
});

// Helper to add and remove the shake animation class to input
function triggerInputError(input) {
  input.classList.add('input-error');
  input.focus();
  // Remove the class after animation ends so it can be triggered again next time
  input.addEventListener('animationend', () => {
    input.classList.remove('input-error');
  }, { once: true });
}

// small helper to escape user text (prevent injection)
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, function(m) {
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m];
  });
}
