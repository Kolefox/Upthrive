// =====================
// MOBILE NAVIGATION TOGGLE
// =====================
// Opens and closes the nav menu on small screens
// when the "Menu" button is clicked.

const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', function () {
    navLinks.classList.toggle('open');
  });
}


// =====================
// SMOOTH SCROLL
// =====================
// Makes all in-page anchor links (#section) scroll
// smoothly instead of jumping instantly.

document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });

      // Close mobile nav if open after clicking a link
      if (navLinks) {
        navLinks.classList.remove('open');
      }
    }
  });
});


// =====================
// CONTACT FORM
// =====================
// Handles the contact form submission.
// Replace the alert with your own logic (e.g. fetch/API call)
// when you're ready to wire up a backend.

const contactForm = document.querySelector('.contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    alert('Thanks for reaching out! We\'ll be in touch soon.');
    contactForm.reset();
  });
}
