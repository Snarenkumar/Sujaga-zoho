const express = require('express');
const router = express.Router();

function findAnswer(query, lang, store) {
  const q = query.toLowerCase();

  let best = store.chatQna.find(entry => entry.intent === 'default');
  let bestScore = 0;

  for (const entry of store.chatQna) {
    if (entry.intent === 'default' || entry.intent === 'proactive_nudge') continue;
    let score = 0;
    for (const kw of entry.keywords) {
      if (q.includes(kw.toLowerCase())) score += kw.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  if (bestScore === 0) {
    if (q.includes('mysuru') || q.includes('mysore')) {
      const filtered = store.firs.filter(f =>
        f.district === 'Mysuru' && f.date_time.startsWith('2025-07')
      );
      if (filtered.length) {
        return {
          answer: lang === 'kn'
            ? `Mysuru July: ${filtered.length} ಪ್ರಕರಣಗಳು — ${filtered.map(f => f.fir_no).join(', ')}`
            : `Found **${filtered.length} cases** in Mysuru this month:\n\n${filtered.map(f => `• **${f.fir_no}** — ${f.crime_type}, ${f.police_station}`).join('\n')}`,
          related_fir_ids: filtered.map(f => f.id),
          match_id: null
        };
      }
    }
  }

  return {
    answer: lang === 'kn' ? best.answer_kn : best.answer_en,
    related_fir_ids: best.related_fir_ids,
    match_id: best.match_id
  };
}

router.get('/', (req, res) => {
  res.render('chat', { role: req.query.role || 'investigator', page: 'chat' });
});

router.post('/query', (req, res) => {
  const { query, lang } = req.body;
  const store = res.locals.store;
  const result = findAnswer(query || '', lang || 'en', store);
  res.json(result);
});

router.get('/proactive', (req, res) => {
  const store = res.locals.store;
  const nudge = store.chatQna.find(e => e.intent === 'proactive_nudge');
  const lang = req.query.lang || 'en';
  res.json({
    answer: lang === 'kn' ? nudge.answer_kn : nudge.answer_en,
    related_fir_ids: nudge.related_fir_ids,
    match_id: nudge.match_id,
    is_proactive: true
  });
});

module.exports = router;
