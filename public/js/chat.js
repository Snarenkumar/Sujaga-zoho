let currentLang = 'en';
let messageCount = 0;
let proactiveShown = false;

document.addEventListener('DOMContentLoaded', () => {
  addBotMessage(currentLang === 'kn'
    ? 'ನಮಸ್ಕಾರ! ನಾನು Zia — Karnataka crime intelligence assistant. ಪ್ರಕರಣಗಳು, MO patterns, ಅಪಾಯದ ಆರೋಪಿಗಳ ಬಗ್ಗೆ ಕೇಳಿ.'
    : 'Hello! I\'m Zia — your Karnataka crime intelligence assistant. Ask about cases, MO patterns, or high-risk accused.');

  setTimeout(showProactiveNudge, 5000);
});

function setLang(lang) {
  currentLang = lang;
  document.getElementById('lang-en').classList.toggle('active', lang === 'en');
  document.getElementById('lang-kn').classList.toggle('active', lang === 'kn');
}

function askQuestion(q) {
  document.getElementById('chat-input').value = q;
  sendMessage();
}

function sendMessage() {
  const input = document.getElementById('chat-input');
  const query = input.value.trim();
  if (!query) return;

  addUserMessage(query);
  input.value = '';
  messageCount++;

  if (messageCount >= 2 && !proactiveShown) {
    setTimeout(showProactiveNudge, 1500);
  }

  fetch('/chat/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, lang: currentLang })
  })
    .then(r => r.json())
    .then(data => addBotMessage(data.answer, data.match_id, data.related_fir_ids))
    .catch(() => addBotMessage('Sorry, unable to process query.'));
}

function showProactiveNudge() {
  if (proactiveShown) return;
  proactiveShown = true;

  fetch(`/chat/proactive?lang=${currentLang}`)
    .then(r => r.json())
    .then(data => {
      const container = document.getElementById('chat-messages');
      const div = document.createElement('div');
      div.className = 'msg bot proactive';
      div.innerHTML = formatBotMessage(data.answer) + `
        <div class="msg-actions">
          <a href="/network?filter=burglary">View pattern on Network Graph →</a>
          ${data.match_id ? `<button onclick="openEvidenceModal('${data.match_id}')">View evidence trail</button>` : ''}
        </div>`;
      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
    });
}

function addUserMessage(text) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'msg user';
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function addBotMessage(text, matchId, firIds) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'msg bot';
  let actions = '';
  if (matchId) {
    actions += `<button onclick="openEvidenceModal('${matchId}')">View evidence trail</button>`;
  }
  if (firIds && firIds.length) {
    actions += `<a href="/network">View network graph →</a>`;
  }
  div.innerHTML = formatBotMessage(text) + (actions ? `<div class="msg-actions">${actions}</div>` : '');
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}
