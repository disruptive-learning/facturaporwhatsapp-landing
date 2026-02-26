function getCurrentYear(): number {
  return new Date(Date.now()).getFullYear();
}

// Update footer year
const yearElement = document.getElementById('footer-year');
if (yearElement) {
  yearElement.textContent = getCurrentYear().toString();
}

// Modal functionality
const modal = document.getElementById('contact-modal');
const closeModalBtn = document.getElementById('close-modal');
const contactForm = document.getElementById('contact-form') as HTMLFormElement;

// Get all CTA buttons (but NOT the form submit button)
const ctaButtons = document.querySelectorAll('.btn-primary:not([type="submit"]), .btn-secondary:not([type="submit"])');

let modalOpenedAt: number | null = null;

// Function to open modal
function openModal() {
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    modalOpenedAt = Date.now();
  }
}

// Function to close modal
function closeModal() {
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = ''; // Re-enable scrolling
  }
}

// Add click event to all CTA buttons (excluding submit button)
ctaButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  });
});

// Close modal when clicking the X button
if (closeModalBtn) {
  closeModalBtn.addEventListener('click', closeModal);
}

// Close modal when clicking outside the modal content
if (modal) {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

// Phone number validation and formatting
const phoneInput = document.getElementById('phone-number') as HTMLInputElement;
const phoneError = document.getElementById('phone-error');

// Form message elements
const formError = document.getElementById('form-error');
const formSuccess = document.getElementById('form-success');

// E.164 validation: + followed by 1-15 digits, first digit cannot be 0
function isValidE164(phone: string): boolean {
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
}

// Clean phone input (remove non-digits except +)
function cleanPhoneInput(value: string): string {
  // Remove all non-digit characters except +
  let cleaned = value.replace(/[^\d+]/g, '');

  // If doesn't start with +, add it
  if (!cleaned.startsWith('+')) {
    const digits = cleaned.replace(/\+/g, '');
    cleaned = digits.length > 0 ? '+' + digits : '+';
  }

  // Remove any extra + signs after the first one
  cleaned = '+' + cleaned.substring(1).replace(/\+/g, '');

  // Limit to 16 characters total (+ plus 15 digits)
  if (cleaned.length > 16) {
    cleaned = cleaned.substring(0, 16);
  }

  return cleaned;
}

// Add Mexico country code if needed
function addMexicoCountryCode(phone: string): string {
  // If it's just + followed by exactly 10 digits, add 52
  const match = phone.match(/^\+(\d{10})$/);
  if (match) {
    return '+52' + match[1];
  }
  return phone;
}

// Show error message
function showPhoneError(message: string) {
  if (phoneInput && phoneError) {
    phoneInput.classList.add('error');
    phoneError.textContent = message;
    phoneError.classList.remove('hidden');
  }
}

// Hide error message
function hidePhoneError() {
  if (phoneInput && phoneError) {
    phoneInput.classList.remove('error');
    phoneError.textContent = '';
    phoneError.classList.add('hidden');
  }
}

// Show form error message
function showFormError(message: string) {
  if (formError) {
    formError.textContent = message;
    formError.classList.remove('hidden');
  }
  hideFormSuccess();
}

// Hide form error message
function hideFormError() {
  if (formError) {
    formError.textContent = '';
    formError.classList.add('hidden');
  }
}

// Show form success message
function showFormSuccess(message: string) {
  if (formSuccess) {
    formSuccess.textContent = message;
    formSuccess.classList.remove('hidden');
  }
  hideFormError();
}

// Hide form success message
function hideFormSuccess() {
  if (formSuccess) {
    formSuccess.textContent = '';
    formSuccess.classList.add('hidden');
  }
}

// Validate phone number with detailed error messages
function validatePhone(phone: string, showEmptyError: boolean = false): { valid: boolean; message: string } {
  // Empty state
  if (phone === '+' || phone === '') {
    return { valid: false, message: showEmptyError ? 'Ingresa un número de teléfono' : '' };
  }

  const digits = phone.substring(1);

  // No digits yet
  if (digits.length === 0) {
    return { valid: false, message: showEmptyError ? 'Ingresa un número de teléfono' : '' };
  }

  // First digit is 0 (invalid for E.164)
  if (digits[0] === '0') {
    return { valid: false, message: 'El número no puede comenzar con 0' };
  }

  // Too short
  if (digits.length < 10) {
    return { valid: false, message: `Faltan ${10 - digits.length} dígitos` };
  }

  // Too long
  if (digits.length > 15) {
    return { valid: false, message: 'Máximo 15 dígitos permitidos' };
  }

  // Check E.164 format
  if (!isValidE164(phone)) {
    return { valid: false, message: 'Formato de número inválido' };
  }

  return { valid: true, message: '' };
}

// Handle phone input changes
if (phoneInput) {
  // Set initial value
  if (!phoneInput.value) {
    phoneInput.value = '+';
  }

  phoneInput.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    const cursorPosition = target.selectionStart || 0;
    const oldLength = target.value.length;

    // Clean the input (enforce + at start, remove non-digits)
    const cleaned = cleanPhoneInput(target.value);
    target.value = cleaned;

    // Adjust cursor position (keep it after the + if user tries to delete it)
    const newLength = cleaned.length;
    const lengthDiff = newLength - oldLength;
    const newPosition = Math.max(1, cursorPosition + lengthDiff); // Never before the +
    target.setSelectionRange(newPosition, newPosition);

    // Clear any existing errors while typing
    hidePhoneError();
  });

  // Validate and add country code on blur (when user leaves the field)
  phoneInput.addEventListener('blur', (e) => {
    const target = e.target as HTMLInputElement;
    let phone = target.value;

    // If empty or just +, don't validate yet
    if (phone === '+' || phone === '') {
      return;
    }

    // Add Mexico country code if just 10 digits
    phone = addMexicoCountryCode(phone);
    target.value = phone;

    // Validate and show errors
    const validation = validatePhone(phone, false);
    if (validation.message) {
      showPhoneError(validation.message);
    } else {
      hidePhoneError();
    }
  });

  // Prevent deleting the +
  phoneInput.addEventListener('keydown', (e) => {
    const target = e.target as HTMLInputElement;
    const cursorPosition = target.selectionStart || 0;

    // Prevent deleting the + at position 0
    if ((e.key === 'Backspace' || e.key === 'Delete') && cursorPosition <= 1) {
      e.preventDefault();
    }
  });

  // Handle focus - if empty, set to +
  phoneInput.addEventListener('focus', (e) => {
    const target = e.target as HTMLInputElement;
    if (!target.value) {
      target.value = '+';
    }
  });
}

