/* CVYap — App.js
   - E-posta doğrulama YOK
   - 20 TL tek CV, 50 TL AI plan
   - AI Agent: metin geliştirme */

var S = {
  page:'home', user:null, step:0, plan:'single', timer:null,
  cv:{ uuid:null, title:"CV'm", template:'harvard', color:'#2563eb',
    data:{ personal:{}, experiences:[], educations:[], skills:[], languages:[] } }
};

function $(id){ return document.getElementById(id); }
function $$(s){ return document.querySelectorAll(s); }
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function fmtDate(s){ return s?new Date(s).toLocaleDateString('tr-TR'):''; }

function toast(msg,type){
  var t=$('toast'); if(!t) return;
  t.textContent=msg; t.className='show '+(type||'ok');
  clearTimeout(t._t); t._t=setTimeout(function(){t.className='';},4000);
}
function load(on,msg){
  var el=$('loading'); if(!el) return;
  el.classList[on?'add':'remove']('on');
  var m=$('load-msg'); if(m) m.textContent=msg||'İşleniyor...';
}

var API={
  req:function(method,url,body){
    var opts={method:method,credentials:'same-origin',headers:{}};
    if(body){opts.headers['Content-Type']='application/json';opts.body=JSON.stringify(body);}
    return fetch(url,opts).then(function(r){
      return r.json().catch(function(){return{};}).then(function(d){
        if(!r.ok) throw Object.assign(new Error(d.error||'Hata '+r.status),d);
        return d;
      });
    });
  },
  get:function(u){return API.req('GET',u);},
  post:function(u,b){return API.req('POST',u,b);},
  put:function(u,b){return API.req('PUT',u,b);},
  del:function(u){return API.req('DELETE',u);}
};

/* ── SAYFA ── */
function go(page){
  $$('.page').forEach(function(p){p.classList.remove('active');});
  var el=$('pg-'+page); if(!el) return;
  el.classList.add('active'); S.page=page;
  if(page!=='builder') window.scrollTo(0,0);
  if(page==='home')      loadHomePage();
  if(page==='templates') loadTemplatesPage();
  if(page==='builder')   openBuilder();
  if(page==='dashboard') openDashboard();
  if(page==='payment')   setupPayment();
  if(page==='profile')   loadProfilePage();
  updateNav();
}

function scrollToSection(id){
  if(S.page!=='home'){go('home');setTimeout(function(){var e=$(id);if(e)e.scrollIntoView({behavior:'smooth'});},150);}
  else{var e=$(id);if(e)e.scrollIntoView({behavior:'smooth'});}
}

/* ── NAV ── */
function updateNav(){
  var a=$('nav-auth'); if(!a) return;
  a.innerHTML='';
  if(S.user){
    // Plan badge
    var badge='';
    if(S.user.isAI) badge='🤖 AI';
    else if(S.user.credits>0) badge='🎫 '+S.user.credits+' kredi';
    var sp=document.createElement('span');
    sp.style.cssText='font-size:13px;color:var(--text2);font-weight:600';
    sp.textContent=(S.user.name||'').split(' ')[0]+(badge?' · '+badge:'');
    var pb=document.createElement('button'); pb.className='btn btn-ghost btn-sm'; pb.textContent='Panelim';
    pb.addEventListener('click',function(){go('dashboard');});
    var lb=document.createElement('button'); lb.className='btn btn-ghost btn-sm'; lb.textContent='Çıkış';
    lb.addEventListener('click',doLogout);
    a.appendChild(sp); a.appendChild(pb); a.appendChild(lb);
  } else {
    var gb=document.createElement('button'); gb.className='btn btn-ghost btn-sm'; gb.textContent='Giriş Yap';
    gb.addEventListener('click',function(){openModal('login');});
    var cb=document.createElement('button'); cb.className='btn btn-primary btn-sm'; cb.textContent='CV Oluştur →';
    cb.addEventListener('click',newCV);
    a.appendChild(gb); a.appendChild(cb);
  }
}

/* ── MODAL ── */
function openModal(tab){
  var m=$('auth-modal'); if(m) m.classList.add('open');
  switchTab(tab||'login');
}
function closeModal(){ var m=$('auth-modal'); if(m) m.classList.remove('open'); }
function switchTab(tab){
  $$('.m-tab').forEach(function(t){t.classList.toggle('active',t.dataset.tab===tab);});
  $$('.m-form').forEach(function(f){f.classList.toggle('active',f.id==='mf-'+tab);});
}

/* ── AUTH ── */
function doRegister(){
  var name=($('r-name')||{}).value||'', email=($('r-email')||{}).value||'', pass=($('r-pass')||{}).value||'';
  name=name.trim(); email=email.trim();
  if(!name||!email||!pass){toast('Tüm alanları doldurun.','err');return;}
  if(pass.length<6){toast('Şifre en az 6 karakter olmalı.','err');return;}
  load(true,'Hesap oluşturuluyor...');
  API.post('/api/auth/register',{name:name,email:email,password:pass})
    .then(function(d){S.user=d.user;updateNav();closeModal();toast('Hoş geldiniz, '+d.user.name.split(' ')[0]+'! 🎉');})
    .catch(function(e){toast(e.message,'err');})
    .finally(function(){load(false);});
}

