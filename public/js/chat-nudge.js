document.addEventListener('DOMContentLoaded', () => {
  let messageCount = 0;
  let nudgeFired = false;

  const triggerNudge = () => {
    if (nudgeFired) return;
    nudgeFired = true;

    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const msgEl = document.createElement('div');
    msgEl.className = 'msg bot proactive';
    msgEl.innerHTML = `
      <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--zoho-red); margin-bottom:0.5rem; font-weight:600;">
        <i data-lucide="bell-ring" style="width:14px; height:14px;"></i> Zia noticed this
      </div>
      <p style="margin-bottom:0.75rem;">
        <span class="en">3 similar burglaries within 2km in the last 10 days — want to see the pattern?</span>
        <span class="kn" style="display:none;">ಕಳೆದ 10 ದಿನಗಳಲ್ಲಿ 2 ಕಿ.ಮೀ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ 3 ಅಂತಹುದೇ ಕಳ್ಳತನಗಳು — ಮಾದರಿಯನ್ನು ನೋಡಲು ಬಯಸುವಿರಾ?</span>
      </p>
      <div class="msg-actions">
        <a href="/network" style="background:var(--zoho-red); color:#fff; border-color:var(--zoho-red);">View pattern</a>
      </div>
    `;
    
    chatMessages.appendChild(msgEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    if (window.lucide) {
      lucide.createIcons();
    }
  };

  const timer = setTimeout(triggerNudge, 7000);

  const observer = new MutationObserver((mutations) => {
    for (let m of mutations) {
      if (m.addedNodes.length > 0) {
        m.addedNodes.forEach(node => {
          if (node.classList && node.classList.contains('user')) {
            messageCount++;
            if (messageCount >= 2) {
              setTimeout(() => {
                triggerNudge();
                clearTimeout(timer);
              }, 1000);
            }
          }
        });
      }
    }
  });

  const chatContainer = document.getElementById('chat-messages');
  if (chatContainer) {
    observer.observe(chatContainer, { childList: true });
  }
});
