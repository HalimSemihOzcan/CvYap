'use strict';
const { q } = require('../models/database');

function requireAuth(req, res, next) {
  if (!req.session?.userId)
    return res.status(401).json({ error: 'Giriş yapmanız gerekiyor.' });
  const user = q.userById.get(req.session.userId);
  if (!user) { req.session.destroy(() => {}); return res.status(401).json({ error: 'Oturum geçersiz.' }); }
  req.user = user;
  next();
}

module.exports = { requireAuth };
