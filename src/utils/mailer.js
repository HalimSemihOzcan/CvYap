'use strict';
const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host  : process.env.SMTP_HOST   || 'smtp.gmail.com',
    port  : parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth  : {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });
  return transporter;
}

async function sendVerificationEmail(to, name, code) {
  const from = process.env.MAIL_FROM || 'CVYap <noreply@cvyap.com>';
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px">
      <div style="text-align:center;margin-bottom:28px">
        <h1 style="color:#2563eb;font-size:28px;margin:0">CVYap</h1>
        <p style="color:#64748b;margin:6px 0 0">Profesyonel CV Oluşturucu</p>
      </div>
      <div style="background:#fff;border-radius:10px;padding:28px;border:1px solid #e2e8f0">
        <h2 style="color:#0f172a;margin:0 0 14px">Merhaba, ${name}!</h2>
        <p style="color:#334155;line-height:1.6;margin:0 0 22px">
          CVYap'ye hoş geldiniz. Hesabınızı etkinleştirmek için aşağıdaki doğrulama kodunu girin.
        </p>
        <div style="text-align:center;margin:28px 0">
          <div style="display:inline-block;background:#eff6ff;border:2px solid #2563eb;border-radius:12px;padding:16px 36px">
            <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#2563eb">${code}</span>
          </div>
          <p style="color:#64748b;font-size:13px;margin:12px 0 0">Bu kod 15 dakika geçerlidir</p>
        </div>
        <p style="color:#94a3b8;font-size:13px;margin:0;line-height:1.6">
          Bu e-postayı siz talep etmediyseniz güvenle görmezden gelebilirsiniz.
        </p>
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:12px;margin:20px 0 0">
        © 2024 CVYap · Tüm hakları saklıdır
      </p>
    </div>
  `;

  try {
    await getTransporter().sendMail({
      from,
      to,
      subject: 'CVYap — E-posta Doğrulama Kodunuz: ' + code,
      html,
    });
    return true;
  } catch (err) {
    console.error('[MAIL HATA]', err.message);
    // Geliştirme modunda kodu konsola yaz
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n📧 [DEV] Doğrulama kodu:', code, '→', to, '\n');
    }
    return false;
  }
}

module.exports = { sendVerificationEmail };