function doLogin(){
  var email=($('l-email')||{}).value||'', pass=($('l-pass')||{}).value||'';
  email=email.trim();
  if(!email||!pass){toast('E-posta ve şifre girin.','err');return;}
  load(true,'Giriş yapılıyor...');
  API.post('/api/auth/login',{email:email,password:pass})
    .then(function(d){S.user=d.user;updateNav();closeModal();toast('Hoş geldiniz!');if(S.page==='dashboard')openDashboard();})
    .catch(function(e){toast(e.message,'err');})
    .finally(function(){load(false);});
}

function doLogout(){
  API.post('/api/auth/logout').catch(function(){}).finally(function(){
    S.user=null; updateNav(); go('home'); toast('Çıkış yapıldı.');
  });
}

function initAuth(){
  return API.get('/api/auth/me')
    .then(function(d){if(d.loggedIn)S.user=d.user;updateNav();})
    .catch(function(){updateNav();});
}

/* ── ANA SAYFA ── */
function loadHomePage(){
  var g=$('home-tpl-grid');
  if(!g||g.dataset.loaded) return;
  g.dataset.loaded='1';
  var html='';
  CV.TPLS.slice(0,6).forEach(function(t){
    var url=CV.blob(CV.demo(t.id,t.color));
    html+='<div class="tpl-card" data-tpl="'+t.id+'">'
      +'<div class="tpl-thumb" style="height:240px;position:relative;overflow:hidden">'
      +'<iframe src="'+url+'" style="width:210mm;height:297mm;border:none;pointer-events:none;transform:scale(0.268);transform-origin:top left;position:absolute;top:0;left:0" scrolling="no" tabindex="-1"></iframe>'
      +'</div><div class="tpl-foot"><span class="tpl-foot-name">'+t.name+'</span><span class="tpl-badge">ATS</span></div></div>';
  });
  g.innerHTML=html;
  g.querySelectorAll('.tpl-card').forEach(function(c){c.addEventListener('click',function(){newCVWith(c.dataset.tpl);});});
}

function loadTemplatesPage(){
  var g=$('tpl-showcase'); if(!g) return;
  var html='';
  CV.TPLS.forEach(function(t){
    var url=CV.blob(CV.demo(t.id,t.color));
    html+='<div class="tpl-card" data-tpl="'+t.id+'">'
      +'<div class="tpl-thumb" style="height:240px;position:relative;overflow:hidden">'
      +'<iframe src="'+url+'" style="width:210mm;height:297mm;border:none;pointer-events:none;transform:scale(0.268);transform-origin:top left;position:absolute;top:0;left:0" scrolling="no" tabindex="-1"></iframe>'
      +'</div><div class="tpl-foot"><span class="tpl-foot-name">'+t.name+'</span><span class="tpl-badge">ATS</span></div></div>';
  });
  g.innerHTML=html;
  g.querySelectorAll('.tpl-card').forEach(function(c){c.addEventListener('click',function(){newCVWith(c.dataset.tpl);});});
}

/* ── BUILDER ── */
function newCV(){
  S.cv={uuid:null,title:"CV'm",template:'harvard',color:'#2563eb',
    data:{personal:{},experiences:[],educations:[],skills:[],languages:[]}};
  S.cv.data.experiences.push({id:Date.now(),position:'',company:'',start:'',end:'',desc:''});
  S.cv.data.educations.push({id:Date.now()+1,school:'',degree:'Lisans',field:'',start:'',end:''});
  S.cv.data.skills.push({id:Date.now()+2,name:'',level:80});
  S.cv.data.languages.push({id:Date.now()+3,name:'',level:'Anadili'});
  S.step=0; go('builder');
}
function newCVWith(tpl){S.cv.template=tpl;S.cv.color=CV.get(tpl).color;newCV();}

function openBuilder(){
  // Önce DOM event'leri bağla, sonra doldur
  renderExps(); renderEdus(); renderSkills(); renderLangs();
  renderTplPicker(); renderColorPicker(); renderStepUI();
  bindInputs();
  // bindInputs içinde bindPhotoUpload çağrılıyor,
  // fillPersonal ise fotoğrafı göstermek için SONRA çağrılmalı
  fillPersonal();
  schedPreview();
}

function bindInputs(){
  ['firstName','lastName','jobTitle','email','phone','city','linkedin','summary'].forEach(function(k){
    var el=$('p-'+k); if(!el) return;
    el.removeEventListener('input',schedPreview); el.addEventListener('input',schedPreview);
  });
  var ti=$('cv-title-input');
  if(ti){ti.removeEventListener('input',onTitle);ti.addEventListener('input',onTitle);}
  bindPhotoUpload();
}

/* ── FOTOĞRAF YÜKLEME ── */
function bindPhotoUpload(){
  var inp=$('p-photo-input');
  var prev=$('photo-preview');
  var rmBtn=$('p-photo-remove');
  if(!inp) return;

  inp.removeEventListener('change',onPhotoChange);
  inp.addEventListener('change',onPhotoChange);

  if(rmBtn){
    rmBtn.removeEventListener('click',removePhoto);
    rmBtn.addEventListener('click',removePhoto);
  }

  // Not: Mevcut fotoğraf fillPersonal() tarafından gösterilir
}

