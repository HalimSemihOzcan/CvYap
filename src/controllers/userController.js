'use strict';
const bcrypt = require('bcryptjs');
const { q }  = require('../models/database');

function profile(req, res) {
  const u = req.user;
  res.json({
    name     : u.name,
    email    : u.email,
    isPremium: !!u.is_premium,
    plan     : u.plan,
    planEnds : u.plan_ends,
    joined   : u.created_at
  });
}

async function updateProfile(req, res, next) {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const user = q.userById.get(req.user.id);

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ error: 'Mevcut şifrenizi girin.' });
      const ok = await bcrypt.compare(currentPassword, user.password);
      if (!ok)              return res.status(400).json({ error: 'Mevcut şifre hatalı.' });
      if (newPassword.length < 6) return res.status(400).json({ error: 'Yeni şifre en az 6 karakter olmalı.' });
      q.updatePassword.run(await bcrypt.hash(newPassword, 12), req.user.id);
    }

    if (name?.trim()) {
      q.updateUser.run(name.trim(), req.user.id);
    }

    res.json({ success: true, message: 'Profil güncellendi.' });
  } catch (err) { next(err); }
}

function cancelSubscription(req, res, next) {
  try {
    q.cancelPremium.run(req.user.id);
    req.session.isPremium = false;
    req.session.save();
    res.json({ success: true, message: 'Abonelik iptal edildi.' });
  } catch (err) { next(err); }
}

module.exports = { profile, updateProfile, cancelSubscription };
