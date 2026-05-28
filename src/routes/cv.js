'use strict';
const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const c = require('../controllers/cvController');

router.get('/',           requireAuth, c.list);
router.get('/:uuid',      requireAuth, c.get);
router.post('/',          requireAuth, c.create);
router.put('/:uuid',      requireAuth, c.update);
router.delete('/:uuid',   requireAuth, c.remove);
router.get('/:uuid/pdf',  requireAuth, c.pdf);
router.post('/preview',   c.preview);

module.exports = router;
