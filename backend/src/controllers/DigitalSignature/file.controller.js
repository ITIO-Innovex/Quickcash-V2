const { flattenPdf, getSecureUrl } = require('../../utils/fileUtils');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const File = require('../../models/DigitalSignature/file.model');
const mongoose = require('mongoose');

/**
 * Save file to the server
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const saveFile = async (req, res) => {
  let uploadedFilePath = null;
  
  try {
    console.log('Starting file upload process...');
    const { fileBase64, fileName, id } = req.body;

    if (!fileBase64) {
      return res.status(400).json({ error: 'Please provide file.' });
    }

    if (!req.user || !req.user._id) {
      console.error('Authentication error:', { user: req.user });
      return res.status(401).json({ error: 'User is not authenticated or missing user ID.' });
    }

    if (!fileName) {
      return res.status(400).json({ error: 'File name is required.' });
    }

    console.log('Processing file:', { fileName, userId: req.user._id });

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected. Current state:', mongoose.connection.readyState);
      return res.status(500).json({ error: 'Database connection is not ready' });
    }

    // Get file extension
    const ext = fileName?.split('.')?.pop()?.toLowerCase();
    let fileBuffer;
    let mimeType;

    try {
      // Process file based on type
      if (ext === 'pdf') {
        mimeType = 'application/pdf';
        fileBuffer = await flattenPdf(fileBase64);
      } else if (['png', 'jpeg', 'jpg'].includes(ext)) {
        mimeType = `image/${ext}`;
        fileBuffer = Buffer.from(fileBase64, 'base64');
      } else {
        return res.status(400).json({ error: 'Unsupported file type. Only PDF and image files are allowed.' });
      }
    } catch (fileProcessError) {
      console.error('Error processing file:', fileProcessError);
      return res.status(400).json({ error: 'Error processing file. Please check if the file is valid.' });
    }

    // Generate unique filename
    const uniqueFileName = `${uuidv4()}-${fileName}`;
    const uploadDir = path.join(__dirname, '../../../uploads');
    
    try {
      // Ensure upload directory exists
      await fs.mkdir(uploadDir, { recursive: true });
      
      // Save file
      const filePath = path.join(uploadDir, uniqueFileName);
      await fs.writeFile(filePath, fileBuffer);
      uploadedFilePath = filePath;
      console.log('File saved to disk:', filePath);
    } catch (fileSystemError) {
      console.error('Error saving file to disk:', fileSystemError);
      return res.status(500).json({ error: 'Error saving file to server. Please try again.' });
    }

    try {
      // Generate file URL
      const fileUrl = `/uploads/${uniqueFileName}`;
      const secureUrl = getSecureUrl(fileUrl);

      // Create file document
      const fileData = {
        fileName: fileName,
        fileUrl: secureUrl.url,
        fileSize: fileBuffer.length,
        mimeType: mimeType,
        createdBy: req.user._id
      };

      // Add tenantId if available
      if (req.user.tenantId) {
        fileData.tenantId = req.user.tenantId;
      }

      console.log('Saving file metadata to database:', fileData);

      // Save file data to database
      const file = new File(fileData);
      const savedFile = await file.save();
      console.log('File metadata saved successfully:', savedFile._id);

      // Return success response
      return res.status(200).json({ 
        success: true,
        message: 'File uploaded successfully',
        url: secureUrl.url,
        fileId: savedFile._id,
        name: fileName,
        fileSize: fileBuffer.length,
        mimeType: mimeType
      });
    } catch (dbError) {
      console.error('Error saving file metadata to database:', dbError);
      
      // Clean up the uploaded file if database save fails
      if (uploadedFilePath) {
        try {
          await fs.unlink(uploadedFilePath);
          console.log('Cleaned up uploaded file after database error');
        } catch (cleanupError) {
          console.error('Error cleaning up file after failed database save:', cleanupError);
        }
      }

      // Check for specific database errors
      if (dbError instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid file data',
          details: Object.values(dbError.errors).map(err => err.message)
        });
      }

      if (dbError.code === 11000) {
        return res.status(400).json({ 
          success: false,
          error: 'File with this name already exists' 
        });
      }

      return res.status(500).json({ 
        success: false,
        error: 'Error saving file metadata',
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }
  } catch (error) {
    console.error('Unexpected error in saveFile:', error);
    
    // Clean up the uploaded file if it exists
    if (uploadedFilePath) {
      try {
        await fs.unlink(uploadedFilePath);
        console.log('Cleaned up uploaded file after unexpected error');
      } catch (cleanupError) {
        console.error('Error cleaning up file after unexpected error:', cleanupError);
      }
    }

    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get list of files with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const saveFileListing = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search = '',
      fileType
    } = req.query;

    // Build query
    const query = { createdBy: req.user._id };
    
    // Add search filter
    if (search) {
      query.fileName = { $regex: search, $options: 'i' };
    }

    // Add file type filter
    if (fileType) {
      query.mimeType = { $regex: fileType, $options: 'i' };
    }

    // Add tenant filter if available
    if (req.user.tenantId) {
      query.tenantId = req.user.tenantId;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination and sorting
    const [files, total] = await Promise.all([
      File.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'name email'),
      File.countDocuments(query)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      success: true,
      data: {
        files,
        pagination: {
          total,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit),
          hasNextPage,
          hasPrevPage
        }
      },
      message: 'Files retrieved successfully'
    });

  } catch (error) {
    console.error('Error in saveFileListing:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  saveFile,
  saveFileListing
}; 