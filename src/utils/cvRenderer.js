'use strict';

const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function wrap(body, extraCss='') {
  return `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:210mm;min-height:297mm;background:#fff}
body{font-family:Arial,Helvetica,sans-serif;font-size:10.5px;line-height:1.55;color:#2d2d2d}
${extraCss}
</style></head><body>${body}</body></html>`;
}

/* Fotoğraf veya baş harf avatar */
function avatar(p, size, ac, style='') {
  const ini = ((p.firstName||'')[0]||(p.lastName||'')[0]||'?').toUpperCase();
  if (p.photo) {
    return `<img src="${p.photo}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;${style}" alt="Fotoğraf">`;
  }
  const fs = Math.round(size * 0.38);
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:rgba(255,255,255,.18);
    display:flex;align-items:center;justify-content:center;font-size:${fs}px;font-weight:700;${style}">${esc(ini)}</div>`;
}

function secTitle(text, color, style='line') {
  if (style==='plain')
    return `<div style="font-size:8.5px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:${color};margin:12px 0 7px">${esc(text)}</div>`;
  return `<div style="font-size:8.5px;font-weight:700;letter-spacing:1px;text-transform:uppercase;
    color:${color};border-bottom:1.5px solid ${color};padding-bottom:3px;margin:12px 0 7px">${esc(text)}</div>`;
}

function expBlock(e, ac) {
  return `<div style="margin-bottom:9px">
    <div style="display:flex;justify-content:space-between">
      <span style="font-weight:700;font-size:11px">${esc(e.position)}</span>
      <span style="font-size:9px;color:#888;white-space:nowrap">${esc(e.start)}${e.end?' – '+esc(e.end):''}</span>
    </div>
    <div style="font-size:10px;color:${ac};margin-bottom:2px">${esc(e.company)}</div>
    ${e.desc?`<div style="font-size:9.5px;color:#555;line-height:1.5">${esc(e.desc)}</div>`:''}
  </div>`;
}

function eduBlock(e, ac) {
  return `<div style="margin-bottom:8px">
    <div style="display:flex;justify-content:space-between">
      <span style="font-weight:700;font-size:11px">${esc(e.degree)} – ${esc(e.field)}</span>
      <span style="font-size:9px;color:#888;white-space:nowrap">${esc(e.start)}${e.end?' – '+esc(e.end):''}</span>
    </div>
    <div style="font-size:10px;color:${ac}">${esc(e.school)}</div>
  </div>`;
}

