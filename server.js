'use strict';
require('dotenv').config();

const express  = require('express');
const session  = require('express-session');
const compress = require('compression');
const path     = require('path');
const fs       = require('fs');

const authRoutes    = require('./src/routes/auth');
const cvRoutes      = require('./src/routes/cv');
const paymentRoutes = require('./src/routes/payment');
const userRoutes    = require('./src/routes/user');
const adminRoutes   = require('./src/routes/admin');

try { fs.mkdirSync('./data',    { recursive: true }); } catch(_) {}
try { fs.mkdirSync('./uploads', { recursive: true }); } catch(_) {}

require('./src/models/database');

const app  = express();
const PORT = process.env.PORT || 3000;
const PUB  = path.join(__dirname, 'public');

app.set('trust proxy', 1);
app.use(compress());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(session({
  secret           : process.env.SESSION_SECRET || 'cvyap_dev_secret_2024',
  resave           : false,
  saveUninitialized: false,
  cookie: { httpOnly:true, secure:false, maxAge:30*24*60*60*1000, sameSite:'lax' }
}));

// Ziyaretçi takibi - sadece ana sayfa ve gerçek sayfalar
app.use(function(req, res, next) {
  if (req.method === 'GET' 
      && !req.path.startsWith('/api/') 
      && !req.path.includes('.')
      && req.path !== '/admin') {
    try {
      const { q } = require('./src/models/database');
      const today = new Date().toISOString().split('T')[0];
      // Gerçek IP al (proxy arkasında)
      const ip = req.headers['x-forwarded-for']
        ? req.headers['x-forwarded-for'].split(',')[0].trim()
        : (req.ip || req.connection.remoteAddress || 'unknown');
      q.insertVisit.run(today, ip, req.path);
    } catch(_) {}
  }
  next();
});

app.use('/api/auth',    authRoutes);
app.use('/api/cv',      cvRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/user',    userRoutes);
app.use('/api/admin',   adminRoutes);

const MIME = {
  '.html':'text/html; charset=utf-8', '.css':'text/css',
  '.js':'application/javascript',     '.json':'application/json',
  '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.ico':'image/x-icon',
};

app.use(function(req, res, next) {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
  const fp  = path.join(PUB, req.path);
  const ext = path.extname(req.path).toLowerCase();
  if (!fp.startsWith(PUB)) return res.status(403).end();
  try {
    if (fs.existsSync(fp) && fs.statSync(fp).isFile()) {
      res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
      return fs.createReadStream(fp).pipe(res);
    }
  } catch(_) {}
  next();
});

app.get('*', function(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(fs.readFileSync(path.join(PUB, 'index.html'), 'utf8'));
});

app.use(function(err, req, res, next) {
  console.error('[HATA]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Sunucu hatasi.' });
});

app.listen(PORT, function() {
  console.log('CVYap calisiyor: http://localhost:' + PORT);
});

module.exports = app;
