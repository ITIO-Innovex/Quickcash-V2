const multer  = require('multer');

exports.uploadHandler = multer({ storage: audiobookStorage, fileFilter: audiobookFilter })

exports.audiobookUploadHandler = multer({
  storage: audiobookStorage,
  fileFilter: audiobookFilter
});
