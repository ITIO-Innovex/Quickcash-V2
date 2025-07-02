const express = require('express');
const router = express.Router();
const {
  createFolder,
  getDriveContents,
  toggleTrash,
  toggleStar,
  shareItem,
  moveItem,
  renameItem
} = require('../../controllers/DigitalSignature/driveController');
const { verifyToken } = require('../../middlewares/auth.middleware');

router.post('/folders', verifyToken, createFolder);
router.get('/contents', verifyToken, getDriveContents);
router.patch('/:id/trash', verifyToken, toggleTrash);
router.patch('/:id/star', verifyToken, toggleStar);
router.post('/:id/share', verifyToken, shareItem);
router.patch('/:id/move', verifyToken, moveItem);
router.patch('/:id/rename', verifyToken, renameItem);

module.exports = router; 