function onPhotoChange(e){
  var file=e.target.files[0];
  if(!file) return;
  if(file.size > 5*1024*1024){toast('Fotoğraf 5MB den küçük olmalı.','err');return;}
  if(!file.type.startsWith('image/')){toast('Lütfen bir resim dosyası seçin.','err');return;}

  var reader=new FileReader();
  reader.onload=function(ev){
    // Canvas ile sıkıştır (max 400x400, kalite 0.7)
    var img=new Image();
    img.onload=function(){
      var canvas=document.createElement('canvas');
      var MAX=400;
      var w=img.width, h=img.height;
      if(w>h){ if(w>MAX){h=Math.round(h*MAX/w);w=MAX;} }
      else { if(h>MAX){w=Math.round(w*MAX/h);h=MAX;} }
      canvas.width=w; canvas.height=h;
      var ctx=canvas.getContext('2d');
      ctx.drawImage(img,0,0,w,h);
      var dataUrl=canvas.toDataURL('image/jpeg',0.75);
      S.cv.data.personal=S.cv.data.personal||{};
      S.cv.data.personal.photo=dataUrl;
      showPhotoPreview(dataUrl);
      schedPreview();
      toast('Fotoğraf eklendi ✓');
    };
    img.src=ev.target.result;
  };
  reader.readAsDataURL(file);
}

function showPhotoPreview(dataUrl){
  var prev=$('photo-preview');
  var rmBtn=$('p-photo-remove');
  if(prev){
    prev.innerHTML='<img src="'+dataUrl+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%">';
    prev.style.border='2px solid var(--blue)';
  }
  if(rmBtn) rmBtn.style.display='inline-flex';
}

function removePhoto(){
  if(S.cv.data.personal) delete S.cv.data.personal.photo;
  var prev=$('photo-preview');
  var rmBtn=$('p-photo-remove');
  var inp=$('p-photo-input');
  if(prev){prev.innerHTML='👤';prev.style.border='2px dashed var(--border2)';}
  if(rmBtn) rmBtn.style.display='none';
  if(inp) inp.value='';
  schedPreview();
  toast('Fotoğraf kaldırıldı.');
}
function onTitle(){S.cv.title=($('cv-title-input')||{}).value||"CV'm";}

/* AI Agent kaldırıldı */

/* ── ADIM YÖNETİMİ ── */
function renderStepUI(){
  for(var i=0;i<5;i++){var el=$('bs-'+i);if(el)el.classList[i===S.step?'add':'remove']('active');}
  $$('.s-pill').forEach(function(p){
    var idx=parseInt(p.dataset.step);p.classList.remove('active','done');
    if(idx===S.step)p.classList.add('active');else if(idx<S.step)p.classList.add('done');
  });
  var prev=$('btn-prev');if(prev)prev.style.visibility=S.step>0?'visible':'hidden';
  var lbl=$('step-lbl');if(lbl)lbl.textContent='Adım '+(S.step+1)+' / 5';
  var next=$('btn-next');if(next)next.textContent=S.step===4?'⬇ PDF İndir':'Sonraki →';
}

var PF=['firstName','lastName','jobTitle','email','phone','city','linkedin','summary'];
function fillPersonal(){
  var p=S.cv.data.personal||{};
  PF.forEach(function(k){var el=$('p-'+k);if(el)el.value=p[k]||'';});
  // Fotoğrafı göster
  if(p.photo){ showPhotoPreview(p.photo); }
  else {
    var prev=$('photo-preview');
    var rmBtn=$('p-photo-remove');
    if(prev){prev.innerHTML='👤';prev.style.border='2px dashed var(--border2)';}
    if(rmBtn) rmBtn.style.display='none';
  }
}
function collectPersonal(){
  var existing = S.cv.data.personal || {};
  var p={};
  PF.forEach(function(k){var el=$('p-'+k);if(el)p[k]=el.value.trim();});
  // Fotoğrafı koru
  if(existing.photo) p.photo = existing.photo;
  S.cv.data.personal=p;
}

function schedPreview(){clearTimeout(S.timer);S.timer=setTimeout(renderPreview,300);}
function renderPreview(){
  collectPersonal();
  var frame=$('cv-frame');if(!frame)return;
  var html=CV.render(S.cv.template,S.cv.data,S.cv.color);
  var url=CV.blob(html);var old=frame.src;frame.src=url;
  if(old&&old.indexOf('blob:')===0)setTimeout(function(){URL.revokeObjectURL(old);},2000);
  var wrap=$('cv-paper');
  if(wrap){var A4W=210*3.7795275591,A4H=297*3.7795275591,scale=wrap.offsetWidth/A4W;
    frame.style.width=A4W+'px';frame.style.height=A4H+'px';
    frame.style.transform='scale('+scale+')';frame.style.transformOrigin='top left';
    wrap.style.height=Math.round(A4H*scale)+'px';}
}

