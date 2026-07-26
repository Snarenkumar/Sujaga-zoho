function setGlobalLang(lang) {
  localStorage.setItem('sujaga_lang', lang);
  document.documentElement.lang = lang;
  
  // Update nav toggle buttons
  const enBtn = document.getElementById('nav-lang-en');
  const knBtn = document.getElementById('nav-lang-kn');
  if (enBtn && knBtn) {
    if (lang === 'kn') {
      enBtn.classList.remove('active');
      knBtn.classList.add('active');
    } else {
      knBtn.classList.remove('active');
      enBtn.classList.add('active');
    }
  }

  // Add/remove a class on body to let CSS handle visibilities
  if (lang === 'kn') {
    document.body.classList.add('lang-kn');
    document.body.classList.remove('lang-en');
  } else {
    document.body.classList.add('lang-en');
    document.body.classList.remove('lang-kn');
  }

  // Dispatch custom event for dynamic components (like the chat)
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('sujaga_lang') || 'en';
  setGlobalLang(savedLang);
});
