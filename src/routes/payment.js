'use strict';
const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const c = require('../controllers/paymentController');
router.get('/plans',    c.plans);
router.post('/checkout', requireAuth, c.checkout);
router.get('/history',  requireAuth, c.history);
module.exports = router;
