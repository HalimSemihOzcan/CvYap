# CVYap.tr — Kurulum

## ⚠️ ÖNEMLİ: Eğer daha önce kurduysanız

```bash
cd cvyap3

# Eski node_modules'ü SİL (helmet ve diğer eski paketler temizlensin)
rm -rf node_modules package-lock.json

# Temiz kurulum
npm install

# Başlat
npm run dev
```

## İlk kurulum

```bash
cd cvyap3
npm install
npm run dev
# → http://localhost:3000
```

## .env Ayarları

`.env` dosyasını düzenleyin:
- `SESSION_SECRET` → güçlü rastgele string yazın
- `IYZICO_API_KEY` / `IYZICO_SECRET_KEY` → https://sandbox.iyzico.com

## Notlar

- Helmet paketi KASITLI olarak kaldırıldı (CSP sorunu yaratıyordu)
- PDF oluşturma Puppeteer ile yapılır (ilk kurulumda Chromium indirilir ~200MB)
- SQLite veritabanı `data/` klasöründe otomatik oluşturulur