function renderTplPicker(){
  var g=$('tpl-pick-grid');if(!g)return;var html='';
  CV.TPLS.forEach(function(t){
    var url=CV.blob(CV.demo(t.id,t.color));
    html+='<div class="tp-card'+(t.id===S.cv.template?' sel':'')+'" data-tpl="'+t.id+'">'
      +'<div class="tp-thumb" style="height:90px;position:relative;overflow:hidden">'
      +'<iframe src="'+url+'" style="width:210mm;height:297mm;border:none;pointer-events:none;transform:scale(0.15);transform-origin:top left;position:absolute;top:0;left:0" scrolling="no" tabindex="-1"></iframe>'
      +'</div><div class="tp-name">'+t.name+'</div></div>';
  });
  g.innerHTML=html;
  g.querySelectorAll('.tp-card').forEach(function(c){c.addEventListener('click',function(){pickTpl(c.dataset.tpl);});});
}
function pickTpl(id){S.cv.template=id;S.cv.color=CV.get(id).color;renderTplPicker();renderColorPicker();schedPreview();}

function renderColorPicker(){
  var w=$('color-picker');if(!w)return;
  var tpl=CV.get(S.cv.template);var html='';
  tpl.colors.forEach(function(c){html+='<div class="c-swatch'+(c===S.cv.color?' sel':'')+'" data-color="'+c+'" style="background:'+c+'"></div>';});
  w.innerHTML=html;
  w.querySelectorAll('.c-swatch').forEach(function(d){d.addEventListener('click',function(){S.cv.color=d.dataset.color;renderColorPicker();schedPreview();});});
}

/* ── DENEYİM ── */
function addExp(){S.cv.data.experiences.push({id:Date.now(),position:'',company:'',start:'',end:'',desc:''});renderExps();}
function delExp(id){S.cv.data.experiences=S.cv.data.experiences.filter(function(x){return x.id!==id;});renderExps();schedPreview();}
function renderExps(){
  var el=$('exp-list');if(!el)return;el.innerHTML='';
  S.cv.data.experiences.forEach(function(x){
    var c=document.createElement('div');c.className='entry-card';
    c.innerHTML='<button class="entry-del" title="Sil">×</button>'
      +'<div class="row2"><div class="fg"><label>Pozisyon</label><input class="ep-pos" value="'+esc(x.position)+'" placeholder="Yazılım Mühendisi"></div>'
      +'<div class="fg"><label>Şirket</label><input class="ep-com" value="'+esc(x.company)+'" placeholder="TechCo A.Ş."></div></div>'
      +'<div class="row2"><div class="fg"><label>Başlangıç</label><input class="ep-sta" value="'+esc(x.start)+'" placeholder="Oca 2022"></div>'
      +'<div class="fg"><label>Bitiş</label><input class="ep-end" value="'+esc(x.end)+'" placeholder="Günümüz"></div></div>'
      +'<div class="fg"><label>Açıklama</label>'
      +'<div class="ai-field-wrap">'
      +'<textarea class="ep-dsc" placeholder="Bu pozisyondaki görev ve başarılarınızı yazın...">'+esc(x.desc)+'</textarea>'
      +'<button class="ai-inline ep-ai">🤖 AI ile Geliştir</button>'
      +'</div></div>';
    c.querySelector('.entry-del').addEventListener('click',function(){delExp(x.id);});
    c.querySelector('.ep-pos').addEventListener('input',function(){x.position=this.value;schedPreview();});
    c.querySelector('.ep-com').addEventListener('input',function(){x.company=this.value;schedPreview();});
    c.querySelector('.ep-sta').addEventListener('input',function(){x.start=this.value;schedPreview();});
    c.querySelector('.ep-end').addEventListener('input',function(){x.end=this.value;schedPreview();});
    var dsc=c.querySelector('.ep-dsc');
    dsc.addEventListener('input',function(){x.desc=this.value;schedPreview();});
    var aiBtn=c.querySelector('.ep-ai');
    aiBtn.addEventListener('click',function(){
      var txt=dsc.value.trim();
      if(!txt){toast('Önce açıklama yazın.','err');return;}
      callAI('desc',txt,aiBtn,function(improved){dsc.value=improved;x.desc=improved;schedPreview();});
    });
    el.appendChild(c);
  });
}

/* ── EĞİTİM ── */
var DEGS=['Lisans','Yüksek Lisans','Doktora','Ön Lisans','Lise','Sertifika'];
function addEdu(){S.cv.data.educations.push({id:Date.now(),school:'',degree:'Lisans',field:'',start:'',end:''});renderEdus();}
function delEdu(id){S.cv.data.educations=S.cv.data.educations.filter(function(x){return x.id!==id;});renderEdus();schedPreview();}
function renderEdus(){
  var el=$('edu-list');if(!el)return;el.innerHTML='';
  S.cv.data.educations.forEach(function(x){
    var c=document.createElement('div');c.className='entry-card';
    var opts=DEGS.map(function(d){return '<option'+(x.degree===d?' selected':'')+'>'+d+'</option>';}).join('');
    c.innerHTML='<button class="entry-del" title="Sil">×</button>'
      +'<div class="fg"><label>Okul / Üniversite</label><input class="ed-sch" value="'+esc(x.school)+'" placeholder="İTÜ"></div>'
      +'<div class="row2"><div class="fg"><label>Derece</label><select class="ed-deg">'+opts+'</select></div>'
      +'<div class="fg"><label>Bölüm</label><input class="ed-fld" value="'+esc(x.field)+'" placeholder="Bilgisayar Müh."></div></div>'
      +'<div class="row2"><div class="fg"><label>Başlangıç</label><input class="ed-sta" value="'+esc(x.start)+'" placeholder="2018"></div>'
      +'<div class="fg"><label>Bitiş</label><input class="ed-end" value="'+esc(x.end)+'" placeholder="2022"></div></div>';
    c.querySelector('.entry-del').addEventListener('click',function(){delEdu(x.id);});
    c.querySelector('.ed-sch').addEventListener('input',function(){x.school=this.value;schedPreview();});
    c.querySelector('.ed-deg').addEventListener('change',function(){x.degree=this.value;schedPreview();});
    c.querySelector('.ed-fld').addEventListener('input',function(){x.field=this.value;schedPreview();});
    c.querySelector('.ed-sta').addEventListener('input',function(){x.start=this.value;schedPreview();});
    c.querySelector('.ed-end').addEventListener('input',function(){x.end=this.value;schedPreview();});
    el.appendChild(c);
  });
}

