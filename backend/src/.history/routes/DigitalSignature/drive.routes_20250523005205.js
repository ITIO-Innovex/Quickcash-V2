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
} = require('../controller/driveController');
const { authenticate } = require('../middleware/auth');

// Apply authentication middleware
// router.use(authenticate);

// Create a new folder
router.post('/folders', authenticate, createFolder);

// Get drive contents
router.get('/contents', authenticate, getDriveContents);

// Toggle trash status
router.patch('/:id/trash', authenticate, toggleTrash);

// Toggle star status
router.patch('/:id/star', authenticate, toggleStar);

// Share item with users
router.post('/:id/share', authenticate, shareItem);

// Move item to different folder
router.patch('/:id/move', authenticate, moveItem);

// Rename item
router.patch('/:id/rename', authenticate, renameItem);

module.exports = router; 