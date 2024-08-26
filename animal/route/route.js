const router = require('express').Router();
const handler = require('../handler/handler.js');
const account = require('../handler/account.js');
const locale = require('../handler/locale.js');
const report = require('../handler/report.js');

router.post('/login', account.login);
router.get('/lang', locale.getLocale);
router.post('/lang', locale.genLocale);
router.post('/report/location', report.location);

exports.router = router;