/* ── BECERİLER ── */
var SKVL=[{l:'Uzman',v:95},{l:'İleri',v:80},{l:'Orta',v:60},{l:'Başlangıç',v:40}];
function addSkill(){S.cv.data.skills.push({id:Date.now(),name:'',level:80});renderSkills();}
function delSkill(id){S.cv.data.skills=S.cv.data.skills.filter(function(s){return s.id!==id;});renderSkills();schedPreview();}
function renderSkills(){
  var el=$('sk-list');if(!el)return;el.innerHTML='';
  S.cv.data.skills.forEach(function(s){
    var r=document.createElement('div');r.className='sk-row';
    var opts=SKVL.map(function(l){return '<option value="'+l.v+'"'+(s.level===l.v?' selected':'')+'>'+l.l+'</option>';}).join('');
    r.innerHTML='<input value="'+esc(s.name)+'" placeholder="React, Excel..."><select>'+opts+'</select><button class="entry-del" style="position:static">×</button>';
    r.querySelector('input').addEventListener('input',function(){s.name=this.value;schedPreview();});
    r.querySelector('select').addEventListener('change',function(){s.level=parseInt(this.value);schedPreview();});
    r.querySelector('.entry-del').addEventListener('click',function(){delSkill(s.id);});
    el.appendChild(r);
  });
}

/* ── DİLLER ── */
var LGVL=['Anadili','C2 – Ustalık','C1 – İleri','B2 – Üst Orta','B1 – Orta','A2 – Temel'];
function addLang(){S.cv.data.languages.push({id:Date.now(),name:'',level:'Anadili'});renderLangs();}
function delLang(id){S.cv.data.languages=S.cv.data.languages.filter(function(l){return l.id!==id;});renderLangs();schedPreview();}
function renderLangs(){
  var el=$('lang-list');if(!el)return;el.innerHTML='';
  S.cv.data.languages.forEach(function(l){
    var r=document.createElement('div');r.className='sk-row';
    var opts=LGVL.map(function(lv){return '<option'+(l.level===lv?' selected':'')+'>'+lv+'</option>';}).join('');
    r.innerHTML='<input value="'+esc(l.name)+'" placeholder="Türkçe, İngilizce..."><select>'+opts+'</select><button class="entry-del" style="position:static">×</button>';
    r.querySelector('input').addEventListener('input',function(){l.name=this.value;schedPreview();});
    r.querySelector('select').addEventListener('change',function(){l.level=this.value;schedPreview();});
    r.querySelector('.entry-del').addEventListener('click',function(){delLang(l.id);});
    el.appendChild(r);
  });
}

/* ── PDF ── */
function handlePDF(){
  collectPersonal();
  if(!S.user){toast('PDF indirmek için giriş yapın.','err');openModal('login');return;}
  load(true,'CV kaydediliyor...');
  var saveP;
  if(!S.cv.uuid){
    saveP=API.post('/api/cv',{title:S.cv.title,template:S.cv.template,color:S.cv.color,data:S.cv.data})
      .then(function(d){S.cv.uuid=d.uuid;});
  } else {
    saveP=API.put('/api/cv/'+S.cv.uuid,{title:S.cv.title,template:S.cv.template,color:S.cv.color,data:S.cv.data});
  }
  saveP
    .then(function(){
      load(true,'PDF hazırlanıyor...');
      return fetch('/api/cv/'+S.cv.uuid+'/pdf',{credentials:'same-origin'});
    })
    .then(function(r){
      if(r.status===403){
        return r.json().then(function(){
          load(false);
          toast('PDF indirmek için ödeme gerekiyor.','err');
          S.plan='single'; go('payment');
          throw {handled:true};
        });
      }
      if(!r.ok) return r.json().then(function(d){throw new Error(d.error||'PDF hatası');});
      return r.blob();
    })
    .then(function(b){
      if(!b) return;
      var p=S.cv.data.personal||{};
      triggerDL(b,((p.firstName||'CV')+'_'+(p.lastName||'')+'_CVYap.pdf').replace(/\s+/g,'_'));
      toast('✅ PDF başarıyla indirildi!');
      return API.get('/api/auth/me').then(function(d){if(d.loggedIn){S.user=d.user;updateNav();}});
    })
    .catch(function(e){if(!e||!e.handled)toast((e&&e.message)||'PDF hatası','err');})
    .finally(function(){load(false);});
}

