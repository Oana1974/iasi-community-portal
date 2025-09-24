const form = document.getElementById('contactForm');
const out = document.getElementById('clientErrors');

form?.addEventListener('submit', (e) => {
  const data = new FormData(form);
  const name = (data.get('name') || '').trim();
  const email = (data.get('email') || '').trim();
  const message = (data.get('message') || '').trim();

  const errs = [];
  if (name.length < 2) errs.push('Please enter your full name (min 2 chars).');
  if (!/^\S+@\S+\.\S+$/.test(email)) errs.push('Please enter a valid email.');
  if (message.length < 10) errs.push('Message must be at least 10 characters.');

  if (errs.length) {
    e.preventDefault();
    out.innerHTML = errs.map(x => `• ${x}`).join('<br>');
  } else {
    out.textContent = '';
  }
});
