'use strict';
const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const c = require('../controllers/userController');

router.get ('/profile',              requireAuth, c.profile);
router.put ('/profile',              requireAuth, c.updateProfile);
router.post('/cancel-subscription',  requireAuth, c.cancelSubscription);

module.exports = router;
