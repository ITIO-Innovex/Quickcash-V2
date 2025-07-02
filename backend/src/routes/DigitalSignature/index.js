const express = require('express');
const router = express.Router();

const FileRoutes = require('./file.routes');
const DriveRoutes = require('./drive.routes');
const SignRoutes = require('./sign.routes');
const DocumentRoutes = require('./document.routes');
const ContactBook = require('./contactBook.routes');
const Template = require('./template.routes');

router.use('/files', FileRoutes);
router.use('/drive', DriveRoutes);
router.use('/sign', SignRoutes);
router.use('/documents', DocumentRoutes);
router.use('/contacts', ContactBook);
router.use('/template', Template);

module.exports = router;