function triggerDL(blob,name){
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download=name;
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  setTimeout(function(){URL.revokeObjectURL(url);},5000);
}

function saveCV(){
  if(!S.user){openModal('register');return;}
  collectPersonal();load(true,'Kaydediliyor...');
  var p;
  if(!S.cv.uuid){
    p=API.post('/api/cv',{title:S.cv.title,template:S.cv.template,color:S.cv.color,data:S.cv.data})
      .then(function(d){S.cv.uuid=d.uuid;toast('CV kaydedildi ✓');});
  } else {
    p=API.put('/api/cv/'+S.cv.uuid,{title:S.cv.title,template:S.cv.template,color:S.cv.color,data:S.cv.data})
      .then(function(){toast('CV güncellendi ✓');});
  }
  p.catch(function(e){toast(e.message,'err');}).finally(function(){load(false);});
}

/* ── DASHBOARD ── */
function openDashboard(){
  if(!S.user){openModal('login');go('home');return;}
  
  // Plan bilgisi göster
  var pi=$('plan-info');
  if(pi){
    if(S.user.isAI) pi.innerHTML='<span class="plan-badge ai">🤖 AI Destekli Plan aktif</span>';
    else if(S.user.credits>0) pi.innerHTML='<span class="plan-badge credit">🎫 '+S.user.credits+' PDF indirme hakkınız var</span>';
    else pi.innerHTML='<span class="plan-badge free">Ücretsiz plan · <a style="cursor:pointer;color:var(--blue);font-weight:600" id="upgrade-link">PDF indirmek için ödeme yapın</a></span>';
    var ul=$('upgrade-link');
    if(ul) ul.addEventListener('click',function(){S.plan='single';go('payment');});
  }

  var g=$('cv-grid');if(!g)return;
  g.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:56px"><div class="spinner" style="margin:0 auto 12px"></div>Yükleniyor...</div>';
  API.get('/api/cv').then(function(d){
    if(!d.cvs||!d.cvs.length){
      g.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:56px">'
        +'<div style="font-size:44px;margin-bottom:12px">📄</div>'
        +'<div style="font-size:17px;font-weight:700;margin-bottom:7px">Henüz CV\'niz yok</div>'
        +'<p style="color:var(--muted);margin-bottom:18px">İlk CV\'nizi oluşturun!</p></div>';
      var nb=document.createElement('button');nb.className='btn btn-primary';nb.textContent='CV Oluştur →';
      nb.addEventListener('click',newCV);g.querySelector('div').appendChild(nb);return;
    }
    g.innerHTML='';
    d.cvs.forEach(function(cv){
      var url=CV.blob(CV.render(cv.template,null,cv.color));
      var card=document.createElement('div');card.className='cv-card';
      card.innerHTML='<div class="cv-card-thumb" style="position:relative;overflow:hidden;height:155px;cursor:pointer">'
        +'<iframe src="'+url+'" style="width:210mm;height:297mm;border:none;pointer-events:none;transform:scale(0.185);transform-origin:top left;position:absolute;top:0;left:0" scrolling="no" tabindex="-1"></iframe>'
        +'</div><div class="cv-card-info">'
        +'<div class="cv-card-title">'+esc(cv.title)+'</div>'
        +'<div class="cv-card-date">'+fmtDate(cv.updatedAt)+'</div>'
        +'<div class="cv-card-acts"></div></div>';
      var acts=card.querySelector('.cv-card-acts');
      var eb=document.createElement('button');eb.className='btn btn-primary btn-sm';eb.textContent='Düzenle';
      eb.addEventListener('click',function(){editCV(cv.uuid);});
      var pb=document.createElement('button');pb.className='btn btn-ghost btn-sm';pb.textContent='PDF';
      pb.addEventListener('click',function(){dashPDF(cv.uuid);});
      var db=document.createElement('button');db.className='btn btn-danger btn-sm';db.textContent='Sil';
      db.addEventListener('click',function(){deleteCV(cv.uuid);});
      acts.appendChild(eb);acts.appendChild(pb);acts.appendChild(db);
      card.querySelector('.cv-card-thumb').addEventListener('click',function(){editCV(cv.uuid);});
      g.appendChild(card);
    });
  }).catch(function(e){if(g)g.innerHTML='<p style="color:var(--red);padding:20px;grid-column:1/-1">'+e.message+'</p>';});
}

function editCV(uuid){
  load(true,'CV yükleniyor...');
  API.get('/api/cv/'+uuid)
    .then(function(d){
      // data string olarak gelebilir, parse et
      var data = d.data;
      if(typeof data === 'string'){
        try { data = JSON.parse(data); } catch(_){ data = {}; }
      }
      S.cv = {
        uuid    : d.uuid,
        title   : d.title,
        template: d.template,
        color   : d.color,
        data    : data
      };
      S.step = 0;
      go('builder');
    })
    .catch(function(e){toast(e.message,'err');})
    .finally(function(){load(false);});
}

function deleteCV(uuid){
  if(!confirm('Bu CV\'yi silmek istediğinizden emin misiniz?')) return;
  API.del('/api/cv/'+uuid).then(function(){toast('CV silindi.');openDashboard();}).catch(function(e){toast(e.message,'err');});
}