// Handle form submission
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear any existing messages
    hideFormError();
    hideFormSuccess();

    const formData = new FormData(contactForm);

    const fullName = (formData.get('fullName') as string || '').trim();
    const phoneNumber = formData.get('phoneNumber') as string;
    const termsAccepted = formData.get('termsAccepted');
    const honeypot = formData.get('company'); // 👈 honeypot field

    // Honeypot triggered → silently ignore
    if (honeypot) {
      console.warn('Spam detected (honeypot)');
      return;
    }

    // Terms check
    if (!termsAccepted) {
      showFormError('Por favor acepta los términos y condiciones para continuar.');
      return;
    }

    // Validate phone
    const validation = validatePhone(phoneNumber, true);
    if (!validation.valid) {
      showPhoneError(validation.message || 'Por favor ingresa un número válido');
      return;
    }

    // Basic name validation
    if (fullName.length < 2) {
      showFormError('Por favor ingresa tu nombre completo.');
      return;
    }

    // Disable submit button to prevent double submits
    const submitBtn = contactForm.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitBtn) submitBtn.disabled = true;

    // Determine API URL based on environment using the URL Web API
    const currentUrl = new URL(window.location.href);
    const parts = currentUrl.hostname.split('.');
    const rootDomain = parts.length > 2 ? parts.slice(1).join('.') : currentUrl.hostname;
    const isStaging = currentUrl.hostname === 'localhost' || currentUrl.hostname.includes('staging');
    const subdomain = isStaging ? 'staging' : 'app';
    const webhookUrl = `https://${subdomain}.${rootDomain}/outreach/prospect`;

    // Cool marketing stuff
    const timeToSubmit = modalOpenedAt ? Math.round((Date.now() - modalOpenedAt) / 1000) : null;
    const params = new URLSearchParams(window.location.search);
    const source = params.get('utm_source');
    const medium = params.get('utm_medium');
    const campaign = params.get('utm_campaign');
    const content = params.get('utm_content');
    const term = params.get('utm_term');

    try {
      const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName,
            phoneNumber,
            source: 'landing-page',
            locale: 'es-MX',
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            utm: { source, medium, campaign, content, term },
            device: { width: window.innerWidth, height: window.innerHeight },
            engagement: { timeToSubmit }
          }),
        }
      );

      if (!response.ok) {
        // Try to get error message from response
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Error del servidor: ${response.status}. Por favor intenta de nuevo.`);
      }

      // If we got here, the request was successful (200 status)
      const result = await response.json();
      console.log('Webhook response:', result);

      // Show success message
      showFormSuccess(`¡Gracias, ${fullName}! Nuestro agente te contactará pronto por WhatsApp.`);

      // Reset form after a short delay
      setTimeout(() => {
        contactForm.reset();
        if (phoneInput) phoneInput.value = '+';
        hidePhoneError();
        hideFormSuccess();
        closeModal();
      }, 3000);
    } catch (err) {
      console.error('Form submit error:', err);
      // Show user-friendly error message
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido. Por favor intenta de nuevo.';
      showFormError(errorMessage);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}
