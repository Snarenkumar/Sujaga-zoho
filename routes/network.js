const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('network', {
    role: req.query.role || 'investigator',
    page: 'network',
    filter: req.query.filter || null
  });
});

router.get('/evidence', (req, res) => {
  res.render('evidence-trail', {
    role: req.query.role || 'investigator',
    page: 'evidence',
    matchId: req.query.matchId || 'MO-001'
  });
});

module.exports = router;
