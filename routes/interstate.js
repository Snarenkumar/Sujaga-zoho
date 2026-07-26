const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const store = res.locals.store;
  const localFirs = [...store.firs, ...store.sessionFirs];
  res.render('interstate', { 
    role: req.query.role || 'investigator', 
    page: 'interstate',
    localFirs,
    borderFirs: store.borderFirs || []
  });
});

module.exports = router;
