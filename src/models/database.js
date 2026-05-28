'use strict';
const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');

const DB_DIR  = path.resolve(process.env.DB_PATH ? path.dirname(process.env.DB_PATH) : './data');
const DB_FILE = path.resolve(process.env.DB_PATH || './data/cvyap.db');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid       TEXT    NOT NULL UNIQUE,
    name       TEXT    NOT NULL,
    email      TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    password   TEXT    NOT NULL,
    plan       TEXT    NOT NULL DEFAULT 'free',
    cv_credits INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cvs (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid       TEXT    NOT NULL UNIQUE,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title      TEXT    NOT NULL DEFAULT 'CVim',
    template   TEXT    NOT NULL DEFAULT 'harvard',
    color      TEXT    NOT NULL DEFAULT '#2563eb',
    data       TEXT    NOT NULL DEFAULT '{}',
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS payments (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid       TEXT    NOT NULL UNIQUE,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount     REAL    NOT NULL,
    status     TEXT    NOT NULL DEFAULT 'pending',
    iyzico_ref TEXT,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS visits (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    date       TEXT    NOT NULL,
    ip         TEXT,
    path       TEXT,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_cvs_user    ON cvs(user_id);
  CREATE INDEX IF NOT EXISTS idx_pay_user    ON payments(user_id);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(date);
`);

/* Migration — eski DB varsa yeni kolonları ekle */
const cols = db.prepare('PRAGMA table_info(users)').all().map(function(c){ return c.name; });
if (!cols.includes('cv_credits')) { try { db.exec('ALTER TABLE users ADD COLUMN cv_credits INTEGER NOT NULL DEFAULT 0'); } catch(e){} }
if (!cols.includes('plan'))       { try { db.exec("ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free'"); } catch(e){} }

const NOW = "datetime('now')";

const q = {
  /* users */
  insertUser     : db.prepare("INSERT INTO users (uuid,name,email,password) VALUES (?,?,?,?)"),
  userByEmail    : db.prepare("SELECT * FROM users WHERE email=? COLLATE NOCASE"),
  userById       : db.prepare("SELECT * FROM users WHERE id=?"),
  addCredit      : db.prepare("UPDATE users SET cv_credits=cv_credits+1, updated_at=datetime('now') WHERE id=?"),
  useCredit      : db.prepare("UPDATE users SET cv_credits=cv_credits-1, updated_at=datetime('now') WHERE id=?"),
  updateUser     : db.prepare("UPDATE users SET name=?, updated_at=datetime('now') WHERE id=?"),
  updatePassword : db.prepare("UPDATE users SET password=?, updated_at=datetime('now') WHERE id=?"),

  /* cvs */
  insertCV       : db.prepare("INSERT INTO cvs (uuid,user_id,title,template,color,data) VALUES (?,?,?,?,?,?)"),
  cvsByUser      : db.prepare("SELECT * FROM cvs WHERE user_id=? ORDER BY updated_at DESC"),
  cvByUuid       : db.prepare("SELECT * FROM cvs WHERE uuid=?"),
  updateCV       : db.prepare("UPDATE cvs SET title=?, template=?, color=?, data=?, updated_at=datetime('now') WHERE uuid=? AND user_id=?"),
  deleteCV       : db.prepare("DELETE FROM cvs WHERE uuid=? AND user_id=?"),

  /* payments */
  insertPayment  : db.prepare("INSERT INTO payments (uuid,user_id,amount,status) VALUES (?,?,?,'pending')"),
  completePayment: db.prepare("UPDATE payments SET status='completed', iyzico_ref=? WHERE uuid=?"),
  paysByUser     : db.prepare("SELECT * FROM payments WHERE user_id=? ORDER BY created_at DESC"),

  /* visits */
  insertVisit    : db.prepare("INSERT INTO visits (date,ip,path) VALUES (?,?,?)"),

  /* admin */
  adminUsers     : db.prepare("SELECT id,name,email,plan,cv_credits,created_at FROM users ORDER BY created_at DESC"),
  adminUserCount : db.prepare("SELECT COUNT(*) as n FROM users"),
  adminCVCount   : db.prepare("SELECT COUNT(*) as n FROM cvs"),
  adminPDFCount  : db.prepare("SELECT COUNT(*) as n FROM payments WHERE status='completed'"),
  adminPayCount  : db.prepare("SELECT COUNT(*) as n FROM payments WHERE status='completed'"),
  adminRevenue   : db.prepare("SELECT COALESCE(SUM(amount),0) as total FROM payments WHERE status='completed'"),
  adminVisitToday: db.prepare("SELECT COUNT(DISTINCT ip) as n FROM visits WHERE date=?"),
  adminVisitDays : db.prepare("SELECT date, COUNT(DISTINCT ip) as visitors, COUNT(*) as pageviews FROM visits GROUP BY date ORDER BY date DESC LIMIT 30"),
  adminRecentPay : db.prepare("SELECT p.uuid, p.amount, p.status, p.created_at, u.name, u.email FROM payments p JOIN users u ON u.id=p.user_id WHERE p.status='completed' ORDER BY p.created_at DESC LIMIT 20"),
};

module.exports = { db, q };
