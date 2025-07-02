const Drive = require('../model/drive.model');
const File = require('../model/file.model');
const mongoose = require('mongoose');

/**
 * Create a new folder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */ 
const createFolder = async (req, res) => {
  try {
    const { name, parentId } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Folder name is required'
      });
    }

    // Check if parent folder exists if parentId is provided
    if (parentId) {
      const parentFolder = await Drive.findOne({
        _id: parentId,
        type: 'folder',
        $or: [
          { createdBy: req.user._id },
          { 'sharedWith.user': req.user._id }
        ]
      });

      if (!parentFolder) {
        return res.status(404).json({
          success: false,
          error: 'Parent folder not found or access denied'
        });
      }
    }

    const folder = await Drive.create({
      name,
      type: 'folder',
      parentId,
      createdBy: req.user._id,
      tenantId: req.user.tenantId
    });

    return res.status(201).json({
      success: true,
      data: folder,
      message: 'Folder created successfully'
    });
  } catch (error) {
    console.error('Error in createFolder:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get drive contents (files and folders)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDriveContents = async (req, res) => {
  try {
    const {
      parentId = null,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc',
      type,
      search = '',
      isStarred,
      isTrashed = false
    } = req.query;

    // Build query
    const query = {
      $or: [
        { createdBy: req.user._id },
        { 'sharedWith.user': req.user._id }
      ],
      isTrashed: isTrashed === 'true',
      parentId: parentId === 'root' ? null : parentId
    };

    // Add type filter
    if (type) {
      query.type = type;
    }

    // Add search filter
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Add starred filter
    if (isStarred === 'true') {
      query.isStarred = true;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination and sorting
    const [items, total] = await Promise.all([
      Drive.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'name email')
        .populate('fileId')
        .populate('sharedWith.user', 'name email'),
      Drive.countDocuments(query)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      success: true,
      data: {
        items,
        pagination: {
          total,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit),
          hasNextPage,
          hasPrevPage
        }
      },
      message: 'Drive contents retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getDriveContents:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Move item to trash or restore from trash
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const toggleTrash = async (req, res) => {
  try {
    const { id } = req.params;
    const { restore = false } = req.query;

    const item = await Drive.findOne({
      _id: id,
      createdBy: req.user._id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found or access denied'
      });
    }

    item.isTrashed = !restore;
    await item.save();

    return res.status(200).json({
      success: true,
      data: item,
      message: restore ? 'Item restored successfully' : 'Item moved to trash'
    });
  } catch (error) {
    console.error('Error in toggleTrash:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Toggle star status of an item
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const toggleStar = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Drive.findOne({
      _id: id,
      createdBy: req.user._id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found or access denied'
      });
    }

    item.isStarred = !item.isStarred;
    await item.save();

    return res.status(200).json({
      success: true,
      data: item,
      message: item.isStarred ? 'Item starred successfully' : 'Item unstarred successfully'
    });
  } catch (error) {
    console.error('Error in toggleStar:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Share item with other users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const shareItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { users } = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide users to share with'
      });
    }

    const item = await Drive.findOne({
      _id: id,
      createdBy: req.user._id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found or access denied'
      });
    }

    // Add new users to sharedWith array
    item.sharedWith = [
      ...item.sharedWith,
      ...users.map(user => ({
        user: user.userId,
        permission: user.permission || 'view'
      }))
    ];

    await item.save();

    return res.status(200).json({
      success: true,
      data: item,
      message: 'Item shared successfully'
    });
  } catch (error) {
    console.error('Error in shareItem:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Move item to a different folder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const moveItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { newParentId } = req.body;

    const item = await Drive.findOne({
      _id: id,
      createdBy: req.user._id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found or access denied'
      });
    }

    // Check if new parent folder exists
    if (newParentId) {
      const parentFolder = await Drive.findOne({
        _id: newParentId,
        type: 'folder',
        createdBy: req.user._id
      });

      if (!parentFolder) {
        return res.status(404).json({
          success: false,
          error: 'Destination folder not found or access denied'
        });
      }
    }

    item.parentId = newParentId;
    await item.save();

    return res.status(200).json({
      success: true,
      data: item,
      message: 'Item moved successfully'
    });
  } catch (error) {
    console.error('Error in moveItem:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Rename item
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const renameItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { newName } = req.body;

    if (!newName) {
      return res.status(400).json({
        success: false,
        error: 'New name is required'
      });
    }

    const item = await Drive.findOne({
      _id: id,
      createdBy: req.user._id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found or access denied'
      });
    }

    item.name = newName;
    await item.save();

    return res.status(200).json({
      success: true,
      data: item,
      message: 'Item renamed successfully'
    });
  } catch (error) {
    console.error('Error in renameItem:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createFolder,
  getDriveContents,
  toggleTrash,
  toggleStar,
  shareItem,
  moveItem,
  renameItem
}; 