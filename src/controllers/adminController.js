'use strict';
const { q } = require('../models/database');

const ADMIN_USER = 'Semih';
const ADMIN_PASS = 'admin.1242.';

function login(req, res) {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.isAdmin = true;
    req.session.save();
    return res.json({ success: true });
  }
  res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
}

function logout(req, res) {
  req.session.isAdmin = false;
  req.session.save();
  res.json({ success: true });
}

function stats(req, res) {
  const today = new Date().toISOString().split('T')[0];
  res.json({
    users     : q.adminUserCount.get().n,
    cvs       : q.adminCVCount.get().n,
    payments  : q.adminPayCount.get().n,
    revenue   : q.adminRevenue.get().total,
    todayVisits: q.adminVisitToday.get(today).n,
    visitDays : q.adminVisitDays.all(),
    recentPays: q.adminRecentPay.all(),
  });
}

function users(req, res) {
  res.json({ users: q.adminUsers.all() });
}

module.exports = { login, logout, stats, users };
