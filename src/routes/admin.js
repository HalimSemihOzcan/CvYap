'use strict';
const router = require('express').Router();
const c      = require('../controllers/adminController');

function requireAdmin(req, res, next) {
  if (!req.session?.isAdmin) return res.status(401).json({ error: 'Yetkisiz erişim.' });
  next();
}

router.post('/login',  c.login);
router.post('/logout', requireAdmin, c.logout);
router.get('/stats',   requireAdmin, c.stats);
router.get('/users',   requireAdmin, c.users);

module.exports = router;
