

// js/form-handler.js

const form = document.getElementById('requestForm');
const toastOuter = document.getElementById('toast');
const toastCard = document.getElementById('toastCard');
const toastText = document.getElementById('toastText');
const toastSub = document.getElementById('toastSub');
const toastIcon = document.getElementById('toastIcon');
const toastClose = document.getElementById('toastClose');

let toastTimer = null;
let isToastVisible = false;

function showToast(message, { type = 'success', sub = '', timeout = 4000 } = {}) {
  // content
  toastText.textContent = message || '';
  toastSub.textContent = sub || '';
  toastSub.classList.toggle('hidden', !sub);

  // icon + colors
  if (type === 'success') {
    toastIcon.innerHTML = '<i class="fas fa-check-circle text-green-500 text-2xl"></i>';
  } else if (type === 'error') {
    toastIcon.innerHTML = '<i class="fas fa-times-circle text-red-500 text-2xl"></i>';
  } else {
    toastIcon.innerHTML = '<i class="fas fa-info-circle text-sky-500 text-2xl"></i>';
  }

  // show wrapper
  toastOuter.classList.remove('hidden');
  // trigger animation (remove hide if present)
  toastCard.classList.remove('toast-hide');
  toastCard.classList.add('toast-show');

  // ensure only one timer
  if (toastTimer) clearTimeout(toastTimer);
  isToastVisible = true;
  toastTimer = setTimeout(() => hideToast(), timeout);
}

function hideToast() {
  if (!isToastVisible) return;
  // animate out
  toastCard.classList.remove('toast-show');
  toastCard.classList.add('toast-hide');

  // after animation, hide wrapper
  toastCard.addEventListener('animationend', function _onEnd() {
    toastOuter.classList.add('hidden');
    // reset classes for next time
    toastCard.classList.remove('toast-hide');
    toastCard.classList.remove('toast-show');
    toastCard.style.opacity = '';
    isToastVisible = false;
    toastCard.removeEventListener('animationend', _onEnd);
  });
  if (toastTimer) { clearTimeout(toastTimer); toastTimer = null; }
}

// Close button handler
toastClose?.addEventListener('click', (e) => {
  e.preventDefault();
  hideToast();
});

// form submit logic (keeps your Google Apps Script endpoint)
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // basic client-side validation (ensure required fields)
  if (!form.firstName.value.trim() || !form.lastName.value.trim() || !form.email.value.trim()) {
    showToast('Please fill in required fields: first name, last name, email.', { type: 'error' });
    return;
  }

  const data = {
    firstName: form.firstName.value.trim(),
    lastName: form.lastName.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    reason: form.reason.value.trim(),
    submittedAt: new Date().toISOString()
  };

  try {
    const res = await fetch("https://script.google.com/macros/s/AKfycbxqHnkmNRLW2DPV2sIF3cfe-_pspjeOt6-COT6JYpkWFYBY91UgFfv34XpvEz5eM7R5/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
});

    });


    if (res.ok) {
      showToast('Form submitted successfully!', { type: 'success', sub: 'We received your request and will contact you shortly.' });
      form.reset();
    } else {
      // try to read server message if available
      let text = 'There was an error submitting the form. Please try again later.';
      try {
        const json = await res.json();
        if (json && json.error) text = json.error;
      } catch (_) {}
      showToast(text, { type: 'error' });
    }
  } catch (err) {
    console.error('Form submission error', err);
    showToast('Network error — please check your connection and try again.', { type: 'error' });
  }
});
