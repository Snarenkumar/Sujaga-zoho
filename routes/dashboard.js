const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { role: null, page: 'home' });
});

router.get('/dashboard', (req, res) => {
  const role = req.query.role || 'supervisor';
  const store = res.locals.store;
  const firs = res.locals.allFirs();

  const crimesByType = {};
  const crimesByDistrict = {};
  const monthlyTrend = {};

  firs.forEach(f => {
    crimesByType[f.crime_type] = (crimesByType[f.crime_type] || 0) + 1;
    crimesByDistrict[f.district] = (crimesByDistrict[f.district] || 0) + 1;
    const month = f.date_time.substring(0, 7);
    monthlyTrend[month] = (monthlyTrend[month] || 0) + 1;
  });

  const accusedSorted = [...store.accused]
    .filter(a => a.risk_score > 0)
    .sort((a, b) => b.risk_score - a.risk_score);

  res.render('dashboard', {
    role,
    page: 'dashboard',
    stats: {
      totalFirs: firs.length,
      openCases: firs.filter(f => f.status === 'open').length,
      highRiskOffenders: store.accused.filter(a => a.risk_score >= 70).length,
      crossDistrictMatches: store.moMatches.length
    },
    crimesByType,
    crimesByDistrict,
    monthlyTrend,
    accusedSorted
  });
});

router.get('/hotspots', (req, res) => {
  res.render('hotspots', { role: req.query.role || 'supervisor', page: 'hotspots' });
});

router.get('/roadmap', (req, res) => {
  res.render('roadmap', { role: req.query.role || 'supervisor', page: 'roadmap' });
});

module.exports = router;
