let currentLang = localStorage.getItem('sujaga_lang') || 'en';
let messageCount = 0;
let proactiveShown = false;

window.addEventListener('languageChanged', (e) => {
  currentLang = e.detail.lang;
});

document.addEventListener('DOMContentLoaded', () => {
  addBotMessage(currentLang === 'kn'
    ? 'ನಮಸ್ಕಾರ! ನಾನು Zia — Karnataka crime intelligence assistant. ಪ್ರಕರಣಗಳು, MO patterns, ಅಪಾಯದ ಆರೋಪಿಗಳ ಬಗ್ಗೆ ಕೇಳಿ.'
    : 'Hello! I\'m Zia — your Karnataka crime intelligence assistant. Ask about cases, MO patterns, or high-risk accused.');

  setTimeout(showProactiveNudge, 5000);
});

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

function downloadChatPDF() {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    alert('jsPDF library not loaded yet.');
    return;
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxLineWidth = pageWidth - (margin * 2);

  // Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Sujaga — Chat Transcript", margin, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const now = new Date();
  const timestampStr = `Generated on: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
  doc.text(timestampStr, margin, 27);

  doc.setLineWidth(0.5);
  doc.line(margin, 31, pageWidth - margin, 31);

  let y = 40;

  // Extract messages from DOM
  const messageElements = document.querySelectorAll('#chat-messages .msg');

  messageElements.forEach((el) => {
    let sender = 'Zia';
    if (el.classList.contains('user')) {
      sender = 'You';
    }

    // Get text content without button texts
    const clone = el.cloneNode(true);
    const actions = clone.querySelector('.msg-actions');
    if (actions) actions.remove();
    
    let text = clone.innerText || clone.textContent || '';
    text = text.trim().replace(/\s+/g, ' ');

    if (!text) return;

    const lineText = `${sender}: ${text}`;
    const lines = doc.splitTextToSize(lineText, maxLineWidth);

    const neededHeight = lines.length * 6 + 4;
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = 20;
    }

    if (sender === 'You') {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(37, 99, 235); // Blue tint for user
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59); // Slate dark for Zia
    }

    lines.forEach(line => {
      doc.text(line, margin, y);
      y += 6;
    });
    y += 4;
  });

  const dateStr = now.toISOString().split('T')[0];
  doc.save(`sujaga-chat-transcript-${dateStr}.pdf`);
}
