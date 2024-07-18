const router = require('express').Router();
const handler = require('./handler');

router.get('/ayf', function(req, res) {
    res.json({ message: 'ayf' });
});

router.post('/token', handler.updateToken);
router.post('/call', handler.call);

exports.router = router;