function dashPDF(uuid){
  load(true,'PDF hazırlanıyor...');
  fetch('/api/cv/'+uuid+'/pdf',{credentials:'same-origin'})
    .then(function(r){
      if(r.status===403){r.json().then(function(){toast('PDF için ödeme gerekiyor.','err');S.plan='single';go('payment');});throw{handled:true};}
      if(!r.ok) throw new Error('PDF hatası');
      return r.blob();
    })
    .then(function(b){
      triggerDL(b,'CV_'+uuid+'.pdf');toast('PDF indirildi!');
      return API.get('/api/auth/me').then(function(d){if(d.loggedIn){S.user=d.user;updateNav();}});
    })
    .catch(function(e){if(!e||!e.handled)toast((e&&e.message)||'PDF hatası','err');})
    .finally(function(){load(false);});
}

/* ── ÖDEME ── */
function setupPayment(){
  if(!S.user){openModal('register');go('home');return;}
}

function selectPlan(plan){
  // Sadece tek plan var: single (20 TL)
  S.plan='single';
}

function fmtCard(el){var v=el.value.replace(/\D/g,'').substring(0,16);el.value=v.replace(/(.{4})/g,'$1 ').trim();}
function fmtExp(el){var v=el.value.replace(/\D/g,'').substring(0,4);if(v.length>=2)v=v.substring(0,2)+'/'+v.substring(2);el.value=v;}

function doPayment(){
  var cn=($('c-name')||{}).value||'';
  var num=(($('c-num')||{}).value||'').replace(/\s/g,'');
  var exp=($('c-exp')||{}).value||'';
  var cvc=($('c-cvv')||{}).value||'';
  cn=cn.trim();cvc=cvc.trim();
  if(!cn){toast('Kart adını girin.','err');return;}
  if(num.length<15){toast('Geçerli kart numarası girin.','err');return;}
  if(exp.length<5){toast('Son kullanma tarihi girin.','err');return;}
  if(cvc.length<3){toast('CVV girin.','err');return;}
  var parts=exp.split('/'),em=parts[0],ey=parts[1];
  if(ey&&ey.length===2) ey='20'+ey;
  var btn=$('pay-btn');if(btn){btn.disabled=true;btn.textContent='İşleniyor...';}
  load(true,'Ödeme alınıyor...');
  API.post('/api/payment/checkout',{cardHolderName:cn,cardNumber:num,expireMonth:em,expireYear:ey,cvc:cvc})
    .then(function(d){
      S.user=d.user; updateNav();
      var msg=$('success-msg');
      if(msg){
        if(S.plan==='ai') msg.textContent='AI Destekli planınız aktif! Sınırsız PDF ve AI yazım yardımı kullanabilirsiniz.';
        else msg.textContent='1 PDF indirme hakkınız eklendi. CV\'nizi indirebilirsiniz.';
      }
      go('success');
      toast('🎉 Ödeme başarılı!');
    })
    .catch(function(e){toast(e.message,'err');})
    .finally(function(){load(false);if(btn){btn.disabled=false;btn.textContent='Ödemeyi Tamamla →';}});
}

/* ── PROFİL ── */
function loadProfilePage(){
  if(!S.user){go('home');return;}
  var el=$('profile-info');if(!el)return;
  API.get('/api/user/profile').then(function(d){
    var planTxt='Ücretsiz';
    if(d.isAI) planTxt='🤖 AI Destekli Plan ('+fmtDate(d.planEnds)+' sona erer)';
    else if(d.credits>0) planTxt='🎫 '+d.credits+' PDF indirme hakkı';
    el.innerHTML='<div class="fg"><label>Ad Soyad</label><input id="prof-name" value="'+esc(d.name)+'"></div>'
      +'<div class="fg"><label>E-posta</label><input value="'+esc(d.email)+'" disabled style="opacity:.6"></div>'
      +'<div style="padding:14px;background:var(--blue-ll);border-radius:var(--r);margin-bottom:18px;font-size:14px">'
      +'Plan: <b>'+planTxt+'</b></div>'
      +'<div style="border-top:1px solid var(--border);padding-top:14px;margin-bottom:14px">'
      +'<div style="font-size:13px;font-weight:600;margin-bottom:10px">Şifre Değiştir</div>'
      +'<div class="fg"><label>Mevcut Şifre</label><input id="prof-cur" type="password" placeholder="••••••••"></div>'
      +'<div class="fg"><label>Yeni Şifre</label><input id="prof-new" type="password" placeholder="En az 6 karakter"></div></div>'
      +'<div id="prof-btns" style="display:flex;gap:10px;flex-wrap:wrap"></div>';
    var btns=$('prof-btns');
    var sb=document.createElement('button');sb.className='btn btn-primary';sb.textContent='Kaydet';
    sb.addEventListener('click',saveProfile);btns.appendChild(sb);
    var up=document.createElement('button');up.className='btn btn-outline';up.textContent='Plan Yükselt';
    up.addEventListener('click',function(){go('pricing');});btns.appendChild(up);
  }).catch(function(e){if(el)el.innerHTML='<p style="color:var(--red)">'+e.message+'</p>';});
}

