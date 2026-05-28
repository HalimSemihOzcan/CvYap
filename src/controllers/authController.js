'use strict';
const bcrypt   = require('bcryptjs');
const { v4: uuid } = require('uuid');
const { q }    = require('../models/database');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* POST /api/auth/register — doğrulamasız direkt kayıt */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password)
      return res.status(400).json({ error: 'Ad, e-posta ve şifre zorunludur.' });
    if (!EMAIL_RE.test(email))
      return res.status(400).json({ error: 'Geçerli bir e-posta adresi girin.' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Şifre en az 6 karakter olmalıdır.' });
    if (q.userByEmail.get(email.trim()))
      return res.status(409).json({ error: 'Bu e-posta adresi zaten kayıtlı.' });

    const hash = await bcrypt.hash(password, 12);
    q.insertUser.run(uuid(), name.trim(), email.trim().toLowerCase(), hash);
    const user = q.userByEmail.get(email.trim());

    req.session.userId = user.id;
    req.session.save();

    res.status(201).json({
      success: true,
      user: userDto(user)
    });
  } catch (err) { next(err); }
}

/* POST /api/auth/login */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'E-posta ve şifre girin.' });

    const user = q.userByEmail.get(email.trim());
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });

    req.session.userId = user.id;
    req.session.save();
    res.json({ success: true, user: userDto(user) });
  } catch (err) { next(err); }
}

/* POST /api/auth/logout */
function logout(req, res) {
  req.session.destroy(() => { res.clearCookie('connect.sid'); res.json({ success: true }); });
}

/* GET /api/auth/me */
function me(req, res) {
  if (!req.session?.userId) return res.json({ loggedIn: false });
  const user = q.userById.get(req.session.userId);
  if (!user) return res.json({ loggedIn: false });
  res.json({ loggedIn: true, user: userDto(user) });
}

function userDto(u) {
  const isAI = u.plan === 'ai' && u.plan_ends && new Date(u.plan_ends) > new Date();
  return {
    name      : u.name,
    email     : u.email,
    plan      : u.plan,
    isAI      : isAI,
    credits   : u.cv_credits || 0,
    planEnds  : u.plan_ends
  };
}

module.exports = { register, login, logout, me };
