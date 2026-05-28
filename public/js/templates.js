/* ════════════════════════════════════════════════════════
   templates.js — Tarayıcı-taraflı canlı önizleme
   9 şablon: Harvard, Oxford, Stanford, Cambridge,
             Princeton, Berkeley, Auckland, Edinburgh, Otago
════════════════════════════════════════════════════════ */
const CV = (() => {
  const e = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  // Fotoğraf varsa göster, yoksa baş harf avatar
  const av = (p, size, style) => {
    style = style || '';
    const ini = ((p.firstName||'')[0]||(p.lastName||'')[0]||'?').toUpperCase();
    if (p.photo) return '<img src="'+p.photo+'" style="width:'+size+'px;height:'+size+'px;border-radius:50%;object-fit:cover;'+style+'" alt="">';
    const fs = Math.round(size * 0.38);
    return '<div style="width:'+size+'px;height:'+size+'px;border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-size:'+fs+'px;font-weight:700;'+style+'">'+ini+'</div>';
  };

  const doc = (body, css='') => `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8">
<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:210mm;min-height:297mm;background:#fff}
body{font-family:Arial,Helvetica,sans-serif;font-size:10.5px;line-height:1.55;color:#2d2d2d}${css}
</style></head><body>${body}</body></html>`;

  const ST = (t,c,s='line') => s==='plain'
    ? `<div style="font-size:8.5px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:${c};margin:12px 0 7px">${e(t)}</div>`
    : `<div style="font-size:8.5px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${c};border-bottom:1.5px solid ${c};padding-bottom:3px;margin:12px 0 7px">${e(t)}</div>`;

  const EX = (x,c) => `<div style="margin-bottom:9px">
    <div style="display:flex;justify-content:space-between">
      <span style="font-weight:700;font-size:11px">${e(x.position)}</span>
      <span style="font-size:9px;color:#888">${e(x.start)}${x.end?' – '+e(x.end):''}</span>
    </div>
    <div style="font-size:10px;color:${c};margin-bottom:2px">${e(x.company)}</div>
    ${x.desc?`<div style="font-size:9.5px;color:#555;line-height:1.5">${e(x.desc)}</div>`:''}
  </div>`;

  const ED = (x,c) => `<div style="margin-bottom:8px">
    <div style="display:flex;justify-content:space-between">
      <span style="font-weight:700;font-size:11px">${e(x.degree)} – ${e(x.field)}</span>
      <span style="font-size:9px;color:#888">${e(x.start)}${x.end?' – '+e(x.end):''}</span>
    </div>
    <div style="font-size:10px;color:${c}">${e(x.school)}</div>
  </div>`;

  const SK = (s,c) => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
    <span style="font-size:10px;min-width:82px">${e(s.name)}</span>
    <div style="flex:1;height:4px;background:#e5e7eb;border-radius:2px">
      <div style="width:${s.level||75}%;height:100%;background:${c};border-radius:2px"></div>
    </div>
  </div>`;

  const LG = l => `<div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:4px">
    <span style="font-weight:600">${e(l.name)}</span><span style="color:#888">${e(l.level)}</span>
  </div>`;

  const CT = p => [
    p.email?`<span>✉ ${e(p.email)}</span>`:'',
    p.phone?`<span>☎ ${e(p.phone)}</span>`:'',
    p.city ?`<span>⊙ ${e(p.city)}</span>`:'',
    p.linkedin?`<span>in ${e(p.linkedin)}</span>`:''
  ].filter(Boolean).join('');

  // ── Şablonlar ──────────────────────────────────────────
  function harvard(d,c='#2563eb'){
    const p=d.personal||{}, fn=[p.firstName,p.lastName].filter(Boolean).join(' ')||'Ad Soyad';
    return doc(`<div style="padding:36px 36px 28px">
      <div style="border-bottom:3px solid ${c};padding-bottom:14px;margin-bottom:16px">
        <div style="font-size:24px;font-weight:700;color:${c};margin-bottom:4px">${e(fn)}</div>
        <div style="font-size:12px;color:#555;margin-bottom:8px">${e(p.jobTitle)}</div>
        <div style="display:flex;flex-wrap:wrap;gap:14px;font-size:9.5px;color:#888">${CT(p)}</div>
      </div>
      ${p.summary?ST('Hakkımda',c)+`<p style="font-size:10px;color:#444;line-height:1.65;margin-bottom:4px">${e(p.summary)}</p>`:''}
      ${(d.experiences||[]).length?ST('Deneyim',c)+(d.experiences||[]).map(x=>EX(x,c)).join(''):''}
      ${(d.educations||[]).length?ST('Eğitim',c)+(d.educations||[]).map(x=>ED(x,c)).join(''):''}
      ${(d.skills||[]).length?ST('Beceriler',c)+(d.skills||[]).map(s=>SK(s,c)).join(''):''}
      ${(d.languages||[]).length?ST('Diller',c)+(d.languages||[]).map(l=>LG(l)).join(''):''}
    </div>`);
  }

  function oxford(d,c='#434a54'){
    const p=d.personal||{}, fn=[p.firstName,p.lastName].filter(Boolean).join(' ')||'Ad Soyad';
    return doc(`<div style="display:grid;grid-template-columns:190px 1fr;min-height:297mm">
      <aside style="background:${c};color:#fff;padding:28px 18px">
        <div style="display:flex;justify-content:center;margin-bottom:14px">${av(p, 80, 'border:3px solid rgba(255,255,255,.4);')}</div>
        <div style="font-size:15px;font-weight:700;text-align:center;margin-bottom:4px;line-height:1.2">${e(fn)}</div>
        <div style="font-size:9.5px;opacity:.8;text-align:center;margin-bottom:18px">${e(p.jobTitle)}</div>
        <div style="font-size:9px;opacity:.75;line-height:2.1">
          ${p.email?`<div>✉ ${e(p.email)}</div>`:''}${p.phone?`<div>☎ ${e(p.phone)}</div>`:''}
          ${p.city?`<div>⊙ ${e(p.city)}</div>`:''}${p.linkedin?`<div>in ${e(p.linkedin)}</div>`:''}
        </div>
        ${(d.skills||[]).length?`<div style="font-size:7.5px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.3);padding-bottom:5px;margin:18px 0 10px">Beceriler</div>
          ${(d.skills||[]).map(s=>`<div style="margin-bottom:7px"><div style="font-size:9px;margin-bottom:3px">${e(s.name)}</div><div style="height:3px;background:rgba(255,255,255,.25);border-radius:2px"><div style="width:${s.level||75}%;height:100%;background:#fff;border-radius:2px"></div></div></div>`).join('')}`:''}
        ${(d.languages||[]).length?`<div style="font-size:7.5px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.3);padding-bottom:5px;margin:16px 0 10px">Diller</div>
          ${(d.languages||[]).map(l=>`<div style="display:flex;justify-content:space-between;font-size:9px;margin-bottom:4px;opacity:.85"><span>${e(l.name)}</span><span>${e(l.level)}</span></div>`).join('')}`:''}
      </aside>
      <main style="padding:30px 26px">
        ${p.summary?ST('Hakkımda',c)+`<p style="font-size:10px;color:#444;line-height:1.65">${e(p.summary)}</p>`:''}
        ${(d.experiences||[]).length?ST('Deneyim',c)+(d.experiences||[]).map(x=>EX(x,c)).join(''):''}
        ${(d.educations||[]).length?ST('Eğitim',c)+(d.educations||[]).map(x=>ED(x,c)).join(''):''}
      </main>
    </div>`);
  }

  function stanford(d,c='#424954'){
    const p=d.personal||{}, fn=[p.firstName,p.lastName].filter(Boolean).join(' ')||'Ad Soyad';
    return doc(`
      <div style="background:${c};color:#fff;padding:22px 30px">
        <div style="font-size:22px;font-weight:700;margin-bottom:4px">${e(fn)}</div>
        <div style="font-size:11px;opacity:.82;margin-bottom:8px">${e(p.jobTitle)}</div>
        <div style="display:flex;flex-wrap:wrap;gap:14px;font-size:9px;opacity:.7">${CT(p)}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0">
        <div style="padding:20px 18px 20px 28px;border-right:1px solid #e5e7eb">
          ${p.summary?ST('Hakkımda',c)+`<p style="font-size:10px;color:#444;line-height:1.65">${e(p.summary)}</p>`:''}
          ${(d.experiences||[]).length?ST('Deneyim',c)+(d.experiences||[]).map(x=>EX(x,c)).join(''):''}
          ${(d.educations||[]).length?ST('Eğitim',c)+(d.educations||[]).map(x=>ED(x,c)).join(''):''}
        </div>
        <div style="padding:20px 28px 20px 18px">
          ${(d.skills||[]).length?ST('Beceriler',c)+(d.skills||[]).map(s=>SK(s,c)).join(''):''}
          ${(d.languages||[]).length?ST('Diller',c)+(d.languages||[]).map(l=>LG(l)).join(''):''}
        </div>
      </div>`);
  }

  function cambridge(d,c='#3f6592'){
    const p=d.personal||{}, fn=[p.firstName,p.lastName].filter(Boolean).join(' ')||'Ad Soyad';
    return doc(`<div style="padding:36px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px;padding-bottom:14px;border-bottom:2px solid ${c}">
        <div><div style="font-size:26px;font-weight:700;color:${c};margin-bottom:4px">${e(fn)}</div><div style="font-size:12px;color:#555">${e(p.jobTitle)}</div></div>
        <div style="text-align:right;font-size:9.5px;color:#888;line-height:2">
          ${p.email?`<div>${e(p.email)}</div>`:''}${p.phone?`<div>${e(p.phone)}</div>`:''}${p.city?`<div>${e(p.city)}</div>`:''}
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1.6fr 1fr;gap:24px">
        <div>
          ${p.summary?ST('Profil',c)+`<p style="font-size:10px;color:#444;line-height:1.65">${e(p.summary)}</p>`:''}
          ${(d.experiences||[]).length?ST('Deneyim',c)+(d.experiences||[]).map(x=>EX(x,c)).join(''):''}
          ${(d.educations||[]).length?ST('Eğitim',c)+(d.educations||[]).map(x=>ED(x,c)).join(''):''}
        </div>
        <div>
          ${(d.skills||[]).length?ST('Beceriler',c)+(d.skills||[]).map(s=>SK(s,c)).join(''):''}
          ${(d.languages||[]).length?ST('Diller',c)+(d.languages||[]).map(l=>LG(l)).join(''):''}
        </div>
      </div>
    </div>`);
  }

  function princeton(d,c='#3b3936'){
    const p=d.personal||{}, fn=[p.firstName,p.lastName].filter(Boolean).join(' ')||'Ad Soyad';
    return doc(`<div style="padding:36px">
      <div style="text-align:center;margin-bottom:18px;padding-bottom:14px;border-bottom:2px solid ${c}">
        <div style="font-size:26px;font-weight:700;letter-spacing:1px;color:${c};margin-bottom:4px">${e(fn)}</div>
        <div style="font-size:12px;color:#666;letter-spacing:.5px;margin-bottom:8px">${e(p.jobTitle)}</div>
        <div style="display:flex;justify-content:center;flex-wrap:wrap;gap:16px;font-size:9.5px;color:#888">${CT(p)}</div>
      </div>
      ${p.summary?ST('Özet',c)+`<p style="font-size:10px;color:#444;line-height:1.65">${e(p.summary)}</p>`:''}
      ${(d.experiences||[]).length?ST('İş Deneyimi',c)+(d.experiences||[]).map(x=>EX(x,c)).join(''):''}
      ${(d.educations||[]).length?ST('Eğitim',c)+(d.educations||[]).map(x=>ED(x,c)).join(''):''}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        <div>${(d.skills||[]).length?ST('Beceriler',c)+(d.skills||[]).map(s=>SK(s,c)).join(''):''}</div>
        <div>${(d.languages||[]).length?ST('Diller',c)+(d.languages||[]).map(l=>LG(l)).join(''):''}</div>
      </div>
    </div>`);
  }

  function berkeley(d,c='#333335'){
    const p=d.personal||{}, fn=[p.firstName,p.lastName].filter(Boolean).join(' ')||'Ad Soyad';
    return doc(`
      <div style="background:${c};color:#fff;padding:26px 30px">
        <div style="display:flex;align-items:center;gap:16px">
          ${av(p, 64, 'border:3px solid rgba(255,255,255,.3);flex-shrink:0;')}
          <div>
            <div style="font-size:20px;font-weight:700;margin-bottom:3px">${e(fn)}</div>
            <div style="font-size:11px;opacity:.76;margin-bottom:6px">${e(p.jobTitle)}</div>
            <div style="display:flex;flex-wrap:wrap;gap:12px;font-size:9px;opacity:.65">${CT(p)}</div>
          </div>
        </div>
      </div>
      <div style="padding:22px 30px;display:grid;grid-template-columns:1.5fr 1fr;gap:22px">
        <div>
          ${p.summary?ST('Hakkımda','#555')+`<p style="font-size:10px;color:#444;line-height:1.65">${e(p.summary)}</p>`:''}
          ${(d.experiences||[]).length?ST('Deneyim','#555')+(d.experiences||[]).map(x=>EX(x,'#666')).join(''):''}
          ${(d.educations||[]).length?ST('Eğitim','#555')+(d.educations||[]).map(x=>ED(x,'#666')).join(''):''}
        </div>
        <div>
          ${(d.skills||[]).length?ST('Beceriler',c)+(d.skills||[]).map(s=>SK(s,c)).join(''):''}
          ${(d.languages||[]).length?ST('Diller',c)+(d.languages||[]).map(l=>LG(l)).join(''):''}
        </div>
      </div>`);
  }

  function auckland(d,c='#333333'){
    const p=d.personal||{}, fn=[p.firstName,p.lastName].filter(Boolean).join(' ')||'Ad Soyad';
    return doc(`<div style="padding:36px">
      <div style="margin-bottom:18px">
        <div style="font-size:28px;font-weight:300;letter-spacing:3px;text-transform:uppercase;color:${c};margin-bottom:5px">${e(fn)}</div>
        <div style="font-size:12px;color:#888;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px">${e(p.jobTitle)}</div>
        <div style="height:1px;background:${c};margin-bottom:10px"></div>
        <div style="display:flex;flex-wrap:wrap;gap:18px;font-size:9.5px;color:#888">${CT(p)}</div>
      </div>
      ${p.summary?ST('Hakkımda',c,'plain')+`<p style="font-size:10px;color:#444;line-height:1.65">${e(p.summary)}</p>`:''}
      ${(d.experiences||[]).length?ST('İş Deneyimi',c,'plain')+(d.experiences||[]).map(x=>EX(x,c)).join(''):''}
      ${(d.educations||[]).length?ST('Eğitim',c,'plain')+(d.educations||[]).map(x=>ED(x,c)).join(''):''}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        <div>${(d.skills||[]).length?ST('Beceriler',c,'plain')+(d.skills||[]).map(s=>SK(s,c)).join(''):''}</div>
        <div>${(d.languages||[]).length?ST('Diller',c,'plain')+(d.languages||[]).map(l=>LG(l)).join(''):''}</div>
      </div>
    </div>`);
  }

  function edinburgh(d,c='#505577'){
    const p=d.personal||{}, fn=[p.firstName,p.lastName].filter(Boolean).join(' ')||'Ad Soyad';
    return doc(`<div>
      <div style="background:${c};color:#fff;padding:26px 30px;display:flex;justify-content:space-between;align-items:center">
        <div style="display:flex;align-items:center;gap:14px">
          ${av(p, 70, 'border:3px solid rgba(255,255,255,.35);flex-shrink:0;')}
          <div><div style="font-size:24px;font-weight:700;margin-bottom:4px">${e(fn)}</div><div style="font-size:11px;opacity:.82">${e(p.jobTitle)}</div></div>
        </div>
        <div style="text-align:right;font-size:9.5px;opacity:.75;line-height:2">
          ${p.email?`<div>${e(p.email)}</div>`:''}${p.phone?`<div>${e(p.phone)}</div>`:''}${p.city?`<div>${e(p.city)}</div>`:''}
        </div>
      </div>
      <div style="padding:22px 30px">
        ${p.summary?ST('Hakkımda',c)+`<p style="font-size:10px;color:#444;line-height:1.65;margin-bottom:14px">${e(p.summary)}</p>`:''}
        <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:22px">
          <div>
            ${(d.experiences||[]).length?ST('Deneyim',c)+(d.experiences||[]).map(x=>EX(x,c)).join(''):''}
            ${(d.educations||[]).length?ST('Eğitim',c)+(d.educations||[]).map(x=>ED(x,c)).join(''):''}
          </div>
          <div>
            ${(d.skills||[]).length?ST('Beceriler',c)+(d.skills||[]).map(s=>SK(s,c)).join(''):''}
            ${(d.languages||[]).length?ST('Diller',c)+(d.languages||[]).map(l=>LG(l)).join(''):''}
          </div>
        </div>
      </div>
    </div>`);
  }

  function otago(d,c='#333333'){
    const p=d.personal||{}, fn=[p.firstName,p.lastName].filter(Boolean).join(' ')||'Ad Soyad';
    return doc(`<div style="padding:36px 36px 28px">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:16px">
        <div><div style="font-size:26px;font-weight:700;color:${c};margin-bottom:4px">${e(fn)}</div><div style="font-size:12px;color:#777;font-style:italic">${e(p.jobTitle)}</div></div>
        <div style="text-align:right;font-size:9.5px;color:#888;line-height:2">
          ${p.email?`<div>${e(p.email)}</div>`:''}${p.phone?`<div>${e(p.phone)}</div>`:''}${p.city?`<div>${e(p.city)}</div>`:''}
        </div>
      </div>
      <div style="height:2px;background:${c};margin-bottom:16px"></div>
      <div style="display:grid;grid-template-columns:1.6fr 1fr;gap:24px">
        <div>
          ${p.summary?ST('Profil',c)+`<p style="font-size:10px;color:#444;line-height:1.65">${e(p.summary)}</p>`:''}
          ${(d.experiences||[]).length?ST('Deneyim',c)+(d.experiences||[]).map(x=>EX(x,'#777')).join(''):''}
          ${(d.educations||[]).length?ST('Eğitim',c)+(d.educations||[]).map(x=>ED(x,'#777')).join(''):''}
        </div>
        <div>
          ${(d.skills||[]).length?ST('Beceriler',c)+(d.skills||[]).map(s=>SK(s,c)).join(''):''}
          ${(d.languages||[]).length?ST('Diller',c)+(d.languages||[]).map(l=>LG(l)).join(''):''}
        </div>
      </div>
    </div>`);
  }

  // ── Şablon meta ───────────────────────────────────────────
  const TPLS = [
    {id:'harvard',  name:'Harvard',   color:'#2563eb', fn:harvard,   colors:['#2563eb','#059669','#7c3aed','#dc2626','#0891b2']},
    {id:'oxford',   name:'Oxford',    color:'#434a54', fn:oxford,    colors:['#434a54','#1e3a5f','#2d4a2d','#5c3a3a','#3a3a5c']},
    {id:'stanford', name:'Stanford',  color:'#424954', fn:stanford,  colors:['#424954','#2563eb','#059669','#dc2626','#7c3aed']},
    {id:'cambridge',name:'Cambridge', color:'#3f6592', fn:cambridge, colors:['#3f6592','#2563eb','#059669','#0891b2','#7c3aed']},
    {id:'princeton',name:'Princeton', color:'#3b3936', fn:princeton, colors:['#3b3936','#1a1a2e','#2d4a2d','#3a2d1a','#1a2d3a']},
    {id:'berkeley', name:'Berkeley',  color:'#333335', fn:berkeley,  colors:['#333335','#1e3a5f','#2d4a2d','#5c1a1a','#3a1a5c']},
    {id:'auckland', name:'Auckland',  color:'#333333', fn:auckland,  colors:['#333333','#2563eb','#059669','#dc2626','#7c3aed']},
    {id:'edinburgh',name:'Edinburgh', color:'#505577', fn:edinburgh, colors:['#505577','#2563eb','#3f6592','#059669','#7c3aed']},
    {id:'otago',    name:'Otago',     color:'#333333', fn:otago,     colors:['#333333','#2563eb','#059669','#dc2626','#7c3aed']},
  ];

  const DEMO = {
    personal:{firstName:'Ayşe',lastName:'Kaya',jobTitle:'Pazarlama Müdürü',email:'ayse.kaya@email.com',phone:'0532 123 45 67',city:'İstanbul',linkedin:'linkedin.com/in/aysekaya',summary:'5 yıllık pazarlama deneyimiyle dijital ve geleneksel kanalları etkin kullanan, veri odaklı stratejiler geliştiren profesyonel.'},
    experiences:[{position:'Pazarlama Müdürü',company:'TechCorp A.Ş.',start:'Oca 2022',end:'Günümüz',desc:'Dijital pazarlama bütçesini %40 artırarak marka bilinirliğini güçlendirdi.'},{position:'Pazarlama Uzmanı',company:'StartupHub',start:'Haz 2020',end:'Ara 2021',desc:'Sosyal medya kampanyaları ve içerik stratejileri oluşturdu.'}],
    educations:[{degree:'Lisans',field:'İşletme',school:'Boğaziçi Üniversitesi',start:'2016',end:'2020'}],
    skills:[{name:'Dijital Pazarlama',level:90},{name:'Google Analytics',level:80},{name:'SEO/SEM',level:75},{name:'İçerik Stratejisi',level:85}],
    languages:[{name:'Türkçe',level:'Anadili'},{name:'İngilizce',level:'C1 – İleri'},{name:'Almanca',level:'B1 – Orta'}]
  };

  function get(id) { return TPLS.find(t=>t.id===id)||TPLS[0]; }
  function render(id,data,color) { const t=get(id); return t.fn(data||DEMO,color||t.color); }
  function demo(id,color) { const t=get(id); return t.fn(DEMO,color||t.color); }
  function blob(html) { return URL.createObjectURL(new Blob([html],{type:'text/html'})); }

  return { TPLS, DEMO, get, render, demo, blob };
})();