function skillBar(s, ac) {
  return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
    <span style="font-size:10px;min-width:84px">${esc(s.name)}</span>
    <div style="flex:1;height:4px;background:#e5e7eb;border-radius:2px">
      <div style="width:${s.level||75}%;height:100%;background:${ac};border-radius:2px"></div>
    </div>
  </div>`;
}

function langRow(l) {
  return `<div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:4px">
    <span style="font-weight:600">${esc(l.name)}</span>
    <span style="color:#888">${esc(l.level)}</span>
  </div>`;
}

function CT(p) {
  return [
    p.email?`<span>✉ ${esc(p.email)}</span>`:'',
    p.phone?`<span>☎ ${esc(p.phone)}</span>`:'',
    p.city ?`<span>⊙ ${esc(p.city)}</span>`:'',
    p.linkedin?`<span>in ${esc(p.linkedin)}</span>`:''
  ].filter(Boolean).join('');
}

function watermarkHtml() {
  return `<div style="position:fixed;bottom:18px;right:18px;font-size:9px;color:#c0c0c0;font-family:Arial;z-index:999">CVYap ile oluşturuldu</div>`;
}

/* ── ŞABLONLAR ─────────────────────────────────────── */

function harvard(d, ac='#2563eb', wm) {
  const p=d.personal||{}, fn=[p.firstName,p.lastName].filter(Boolean).join(' ')||'Ad Soyad';
  return wrap(`<div style="padding:36px 36px 28px">
    <div style="border-bottom:3px solid ${ac};padding-bottom:14px;margin-bottom:16px">
      <div style="font-size:24px;font-weight:700;color:${ac};margin-bottom:4px">${esc(fn)}</div>
      <div style="font-size:12px;color:#555;margin-bottom:8px">${esc(p.jobTitle)}</div>
      <div style="display:flex;flex-wrap:wrap;gap:14px;font-size:9.5px;color:#888">${CT(p)}</div>
    </div>
    ${p.summary?secTitle('Hakkımda',ac)+`<p style="font-size:10px;color:#444;line-height:1.65;margin-bottom:4px">${esc(p.summary)}</p>`:''}
    ${(d.experiences||[]).length?secTitle('Deneyim',ac)+(d.experiences||[]).map(e=>expBlock(e,ac)).join(''):''}
    ${(d.educations||[]).length?secTitle('Eğitim',ac)+(d.educations||[]).map(e=>eduBlock(e,ac)).join(''):''}
    ${(d.skills||[]).length?secTitle('Beceriler',ac)+(d.skills||[]).map(s=>skillBar(s,ac)).join(''):''}
    ${(d.languages||[]).length?secTitle('Diller',ac)+(d.languages||[]).map(l=>langRow(l)).join(''):''}
    ${wm?watermarkHtml():''}
  </div>`);
}

/* Oxford — fotoğraf destekli */
function oxford(d, ac='#434a54', wm) {
  const p=d.personal||{}, fn=[p.firstName,p.lastName].filter(Boolean).join(' ')||'Ad Soyad';
  return wrap(`<div style="display:grid;grid-template-columns:190px 1fr;min-height:297mm">
    <aside style="background:${ac};color:#fff;padding:28px 18px">
      <div style="display:flex;justify-content:center;margin-bottom:14px">
        ${avatar(p, 80, ac, 'border:3px solid rgba(255,255,255,.4);')}
      </div>
      <div style="font-size:15px;font-weight:700;text-align:center;margin-bottom:4px;line-height:1.2">${esc(fn)}</div>
      <div style="font-size:9.5px;opacity:.8;text-align:center;margin-bottom:18px">${esc(p.jobTitle)}</div>
      <div style="font-size:9px;opacity:.75;line-height:2.1">
        ${p.email?`<div>✉ ${esc(p.email)}</div>`:''}
        ${p.phone?`<div>☎ ${esc(p.phone)}</div>`:''}
        ${p.city?`<div>⊙ ${esc(p.city)}</div>`:''}
        ${p.linkedin?`<div>in ${esc(p.linkedin)}</div>`:''}
      </div>
      ${(d.skills||[]).length?`<div style="font-size:7.5px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;
        border-bottom:1px solid rgba(255,255,255,.3);padding-bottom:5px;margin:18px 0 10px">Beceriler</div>
        ${(d.skills||[]).map(s=>`<div style="margin-bottom:7px">
          <div style="font-size:9px;margin-bottom:3px">${esc(s.name)}</div>
          <div style="height:3px;background:rgba(255,255,255,.25);border-radius:2px">
            <div style="width:${s.level||75}%;height:100%;background:#fff;border-radius:2px"></div>
          </div></div>`).join('')}`:''}
      ${(d.languages||[]).length?`<div style="font-size:7.5px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;
        border-bottom:1px solid rgba(255,255,255,.3);padding-bottom:5px;margin:16px 0 10px">Diller</div>
        ${(d.languages||[]).map(l=>`<div style="display:flex;justify-content:space-between;font-size:9px;margin-bottom:4px;opacity:.85">
          <span>${esc(l.name)}</span><span>${esc(l.level)}</span></div>`).join('')}`:''}
    </aside>
    <main style="padding:30px 26px">
      ${p.summary?secTitle('Hakkımda',ac)+`<p style="font-size:10px;color:#444;line-height:1.65">${esc(p.summary)}</p>`:''}
      ${(d.experiences||[]).length?secTitle('Deneyim',ac)+(d.experiences||[]).map(e=>expBlock(e,ac)).join(''):''}
      ${(d.educations||[]).length?secTitle('Eğitim',ac)+(d.educations||[]).map(e=>eduBlock(e,ac)).join(''):''}
    </main>
  </div>${wm?watermarkHtml():''}`);
}

function stanford(d, ac='#424954', wm) {
  const p=d.personal||{}, fn=[p.firstName,p.lastName].filter(Boolean).join(' ')||'Ad Soyad';
  return wrap(`
    <div style="background:${ac};color:#fff;padding:22px 30px">
      <div style="font-size:22px;font-weight:700;margin-bottom:4px">${esc(fn)}</div>
      <div style="font-size:11px;opacity:.82;margin-bottom:8px">${esc(p.jobTitle)}</div>
      <div style="display:flex;flex-wrap:wrap;gap:14px;font-size:9px;opacity:.7">${CT(p)}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0">
      <div style="padding:20px 18px 20px 28px;border-right:1px solid #e5e7eb">
        ${p.summary?secTitle('Hakkımda',ac)+`<p style="font-size:10px;color:#444;line-height:1.65">${esc(p.summary)}</p>`:''}
        ${(d.experiences||[]).length?secTitle('Deneyim',ac)+(d.experiences||[]).map(e=>expBlock(e,ac)).join(''):''}
        ${(d.educations||[]).length?secTitle('Eğitim',ac)+(d.educations||[]).map(e=>eduBlock(e,ac)).join(''):''}
      </div>
      <div style="padding:20px 28px 20px 18px">
        ${(d.skills||[]).length?secTitle('Beceriler',ac)+(d.skills||[]).map(s=>skillBar(s,ac)).join(''):''}
        ${(d.languages||[]).length?secTitle('Diller',ac)+(d.languages||[]).map(l=>langRow(l)).join(''):''}
      </div>
    </div>${wm?watermarkHtml():''}`);
}

function cambridge(d, ac='#3f6592', wm) {
  const p=d.personal||{}, fn=[p.firstName,p.lastName].filter(Boolean).join(' ')||'Ad Soyad';
  return wrap(`<div style="padding:36px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;
      margin-bottom:18px;padding-bottom:14px;border-bottom:2px solid ${ac}">
      <div>
        <div style="font-size:26px;font-weight:700;color:${ac};margin-bottom:4px">${esc(fn)}</div>
        <div style="font-size:12px;color:#555">${esc(p.jobTitle)}</div>
      </div>
      <div style="text-align:right;font-size:9.5px;color:#888;line-height:2">
        ${p.email?`<div>${esc(p.email)}</div>`:''}
        ${p.phone?`<div>${esc(p.phone)}</div>`:''}
        ${p.city?`<div>${esc(p.city)}</div>`:''}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1.6fr 1fr;gap:24px">
      <div>
        ${p.summary?secTitle('Profil',ac)+`<p style="font-size:10px;color:#444;line-height:1.65">${esc(p.summary)}</p>`:''}
        ${(d.experiences||[]).length?secTitle('Deneyim',ac)+(d.experiences||[]).map(e=>expBlock(e,ac)).join(''):''}
        ${(d.educations||[]).length?secTitle('Eğitim',ac)+(d.educations||[]).map(e=>eduBlock(e,ac)).join(''):''}
      </div>
      <div>
        ${(d.skills||[]).length?secTitle('Beceriler',ac)+(d.skills||[]).map(s=>skillBar(s,ac)).join(''):''}
        ${(d.languages||[]).length?secTitle('Diller',ac)+(d.languages||[]).map(l=>langRow(l)).join(''):''}
      </div>
    </div>
  </div>${wm?watermarkHtml():''}`);
}

function princeton(d, ac='#3b3936', wm) {
  const p=d.personal||{}, fn=[p.firstName,p.lastName].filter(Boolean).join(' ')||'Ad Soyad';
  return wrap(`<div style="padding:36px">
    <div style="text-align:center;margin-bottom:18px;padding-bottom:14px;border-bottom:2px solid ${ac}">
      <div style="font-size:26px;font-weight:700;letter-spacing:1px;color:${ac};margin-bottom:4px">${esc(fn)}</div>
      <div style="font-size:12px;color:#666;letter-spacing:.5px;margin-bottom:8px">${esc(p.jobTitle)}</div>
      <div style="display:flex;justify-content:center;flex-wrap:wrap;gap:16px;font-size:9.5px;color:#888">${CT(p)}</div>
    </div>
    ${p.summary?secTitle('Özet',ac)+`<p style="font-size:10px;color:#444;line-height:1.65">${esc(p.summary)}</p>`:''}
    ${(d.experiences||[]).length?secTitle('İş Deneyimi',ac)+(d.experiences||[]).map(e=>expBlock(e,ac)).join(''):''}
    ${(d.educations||[]).length?secTitle('Eğitim',ac)+(d.educations||[]).map(e=>eduBlock(e,ac)).join(''):''}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
      <div>${(d.skills||[]).length?secTitle('Beceriler',ac)+(d.skills||[]).map(s=>skillBar(s,ac)).join(''):''}</div>
      <div>${(d.languages||[]).length?secTitle('Diller',ac)+(d.languages||[]).map(l=>langRow(l)).join(''):''}</div>
    </div>
  </div>${wm?watermarkHtml():''}`);
}

/* Berkeley — fotoğraf destekli */
function berkeley(d, ac='#333335', wm) {
  const p=d.personal||{}, fn=[p.firstName,p.lastName].filter(Boolean).join(' ')||'Ad Soyad';
  return wrap(`
    <div style="background:${ac};color:#fff;padding:26px 30px">
      <div style="display:flex;align-items:center;gap:16px">
        ${avatar(p, 64, ac, 'border:3px solid rgba(255,255,255,.3);flex-shrink:0;')}
        <div>
          <div style="font-size:20px;font-weight:700;margin-bottom:3px">${esc(fn)}</div>
          <div style="font-size:11px;opacity:.76;margin-bottom:6px">${esc(p.jobTitle)}</div>
          <div style="display:flex;flex-wrap:wrap;gap:12px;font-size:9px;opacity:.65">${CT(p)}</div>
        </div>
      </div>
    </div>
    <div style="padding:22px 30px;display:grid;grid-template-columns:1.5fr 1fr;gap:22px">
      <div>
        ${p.summary?secTitle('Hakkımda','#555')+`<p style="font-size:10px;color:#444;line-height:1.65">${esc(p.summary)}</p>`:''}
        ${(d.experiences||[]).length?secTitle('Deneyim','#555')+(d.experiences||[]).map(e=>expBlock(e,'#666')).join(''):''}
        ${(d.educations||[]).length?secTitle('Eğitim','#555')+(d.educations||[]).map(e=>eduBlock(e,'#666')).join(''):''}
      </div>
      <div>
        ${(d.skills||[]).length?secTitle('Beceriler',ac)+(d.skills||[]).map(s=>skillBar(s,ac)).join(''):''}
        ${(d.languages||[]).length?secTitle('Diller',ac)+(d.languages||[]).map(l=>langRow(l)).join(''):''}
      </div>
    </div>${wm?watermarkHtml():''}`);
}

function auckland(d, ac='#333333', wm) {
  const p=d.personal||{}, fn=[p.firstName,p.lastName].filter(Boolean).join(' ')||'Ad Soyad';
  return wrap(`<div style="padding:36px">
    <div style="margin-bottom:18px">
      <div style="font-size:28px;font-weight:300;letter-spacing:3px;text-transform:uppercase;color:${ac};margin-bottom:5px">${esc(fn)}</div>
      <div style="font-size:12px;color:#888;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px">${esc(p.jobTitle)}</div>
      <div style="height:1px;background:${ac};margin-bottom:10px"></div>
      <div style="display:flex;flex-wrap:wrap;gap:18px;font-size:9.5px;color:#888">${CT(p)}</div>
    </div>
    ${p.summary?secTitle('Hakkımda',ac,'plain')+`<p style="font-size:10px;color:#444;line-height:1.65">${esc(p.summary)}</p>`:''}
    ${(d.experiences||[]).length?secTitle('İş Deneyimi',ac,'plain')+(d.experiences||[]).map(e=>expBlock(e,ac)).join(''):''}
    ${(d.educations||[]).length?secTitle('Eğitim',ac,'plain')+(d.educations||[]).map(e=>eduBlock(e,ac)).join(''):''}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
      <div>${(d.skills||[]).length?secTitle('Beceriler',ac,'plain')+(d.skills||[]).map(s=>skillBar(s,ac)).join(''):''}</div>
      <div>${(d.languages||[]).length?secTitle('Diller',ac,'plain')+(d.languages||[]).map(l=>langRow(l)).join(''):''}</div>
    </div>
  </div>${wm?watermarkHtml():''}`);
}

/* Edinburgh — fotoğraf destekli */
function edinburgh(d, ac='#505577', wm) {
  const p=d.personal||{}, fn=[p.firstName,p.lastName].filter(Boolean).join(' ')||'Ad Soyad';
  return wrap(`<div>
    <div style="background:${ac};color:#fff;padding:26px 30px;display:flex;justify-content:space-between;align-items:center">
      <div style="display:flex;align-items:center;gap:16px">
        ${avatar(p, 70, ac, 'border:3px solid rgba(255,255,255,.35);flex-shrink:0;')}
        <div>
          <div style="font-size:24px;font-weight:700;margin-bottom:4px">${esc(fn)}</div>
          <div style="font-size:11px;opacity:.82">${esc(p.jobTitle)}</div>
        </div>
      </div>
      <div style="text-align:right;font-size:9.5px;opacity:.75;line-height:2">
        ${p.email?`<div>${esc(p.email)}</div>`:''}
        ${p.phone?`<div>${esc(p.phone)}</div>`:''}
        ${p.city?`<div>${esc(p.city)}</div>`:''}
      </div>
    </div>
    <div style="padding:22px 30px">
      ${p.summary?secTitle('Hakkımda',ac)+`<p style="font-size:10px;color:#444;line-height:1.65;margin-bottom:14px">${esc(p.summary)}</p>`:''}
      <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:22px">
        <div>
          ${(d.experiences||[]).length?secTitle('Deneyim',ac)+(d.experiences||[]).map(e=>expBlock(e,ac)).join(''):''}
          ${(d.educations||[]).length?secTitle('Eğitim',ac)+(d.educations||[]).map(e=>eduBlock(e,ac)).join(''):''}
        </div>
        <div>
          ${(d.skills||[]).length?secTitle('Beceriler',ac)+(d.skills||[]).map(s=>skillBar(s,ac)).join(''):''}
          ${(d.languages||[]).length?secTitle('Diller',ac)+(d.languages||[]).map(l=>langRow(l)).join(''):''}
        </div>
      </div>
    </div>
  </div>${wm?watermarkHtml():''}`);
}

function otago(d, ac='#333333', wm) {
  const p=d.personal||{}, fn=[p.firstName,p.lastName].filter(Boolean).join(' ')||'Ad Soyad';
  return wrap(`<div style="padding:36px 36px 28px">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:16px">
      <div>
        <div style="font-size:26px;font-weight:700;color:${ac};margin-bottom:4px">${esc(fn)}</div>
        <div style="font-size:12px;color:#777;font-style:italic">${esc(p.jobTitle)}</div>
      </div>
      <div style="text-align:right;font-size:9.5px;color:#888;line-height:2">
        ${p.email?`<div>${esc(p.email)}</div>`:''}
        ${p.phone?`<div>${esc(p.phone)}</div>`:''}
        ${p.city?`<div>${esc(p.city)}</div>`:''}
      </div>
    </div>
    <div style="height:2px;background:${ac};margin-bottom:16px"></div>
    <div style="display:grid;grid-template-columns:1.6fr 1fr;gap:24px">
      <div>
        ${p.summary?secTitle('Profil',ac)+`<p style="font-size:10px;color:#444;line-height:1.65">${esc(p.summary)}</p>`:''}
        ${(d.experiences||[]).length?secTitle('Deneyim',ac)+(d.experiences||[]).map(e=>expBlock(e,'#777')).join(''):''}
        ${(d.educations||[]).length?secTitle('Eğitim',ac)+(d.educations||[]).map(e=>eduBlock(e,'#777')).join(''):''}
      </div>
      <div>
        ${(d.skills||[]).length?secTitle('Beceriler',ac)+(d.skills||[]).map(s=>skillBar(s,ac)).join(''):''}
        ${(d.languages||[]).length?secTitle('Diller',ac)+(d.languages||[]).map(l=>langRow(l)).join(''):''}
      </div>
    </div>
  </div>${wm?watermarkHtml():''}`);
}

const RENDERERS = { harvard, oxford, stanford, cambridge, princeton, berkeley, auckland, edinburgh, otago };

function renderCV(data, template='harvard', color, watermark=false) {
  const fn = RENDERERS[template] || harvard;
  return fn(data||{}, color, watermark);
}

module.exports = { renderCV };
