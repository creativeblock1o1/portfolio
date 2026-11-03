const contactForm = document.querySelector('.footer-fields');
const submitButton = contactForm.querySelector('button[type="submit"]');

const loadingScreen = document.querySelector('#loadingScreen');
if (loadingScreen) {
    window.setTimeout(() => {
        loadingScreen.classList.add('is-dismissing');
        window.setTimeout(() => loadingScreen.remove(), 500);
    }, 5500);
}

contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitButton.disabled || !contactForm.reportValidity()) return;

    const originalText = submitButton.textContent;
    const status = contactForm.querySelector('.contact-status');
    status.textContent = 'Sending your message…';
    contactForm.setAttribute('aria-busy', 'true');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';

    try {
        const response = await fetch('https://formsubmit.co/ajax/dmoze1257@gmail.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(Object.fromEntries(new FormData(contactForm))),
            signal: controller.signal
        });
        const result = await response.json();
        const accepted = result.success === true || result.success === 'true';
        if (!response.ok || !accepted || /activat|confirm your email/i.test(result.message || '')) {
            throw new Error('Submission not confirmed');
        }
        contactForm.reset();
        status.textContent = 'Your message has been sent.';
    } catch {
        status.textContent = 'Sending could not be confirmed. Your text has been kept.';
    } finally {
        clearTimeout(timeout);
        contactForm.removeAttribute('aria-busy');
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
});
