'use strict';
const { v4: uuid } = require('uuid');
const { q }        = require('../models/database');

const PLAN = { amount: 20, label: 'Tek CV Indirme' };

function plans(req, res) {
  res.json({ plans: [{ id: 'single', amount: PLAN.amount, label: PLAN.label }] });
}

async function checkout(req, res, next) {
  try {
    const { cardHolderName, cardNumber, expireMonth, expireYear, cvc } = req.body;
    if (!cardHolderName || !cardHolderName.trim())
      return res.status(400).json({ error: 'Kart sahibi adi eksik.' });
    if (!cardNumber || cardNumber.replace(/\s/g,'').length < 15)
      return res.status(400).json({ error: 'Kart numarasi gecersiz.' });
    if (!expireMonth || !expireYear)
      return res.status(400).json({ error: 'Son kullanma tarihi eksik.' });
    if (!cvc || cvc.length < 3)
      return res.status(400).json({ error: 'CVV gecersiz.' });

    const payId = uuid();

    // Demo mod - Iyzico icin asagidaki yorumu kaldir
    const ref = 'DEMO_' + Date.now();
    
    // insertPayment: uuid, user_id, amount - 3 parametre
    q.insertPayment.run(payId, req.user.id, PLAN.amount);
    q.completePayment.run(ref, payId);
    q.addCredit.run(req.user.id);

    const user = q.userById.get(req.user.id);
    res.json({
      success: true,
      user: {
        name   : user.name,
        email  : user.email,
        plan   : user.plan,
        credits: user.cv_credits || 0
      }
    });
  } catch (err) {
    console.error('[ODEME HATA]', err.message);
    next(err);
  }
}

function history(req, res) {
  res.json({ payments: q.paysByUser.all(req.user.id) });
}

module.exports = { plans, checkout, history };
