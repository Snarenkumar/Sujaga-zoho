require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.X_ZOHO_CATALYST_LISTEN_PORT || process.env.PORT || 9000;

// Load mock data into memory
const dataDir = path.join(__dirname, 'data');
function loadJSON(filename) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, filename), 'utf8'));
}

const store = {
  firs: loadJSON('firs.json'),
  accused: loadJSON('accused.json'),
  victims: loadJSON('victims.json'),
  timeline: loadJSON('timeline.json'),
  moMatches: loadJSON('mo_matches.json'),
  chatQna: loadJSON('chat_qna.json'),
  borderFirs: loadJSON('border_state_firs.json'),
  socioDemographic: loadJSON('socio_demographic.json'),
  auditLog: loadJSON('audit_log.json'),
  sessionFirs: []
};

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.locals.store = store;
  res.locals.allFirs = () => [...store.firs, ...store.sessionFirs];
  next();
});

// Routes
app.use('/', require('./routes/dashboard'));
app.use('/fir', require('./routes/fir'));
app.use('/chat', require('./routes/chat'));
app.use('/network', require('./routes/network'));
app.use('/interstate', require('./routes/interstate'));

app.get('/audit-log', (req, res) => {
  res.render('audit-log', { role: req.query.role || 'supervisor', page: 'audit-log', auditLogs: store.auditLog });
});

app.get('/architecture', (req, res) => {
  res.render('architecture', { role: req.query.role, page: 'architecture' });
});

// API routes
app.get('/api/socio-demographic', (req, res) => res.json(store.socioDemographic));
app.get('/api/audit-log', (req, res) => res.json(store.auditLog));
app.get('/api/firs', (req, res) => res.json([...store.firs, ...store.sessionFirs]));
app.get('/api/accused', (req, res) => res.json(store.accused));
app.get('/api/hotspots', (req, res) => {
  const firs = [...store.firs, ...store.sessionFirs];
  const clusters = detectHotspots(firs);
  res.json(clusters);
});
app.get('/api/network', (req, res) => {
  res.json(buildNetworkData(store));
});
app.get('/api/evidence/:matchId', (req, res) => {
  const match = store.moMatches.find(m => m.id === req.params.matchId);
  if (!match) return res.status(404).json({ error: 'Match not found' });
  const fir1 = findFir(store, match.fir_id_1);
  const fir2 = findFir(store, match.fir_id_2);
  const weights = {
    mo_similarity: 55,
    location_proximity: 30,
    time_window: 15
  };
  res.json({ match, fir1, fir2, weights });
});
app.get('/api/interstate-match/:firId', (req, res) => {
  const targetFir = findFir(store, req.params.firId);
  if (!targetFir) return res.status(404).json({ error: 'FIR not found' });
  
  // Find matching border FIR based on crime_type or MO keywords
  let match = store.borderFirs.find(b => b.crime_type === targetFir.crime_type);
  if (!match) match = store.borderFirs[0];

  res.json({
    found: true,
    similarity: 91,
    targetFir,
    matchedBorderFir: match,
    weights: {
      mo_similarity: 60,
      vehicle_match: 25,
      time_window: 15
    },
    reason: `Simulated CCTNS cross-boundary fingerprint match between ${targetFir.fir_no} (${targetFir.district}) and ${match.fir_no} (${match.state})`
  });
});

app.get('/api/stats', (req, res) => {
  const firs = [...store.firs, ...store.sessionFirs];
  const highRisk = store.accused.filter(a => a.risk_score >= 70).length;
  res.json({
    totalFirs: firs.length,
    openCases: firs.filter(f => f.status === 'open').length,
    highRiskOffenders: highRisk,
    crossDistrictMatches: store.moMatches.length
  });
});

function findFir(store, id) {
  return [...store.firs, ...store.sessionFirs].find(f => f.id === id);
}

function detectHotspots(firs) {
  const RADIUS_KM = 3;
  const MIN_COUNT = 3;
  const clusters = [];
  const used = new Set();

  firs.forEach((fir, i) => {
    if (used.has(fir.id)) return;
    const nearby = firs.filter((other, j) => {
      if (i === j || used.has(other.id)) return false;
      return haversine(fir.lat, fir.lng, other.lat, other.lng) <= RADIUS_KM;
    });
    if (nearby.length + 1 >= MIN_COUNT) {
      const group = [fir, ...nearby];
      group.forEach(f => used.add(f.id));
      const dates = group.map(f => new Date(f.date_time)).sort((a, b) => a - b);
      clusters.push({
        id: `hs-${clusters.length + 1}`,
        district: fir.district,
        crime_type: mostCommon(group.map(f => f.crime_type)),
        incident_count: group.length,
        date_from: dates[0].toISOString().split('T')[0],
        date_to: dates[dates.length - 1].toISOString().split('T')[0],
        lat: fir.lat,
        lng: fir.lng,
        fir_ids: group.map(f => f.id)
      });
    }
  });
  return clusters;
}

function mostCommon(arr) {
  const counts = {};
  arr.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildNetworkData(store) {
  const nodes = store.accused.map(a => ({
    id: a.id,
    label: a.name,
    risk_score: a.risk_score,
    district: a.district,
    linked_firs: a.linked_fir_ids
  }));

  const edgeMap = new Map();
  store.accused.forEach(a => {
    a.known_associate_ids.forEach(assocId => {
      const key = [a.id, assocId].sort().join('-');
      if (!edgeMap.has(key)) {
        edgeMap.set(key, {
          from: a.id,
          to: assocId,
          last_seen_days_ago: a.last_seen_days_ago || 30,
          connected_via_fir: a.linked_fir_ids[0] || 'N/A',
          last_seen_date: a.last_seen_date || '2025-06-01'
        });
      }
    });
  });

  store.accused.forEach(a1 => {
    store.accused.forEach(a2 => {
      if (a1.id >= a2.id) return;
      const shared = a1.linked_fir_ids.filter(id => a2.linked_fir_ids.includes(id));
      if (shared.length > 0) {
        const key = [a1.id, a2.id].sort().join('-');
        if (!edgeMap.has(key)) {
          edgeMap.set(key, {
            from: a1.id,
            to: a2.id,
            last_seen_days_ago: Math.min(a1.last_seen_days_ago || 60, a2.last_seen_days_ago || 60),
            connected_via_fir: shared[0],
            last_seen_date: a1.last_seen_date || '2025-05-15'
          });
        }
      }
    });
  });

  return { nodes, edges: Array.from(edgeMap.values()) };
}

app.listen(PORT, () => {
  console.log(`\n  ⚡ Sujaga (ಸುಜಾಗ) running at http://localhost:${PORT}\n`);
});
