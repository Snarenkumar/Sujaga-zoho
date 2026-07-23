document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('fir-form');
  if (form) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const dtInput = form.querySelector('[name="date_time"]');
    if (dtInput && !dtInput.value) dtInput.value = now.toISOString().slice(0, 16);
  }
});
