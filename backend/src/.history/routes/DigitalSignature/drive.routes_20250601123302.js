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

// Create a new folder
router.post('/folders', verifyToken, createFolder);

// Get drive contents
router.get('/contents', verifyToken, getDriveContents);

// Toggle trash status
router.patch('/:id/trash', verifyToken, toggleTrash);

// Toggle star status
router.patch('/:id/star', verifyToken, toggleStar);

// Share item with users
router.post('/:id/share', verifyToken, shareItem);

// Move item to different folder
router.patch('/:id/move', verifyToken, moveItem);

// Rename item
router.patch('/:id/rename', verifyToken, renameItem);

module.exports = router; 