function saveProfile(){
  var name=($('prof-name')||{}).value||'';
  var cur=($('prof-cur')||{}).value||'';
  var nw=($('prof-new')||{}).value||'';
  load(true);
  API.put('/api/user/profile',{name:name.trim()||undefined,currentPassword:cur||undefined,newPassword:nw||undefined})
    .then(function(){if(name&&S.user){S.user.name=name;updateNav();}toast('Profil güncellendi ✓');})
    .catch(function(e){toast(e.message,'err');}).finally(function(){load(false);});
}

/* ── SSS ── */
function toggleFaq(el){ el.closest('.faq-item').classList.toggle('open'); }

/* ── BAŞLAT ── */
document.addEventListener('DOMContentLoaded',function(){

  document.addEventListener('click',function(e){
    var gt=e.target.closest('[data-go]');if(gt)go(gt.dataset.go);
    var st=e.target.closest('[data-scroll]');if(st)scrollToSection(st.dataset.scroll);
    var mt=e.target.closest('[data-modal]');if(mt)openModal(mt.dataset.modal);
  });

  var ov=$('auth-modal');if(ov)ov.addEventListener('click',function(e){if(e.target===ov)closeModal();});
  var mc=$('modal-close-btn');if(mc)mc.addEventListener('click',closeModal);
  $$('.m-tab').forEach(function(t){t.addEventListener('click',function(){switchTab(t.dataset.tab);});});

  var lb=$('login-btn');if(lb)lb.addEventListener('click',doLogin);
  var rb=$('register-btn');if(rb)rb.addEventListener('click',doRegister);
  var lp=$('l-pass');if(lp)lp.addEventListener('keydown',function(e){if(e.key==='Enter')doLogin();});
  var rp=$('r-pass');if(rp)rp.addEventListener('keydown',function(e){if(e.key==='Enter')doRegister();});
  var sw=document.querySelector('.switch-to-register');if(sw)sw.addEventListener('click',function(){switchTab('register');});

  var nl=$('nav-logo');if(nl)nl.addEventListener('click',function(){go('home');});
  var fb=$('ft-builder');if(fb)fb.addEventListener('click',newCV);

  ['hero-start-btn','cta-btn'].forEach(function(id){var b=$(id);if(b)b.addEventListener('click',newCV);});
  var tps=$('tpl-page-start-btn');if(tps)tps.addEventListener('click',newCV);

  // Ana sayfa fiyat butonları
  var hfb=$('home-free-btn');if(hfb)hfb.addEventListener('click',newCV);
  $$('.home-single-btn').forEach(function(b){b.addEventListener('click',function(){S.plan='single';go('payment');});});
  
  var pfb=$('pricing-free-btn');if(pfb)pfb.addEventListener('click',newCV);
  $$('.pricing-single-btn').forEach(function(b){b.addEventListener('click',function(){S.plan='single';go('payment');});});
  

  $$('.plan-opt').forEach(function(el){el.addEventListener('click',function(){selectPlan(el.dataset.plan);});});

  var bb=$('builder-back-btn');if(bb)bb.addEventListener('click',function(){go('home');});
  var bp=$('btn-prev');if(bp)bp.addEventListener('click',function(){collectPersonal();S.step=Math.max(0,S.step-1);renderStepUI();});
  var bn=$('btn-next');if(bn)bn.addEventListener('click',function(){
    if(S.step===4){handlePDF();return;}
    collectPersonal();S.step=Math.min(4,S.step+1);renderStepUI();
  });
  $$('.s-pill').forEach(function(p){p.addEventListener('click',function(){collectPersonal();S.step=parseInt(p.dataset.step);renderStepUI();});});
  var ae=$('add-exp-btn');if(ae)ae.addEventListener('click',addExp);
  var aed=$('add-edu-btn');if(aed)aed.addEventListener('click',addEdu);
  var ask=$('add-skill-btn');if(ask)ask.addEventListener('click',addSkill);
  var al=$('add-lang-btn');if(al)al.addEventListener('click',addLang);
  var pb=$('pdf-btn');if(pb)pb.addEventListener('click',handlePDF);
  var sc=$('save-cv-btn');if(sc)sc.addEventListener('click',saveCV);

  var pay=$('pay-btn');if(pay)pay.addEventListener('click',doPayment);
  var pback=$('pay-back-btn');if(pback)pback.addEventListener('click',function(){go('pricing');});
  var cn=$('c-num');if(cn)cn.addEventListener('input',function(){fmtCard(this);});
  var ce=$('c-exp');if(ce)ce.addEventListener('input',function(){fmtExp(this);});

  var sbb=$('success-build-btn');if(sbb)sbb.addEventListener('click',function(){
    if(S.cv.uuid) go('builder'); else newCV();
  });
  var shb=$('success-home-btn');if(shb)shb.addEventListener('click',function(){go('home');});
  var ncb=$('new-cv-btn');if(ncb)ncb.addEventListener('click',newCV);
  var pll=$('profile-login-link');if(pll)pll.addEventListener('click',function(){openModal('login');});
  $$('.faq-q').forEach(function(q){q.addEventListener('click',function(){q.closest('.faq-item').classList.toggle('open');});});

  window.addEventListener('resize',function(){if(S.page==='builder')renderPreview();});

  initAuth().then(function(){loadHomePage();});
});
