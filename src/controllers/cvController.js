'use strict';
const { v4: uuid } = require('uuid');
const { q }        = require('../models/database');
const { renderCV } = require('../utils/cvRenderer');

function list(req, res) {
  res.json({ cvs: q.cvsByUser.all(req.user.id).map(c => ({
    uuid:c.uuid, title:c.title, template:c.template, color:c.color,
    updatedAt:c.updated_at, createdAt:c.created_at
  }))});
}

function get(req, res) {
  const cv = q.cvByUuid.get(req.params.uuid);
  if (!cv || cv.user_id !== req.user.id) return res.status(404).json({ error: 'CV bulunamadı.' });
  res.json({ uuid:cv.uuid, title:cv.title, template:cv.template, color:cv.color, data:JSON.parse(cv.data), updatedAt:cv.updated_at });
}

function create(req, res) {
  const { title="CV'm", template='harvard', color='#2563eb', data={} } = req.body;
  const id = uuid();
  q.insertCV.run(id, req.user.id, title, template, color, JSON.stringify(data));
  res.status(201).json({ success:true, uuid:id });
}

function update(req, res) {
  const cv = q.cvByUuid.get(req.params.uuid);
  if (!cv || cv.user_id !== req.user.id) return res.status(404).json({ error: 'CV bulunamadı.' });
  const { title, template, color, data } = req.body;
  q.updateCV.run(
    title    !=null ? title    : cv.title,
    template !=null ? template : cv.template,
    color    !=null ? color    : cv.color,
    JSON.stringify(data!=null ? data : JSON.parse(cv.data)),
    cv.uuid, req.user.id
  );
  res.json({ success:true });
}

function remove(req, res) {
  const cv = q.cvByUuid.get(req.params.uuid);
  if (!cv || cv.user_id !== req.user.id) return res.status(404).json({ error: 'CV bulunamadı.' });
  q.deleteCV.run(req.params.uuid, req.user.id);
  res.json({ success:true });
}

async function pdf(req, res, next) {
  try {
    const cv = q.cvByUuid.get(req.params.uuid);
    if (!cv || cv.user_id !== req.user.id) return res.status(404).json({ error: 'CV bulunamadı.' });

    const user = req.user;
    if ((user.cv_credits || 0) < 1) {
      return res.status(403).json({ error: 'PDF indirmek için ödeme yapmanız gerekiyor.', upgrade: true });
    }

    const data = JSON.parse(cv.data);
    const html = renderCV(data, cv.template, cv.color, false);
    const buf  = await makePDF(html);

    q.useCredit.run(user.id);

    const p  = data.personal || {};
    const fn = ((p.firstName||'CV')+'_'+(p.lastName||'')+'_CVYap.pdf').replace(/\s+/g,'_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="'+fn+'"');
    res.end(buf);
  } catch (err) { console.error('[PDF]', err.message); next(err); }
}

function preview(req, res) {
  const { data={}, template='harvard', color='#2563eb' } = req.body;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderCV(data, template, color, false));
}

function findChrome() {
  const fs=require('fs'), path=require('path'), os=require('os');
  const home=os.homedir(), lapp=process.env.LOCALAPPDATA||'';
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    try { if(fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) return process.env.PUPPETEER_EXECUTABLE_PATH; } catch(_){}
  }
  const cache=path.join(home,'.cache','puppeteer','chrome');
  const found=[];
  try { fs.readdirSync(cache).forEach(d=>{
    ['chrome-win64/chrome.exe','chrome-linux64/chrome',
     'chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing']
    .forEach(s=>{ const p=path.join(cache,d,s); try{if(fs.existsSync(p))found.push(p);}catch(_){} });
  }); } catch(_){}
  const all=[...found,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(lapp,'Google','Chrome','Application','chrome.exe'),
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/chromium','/usr/bin/chromium-browser','/usr/bin/google-chrome','/usr/bin/google-chrome-stable'
  ];
  for(const p of all){try{if(p&&require('fs').existsSync(p))return p;}catch(_){}}
  return null;
}

async function makePDF(html) {
  const puppeteer = require('puppeteer');
  const chrome    = findChrome();
  const opts = { headless:true, args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu'] };
  if (chrome) opts.executablePath = chrome;
  let browser;
  try { browser = await puppeteer.launch(opts); }
  catch(e) { throw new Error('Chrome başlatılamadı: '+e.message); }
  const page = await browser.newPage();
  try {
    await page.setViewport({width:794,height:1123,deviceScaleFactor:1});
    await page.setContent(html,{waitUntil:'domcontentloaded',timeout:30000});
    await page.evaluate(()=>document.fonts.ready).catch(()=>{});
    const buf = await page.pdf({format:'A4',printBackground:true,margin:{top:'0mm',right:'0mm',bottom:'0mm',left:'0mm'}});
    return Buffer.from(buf);
  } finally { await browser.close(); }
}

module.exports = { list, get, create, update, remove, pdf, preview };
