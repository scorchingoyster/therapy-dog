'use strict';

const express = require('express');
const multer = require('multer');
const config = require('../config');
const auth = require('./auth');

let router = express.Router();
let upload = multer({ dest: config.UPLOADS_DIRECTORY });

router.use(auth.getRemoteUser);

router.use(require('body-parser').json());

router.get('/forms/:id/:collection?/:admin?', require('./handlers/forms').show);
router.post('/deposits', auth.requireRemoteUser, require('./handlers/deposits').create);
router.post('/deposits/debug', auth.requireRemoteUser, auth.requireDebug, require('./handlers/deposits').debug);
router.post('/uploads', auth.requireRemoteUser, upload.single('file'), require('./handlers/uploads').create);

module.exports = router;
