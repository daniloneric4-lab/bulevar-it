/**
 * contact.js — Contact form handling with Formspree fallback
 */

const form = document.getElementById('contact-form');

/**
 * Initialize contact form submission
 */
export function initContactForm() {
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('.contact__submit');
    const originalText = submitBtn.innerHTML;

    // Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span>Šaljem...</span>
      <svg class="btn__arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="31.4" stroke-dashoffset="31.4"><animate attributeName="stroke-dashoffset" from="31.4" to="0" dur="1s" repeatCount="indefinite"/></circle></svg>
    `;

    try {
      const formData = new FormData(form);
      const action = form.getAttribute('action');

      // Try Formspree first
      if (action && !action.includes('placeholder')) {
        const response = await fetch(action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' },
        });

        if (response.ok) {
          showSuccess();
          return;
        }
      }

      // Fallback: mailto
      const name = formData.get('name');
      const email = formData.get('email');
      const phone = formData.get('phone');
      const message = formData.get('message');

      const mailtoBody = `Ime: ${name}%0AEmail: ${email}%0ATelefon: ${phone || 'N/A'}%0A%0APoruka:%0A${encodeURIComponent(message)}`;
      const mailtoLink = `mailto:bulevarit@gmail.com?subject=Upit sa sajta — ${encodeURIComponent(name)}&body=${mailtoBody}`;
      
      window.location.href = mailtoLink;
      showSuccess();
    } catch (err) {
      console.error('[Contact] Error:', err);
      // Fallback to mailto on error
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      alert('Došlo je do greške. Pokušajte ponovo ili nas kontaktirajte direktno na bulevarit@gmail.com.');
    }
  });
}

function showSuccess() {
  if (!form) return;
  
  form.innerHTML = `
    <div class="contact__success">
      <p style="font-size: 2rem; margin-bottom: 16px;">✓</p>
      <p>Hvala na poruci! Javićemo vam se uskoro.</p>
    </div>
  `;
  form.classList.add('contact__form--success');
}
