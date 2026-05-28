// Bu scripti çalıştırın: node find-csp.js
// Hangi paketin CSP eklediğini bulur
const http = require('http');
const express = require('express');

const app = express();

// Test 1: Sadece express
app.get('/test1', (req, res) => res.json({ test: 1 }));

const server = app.listen(4321, () => {
  http.get('http://localhost:4321/test1', (r) => {
    const csp = r.headers['content-security-policy'];
    console.log('Express CSP:', csp || 'YOK');
    
    // Şimdi diğer middleware'leri test et
    const express2 = require('express');
    const app2 = express2();
    const session = require('express-session');
    const SQLiteSt = require('connect-sqlite3')(session);
    
    app2.use(session({
      store: new SQLiteSt({ db: ':memory:', dir: '.' }),
      secret: 'test',
      resave: false,
      saveUninitialized: false
    }));
    app2.get('/test2', (req, res) => res.json({ test: 2 }));
    
    const server2 = app2.listen(4322, () => {
      http.get('http://localhost:4322/test2', (r2) => {
        const csp2 = r2.headers['content-security-policy'];
        console.log('Express + Session + SQLiteSt CSP:', csp2 || 'YOK');
        server.close();
        server2.close();
        
        if (csp2 && csp2.includes("script-src-attr 'none'")) {
          console.log('\n⚠️  SORUN: express-session veya connect-sqlite3 CSP ekliyor!');
        } else {
          console.log('\n✅ Bu paketler CSP eklemiyor. Sorun başka bir yerde.');
          console.log('Tüm package.json dependencies listeleyin: node list-deps.js');
        }
        process.exit(0);
      });
    });
  });
});
