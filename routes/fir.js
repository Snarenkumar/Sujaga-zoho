const express = require('express');
const router = express.Router();

const MO_TRIGGERS = ['chain', 'two-wheeler', 'pulsar', 'snatch', 'burglary', 'ignition', 'pillion'];

function checkMoMatch(moText, store) {
  const lower = moText.toLowerCase();
  const keywords = lower.split(/\s+/).filter(w => w.length > 3);

  for (const match of store.moMatches) {
    const snippet = (match.mo_snippet_1 + ' ' + match.mo_snippet_2).toLowerCase();
    const overlap = keywords.filter(k => snippet.includes(k));
    if (overlap.length >= 2) {
      return match;
    }
  }

  for (const trigger of MO_TRIGGERS) {
    if (lower.includes(trigger)) {
      const match = store.moMatches.find(m =>
        m.mo_snippet_1.toLowerCase().includes(trigger) ||
        m.mo_snippet_2.toLowerCase().includes(trigger)
      );
      if (match) return match;
    }
  }

  return null;
}

function daysAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

router.get('/entry', (req, res) => {
  res.render('fir-entry', { role: 'data-entry', page: 'fir-entry', match: null, success: null });
});

router.post('/entry', (req, res) => {
  const store = res.locals.store;
  const body = req.body;

  const newId = `FIR-2025-${String(store.firs.length + store.sessionFirs.length + 1).padStart(3, '0')}`;
  const newFir = {
    id: newId,
    fir_no: body.fir_no || newId,
    date_time: body.date_time || new Date().toISOString(),
    district: body.district,
    police_station: body.police_station,
    ipc_sections: body.ipc_sections,
    crime_type: body.crime_type,
    location_text: body.location_text,
    lat: parseFloat(body.lat) || 12.9716,
    lng: parseFloat(body.lng) || 77.5946,
    mo_description: body.mo_description,
    accused_ids: [],
    victim_ids: [],
    accused_names: body.accused_names,
    victim_names: body.victim_names,
    status: 'open'
  };

  store.sessionFirs.push(newFir);

  const moMatch = checkMoMatch(body.mo_description || '', store);
  let matchInfo = null;

  if (moMatch) {
    const matchedFir = [...store.firs, ...store.sessionFirs].find(f => f.id === moMatch.fir_id_1 || f.id === moMatch.fir_id_2);
    const otherId = moMatch.fir_id_1 === newId ? moMatch.fir_id_2 :
      (moMatch.fir_id_2 === newId ? moMatch.fir_id_1 :
        (matchedFir ? matchedFir.id : moMatch.fir_id_2));
    const otherFir = [...store.firs, ...store.sessionFirs].find(f => f.id === otherId);

    matchInfo = {
      matchId: moMatch.id,
      similarity: Math.round(moMatch.similarity_score * 100),
      otherFirNo: otherFir ? otherFir.fir_no : otherId,
      otherDistrict: otherFir ? otherFir.district : 'Unknown',
      daysAgo: otherFir ? daysAgo(otherFir.date_time) : 18,
      reason: moMatch.reason
    };
  }

  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.json({ success: true, fir: newFir, match: matchInfo });
  }

  res.render('fir-entry', {
    role: 'data-entry',
    page: 'fir-entry',
    success: 'Record synced successfully via Zoho Flow.',
    match: matchInfo
  });
});

module.exports = router;
