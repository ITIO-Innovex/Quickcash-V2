/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - name
 *         - mobile
 *       properties:
 *         _id:
 *           type: string
 *           description: User ID
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *         name:
 *           type: string
 *           description: User full name
 *         mobile:
 *           type: string
 *           description: User mobile number
 *         profileImage:
 *           type: string
 *           description: User profile image URL
 *         status:
 *           type: string
 *           enum: [active, suspended, pending]
 *           description: User account status
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: User role
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation date
 *     
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User email
 *         password:
 *           type: string
 *           description: User password
 *     
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *         - mobile
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User email
 *         password:
 *           type: string
 *           description: User password
 *         name:
 *           type: string
 *           description: User full name
 *         mobile:
 *           type: string
 *           description: User mobile number
 *         country:
 *           type: string
 *           description: User country
 *     
 *     Invoice:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Invoice ID
 *         invoice_number:
 *           type: string
 *           description: Invoice number
 *         user:
 *           type: string
 *           description: User ID who created the invoice
 *         invoice_date:
 *           type: string
 *           format: date
 *           description: Invoice date
 *         due_date:
 *           type: string
 *           format: date
 *           description: Due date
 *         status:
 *           type: string
 *           enum: [pending, paid, overdue, cancelled]
 *           description: Invoice status
 *         total:
 *           type: number
 *           description: Total amount
 *         currency:
 *           type: string
 *           description: Currency code
 *         productsInfo:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               quantity:
 *                 type: number
 *               price:
 *                 type: number
 *     
 *     Crypto:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Crypto ID
 *         name:
 *           type: string
 *           description: Crypto name
 *         symbol:
 *           type: string
 *           description: Crypto symbol
 *         price:
 *           type: number
 *           description: Current price
 *         marketCap:
 *           type: number
 *           description: Market capitalization
 *         volume24h:
 *           type: number
 *           description: 24-hour volume
 *     
 *     Document:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Document ID
 *         name:
 *           type: string
 *           description: Document name
 *         description:
 *           type: string
 *           description: Document description
 *         url:
 *           type: string
 *           description: Document URL
 *         note:
 *           type: string
 *           description: Document notes
 *         status:
 *           type: string
 *           enum: [draft, pending, signed, completed, declined]
 *           description: Document status
 *         createdBy:
 *           type: string
 *           description: User ID who created the document
 *         Signers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Signer'
 *           description: List of signers
 *         AuditTrail:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AuditTrail'
 *           description: Document audit trail
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Document creation date
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Document last update date
 *     
 *     Signer:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: User ID of the signer
 *         objectId:
 *           type: string
 *           description: Contact book object ID
 *         name:
 *           type: string
 *           description: Signer name
 *         email:
 *           type: string
 *           format: email
 *           description: Signer email
 *         mobile:
 *           type: string
 *           description: Signer mobile number
 *         status:
 *           type: string
 *           enum: [pending, signed, declined]
 *           description: Signer status
 *         signedAt:
 *           type: string
 *           format: date-time
 *           description: When the document was signed
 *     
 *     AuditTrail:
 *       type: object
 *       properties:
 *         UserDetails:
 *           type: object
 *           description: User who performed the action
 *         Activity:
 *           type: string
 *           enum: [Created, Viewed, Signed, Declined, Forwarded]
 *           description: Activity performed
 *         ipAddress:
 *           type: string
 *           description: IP address of the user
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the activity occurred
 *         SignedUrl:
 *           type: string
 *           description: URL of the signed document
 *     
 *     Contact:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Contact ID
 *         name:
 *           type: string
 *           description: Contact name
 *         email:
 *           type: string
 *           format: email
 *           description: Contact email
 *         mobile:
 *           type: string
 *           description: Contact mobile number
 *         company:
 *           type: string
 *           description: Contact company
 *         designation:
 *           type: string
 *           description: Contact designation
 *         createdBy:
 *           type: string
 *           description: User ID who created the contact
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Contact creation date
 *     
 *     File:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: File ID
 *         name:
 *           type: string
 *           description: File name
 *         originalName:
 *           type: string
 *           description: Original file name
 *         size:
 *           type: number
 *           description: File size in bytes
 *         mimeType:
 *           type: string
 *           description: File MIME type
 *         url:
 *           type: string
 *           description: File URL
 *         createdBy:
 *           type: string
 *           description: User ID who uploaded the file
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: File upload date
 *     
 *     DriveItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Drive item ID
 *         name:
 *           type: string
 *           description: Item name
 *         type:
 *           type: string
 *           enum: [file, folder]
 *           description: Item type
 *         parentId:
 *           type: string
 *           description: Parent folder ID
 *         isStarred:
 *           type: boolean
 *           description: Whether item is starred
 *         isTrashed:
 *           type: boolean
 *           description: Whether item is in trash
 *         createdBy:
 *           type: string
 *           description: User ID who created the item
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Item creation date
 *     
 *     Signature:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Signature ID
 *         name:
 *           type: string
 *           description: Signature name
 *         signatureData:
 *           type: string
 *           description: Base64 encoded signature data
 *         createdBy:
 *           type: string
 *           description: User ID who created the signature
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Signature creation date
 *     
 *     Error:
 *       type: object
 *       properties:
 *         status:
 *           type: number
 *           description: HTTP status code
 *         message:
 *           type: string
 *           description: Error message
 *     
 *     Success:
 *       type: object
 *       properties:
 *         status:
 *           type: number
 *           description: HTTP status code
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: object
 *           description: Response data
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token for authentication
 */

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication endpoints
 *   - name: Users
 *     description: User management endpoints
 *   - name: Invoices
 *     description: Invoice management endpoints
 *   - name: Crypto
 *     description: Cryptocurrency related endpoints
 *   - name: Digital Signature
 *     description: Digital signature endpoints
 *   - name: Documents
 *     description: Document management endpoints
 *   - name: Signatures
 *     description: Signature management endpoints
 *   - name: Files
 *     description: File management endpoints
 *   - name: Drive
 *     description: Drive management endpoints
 *   - name: Contacts
 *     description: Contact book management endpoints
 *   - name: KYC
 *     description: Know Your Customer endpoints
 *   - name: Wallet
 *     description: Wallet management endpoints
 */

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the API is running properly
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Api is working fine"
 *                 data:
 *                   type: string
 *                   description: Request headers
 *                 systemos:
 *                   type: string
 *                   description: Operating system type
 */

/**
 * @swagger
 * /api/v1/user/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/user/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and return JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT token
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/user/logout:
 *   post:
 *     summary: User logout
 *     description: Logout user and invalidate token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/user/get-user-details:
 *   get:
 *     summary: Get current user details
 *     description: Retrieve current authenticated user information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/user/update-profile:
 *   patch:
 *     summary: Update user profile
 *     description: Update current user profile information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User name
 *               mobile:
 *                 type: string
 *                 description: User mobile number
 *               address:
 *                 type: string
 *                 description: User address
 *               city:
 *                 type: string
 *                 description: User city
 *               state:
 *                 type: string
 *                 description: User state
 *               country:
 *                 type: string
 *                 description: User country
 *               ownerbrd:
 *                 type: string
 *                 format: binary
 *                 description: Business registration document
 *               ownerProfile:
 *                 type: string
 *                 format: binary
 *                 description: Owner profile image
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/user/change-password:
 *   patch:
 *     summary: Change user password
 *     description: Change current user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current password
 *               newPassword:
 *                 type: string
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized or invalid current password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/user/forget-password:
 *   post:
 *     summary: Forgot password
 *     description: Send password reset email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *     responses:
 *       200:
 *         description: Password reset email sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/user/getLiveMarketCryptoData:
 *   get:
 *     summary: Get live crypto market data
 *     description: Retrieve live cryptocurrency market data
 *     tags: [Crypto]
 *     responses:
 *       200:
 *         description: Crypto data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Crypto'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/user/getRecentTrades:
 *   get:
 *     summary: Get recent trades
 *     description: Retrieve recent trading activities
 *     tags: [Crypto]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent trades retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [buy, sell]
 *                       amount:
 *                         type: number
 *                       crypto:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/user/getCountryList:
 *   get:
 *     summary: Get countries list
 *     description: Retrieve list of available countries
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Countries list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       iso2:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/user/getStateList/{countryId}:
 *   get:
 *     summary: Get states list by country
 *     description: Retrieve list of states for a specific country
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: countryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Country ID
 *     responses:
 *       200:
 *         description: States list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       country_id:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/user/getCityList/{stateId}:
 *   get:
 *     summary: Get cities list by state
 *     description: Retrieve list of cities for a specific state
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stateId
 *         required: true
 *         schema:
 *           type: string
 *         description: State ID
 *     responses:
 *       200:
 *         description: Cities list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       state_id:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/digital-signature:
 *   get:
 *     summary: Get digital signature documents
 *     description: Retrieve user's digital signature documents
 *     tags: [Digital Signature]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Documents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:1
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/kyc:
 *   get:
 *     summary: Get KYC status
 *     description: Retrieve user's KYC verification status
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KYC status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     kycStatus:
 *                       type: string
 *                       enum: [pending, approved, rejected, not_submitted]
 *                     documents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           status:
 *                             type: string
 *                           uploadedAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/wallet:
 *   get:
 *     summary: Get wallet balance
 *     description: Retrieve user's wallet balance and transactions
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     transactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           type:
 *                             type: string
 *                           amount:
 *                             type: number
 *                           status:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/digital-signature/documents/list:
 *   get:
 *     summary: Get document list
 *     description: Retrieve list of documents for the authenticated user
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Documents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Document'
 *                 message:
 *                   type: string
 *                   example: "Documents retrieved successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/digital-signature/documents/list/{id}:
 *   get:
 *     summary: Get documents by user ID
 *     description: Retrieve documents for a specific user
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Documents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Document'
 *                 message:
 *                   type: string
 *                   example: "Documents retrieved successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/digital-signature/documents/{id}:
 *   get:
 *     summary: Get document by ID
 *     description: Retrieve a specific document by its ID
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Document'
 *                 message:
 *                   type: string
 *                   example: "Document retrieved successfully"
 *       400:
 *         description: Invalid document ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/digital-signature/documents/after-save:
 *   post:
 *     summary: Create new document
 *     description: Create a new document for digital signature
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Document name
 *               description:
 *                 type: string
 *                 description: Document description
 *               url:
 *                 type: string
 *                 description: Document URL
 *               note:
 *                 type: string
 *                 description: Document notes
 *               SendinOrder:
 *                 type: boolean
 *                 description: Whether to send in order
 *               Signers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: User ID of the signer
 *                     objectId:
 *                       type: string
 *                       description: Contact book object ID
 *                     name:
 *                       type: string
 *                       description: Signer name
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: Signer email
 *                     mobile:
 *                       type: string
 *                       description: Signer mobile number
 *     responses:
 *       200:
 *         description: Document created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Document'
 *                 message:
 *                   type: string
 *                   example: "Document updated successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/digital-signature/documents/save-pdf:
 *   post:
 *     summary: Save signed PDF
 *     description: Save a signed PDF document
 *     tags: [Documents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documentId
 *               - pdfFile
 *             properties:
 *               documentId:
 *                 type: string
 *                 description: Document ID
 *               pdfFile:
 *                 type: string
 *                 format: base64
 *                 description: Base64 encoded PDF file
 *               userId:
 *                 type: string
 *                 description: User ID (optional)
 *     responses:
 *       200:
 *         description: PDF saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "PDF saved successfully"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/digital-signature/documents/forward-doc:
 *   post:
 *     summary: Forward document
 *     description: Forward a document to additional signers
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documentId
 *               - Signers
 *             properties:
 *               documentId:
 *                 type: string
 *                 description: Document ID
 *               Signers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: User ID of the signer
 *                     objectId:
 *                       type: string
 *                       description: Contact book object ID
 *                     name:
 *                       type: string
 *                       description: Signer name
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: Signer email
 *                     mobile:
 *                       type: string
 *                       description: Signer mobile number
 *     responses:
 *       200:
 *         description: Document forwarded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Document forwarded successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/digital-signature/documents/update-document/{docId}:
 *   put:
 *     summary: Update document
 *     description: Update document details
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: docId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Document name
 *               description:
 *                 type: string
 *                 description: Document description
 *               note:
 *                 type: string
 *                 description: Document notes
 *     responses:
 *       200:
 *         description: Document updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Document updated successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/digital-signature/documents/decline-document:
 *   put:
 *     summary: Decline document
 *     description: Decline a document signature request
 *     tags: [Documents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documentId
 *               - userId
 *             properties:
 *               documentId:
 *                 type: string
 *                 description: Document ID
 *               userId:
 *                 type: string
 *                 description: User ID declining the document
 *               reason:
 *                 type: string
 *                 description: Reason for declining
 *     responses:
 *       200:
 *         description: Document declined successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Document declined successfully"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/digital-signature/documents/{id}:
 *   delete:
 *     summary: Delete document
 *     description: Delete a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Document deleted successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/digital-signature/sign/signatures:
 *   get:
 *     summary: Get signatures
 *     description: Retrieve user's signatures
 *     tags: [Signatures]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Signatures retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Signature'
 *                 message:
 *                   type: string
 *                   example: "Signatures retrieved successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/digital-signature/sign/signatures:
 *   post:
 *     summary: Store signature
 *     description: Store a new signature
 *     tags: [Signatures]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - signatureData
 *             properties:
 *               name:
 *                 type: string
 *                 description: Signature name
 *               signatureData:
 *                 type: string
 *                 format: base64
 *                 description: Base64 encoded signature data
 *     responses:
 *       200:
 *         description: Signature stored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Signature'
 *                 message:
 *                   type: string
 *                   example: "Signature stored successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/digital-signature/files/save:
 *   post:
 *     summary: Save file
 *     description: Upload and save a file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *     responses:
 *       200:
 *         description: File saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/File'
 *                 message:
 *                   type: string
 *                   example: "File saved successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/digital-signature/files/list:
 *   get:
 *     summary: Get file list
 *     description: Retrieve list of files for the authenticated user
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Files retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/File'
 *                 message:
 *                   type: string
 *                   example: "Files retrieved successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/digital-signature/drive/folders:
 *   post:
 *     summary: Create folder
 *     description: Create a new folder in the drive
 *     tags: [Drive]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Folder name
 *               parentId:
 *                 type: string
 *                 description: Parent folder ID (optional)
 *     responses:
 *       200:
 *         description: Folder created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DriveItem'
 *                 message:
 *                   type: string
 *                   example: "Folder created successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/digital-signature/drive/contents:
 *   get:
 *     summary: Get drive contents
 *     description: Retrieve contents of the drive
 *     tags: [Drive]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *         description: Parent folder ID (optional)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [file, folder, all]
 *         description: Filter by type
 *     responses:
 *       200:
 *         description: Drive contents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DriveItem'
 *                 message:
 *                   type: string
 *                   example: "Drive contents retrieved successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/digital-signature/drive/{id}/trash:
 *   patch:
 *     summary: Toggle trash status
 *     description: Move item to trash or restore from trash
 *     tags: [Drive]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isTrashed
 *             properties:
 *               isTrashed:
 *                 type: boolean
 *                 description: Whether to move to trash or restore
 *     responses:
 *       200:
 *         description: Item trash status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Item moved to trash successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/digital-signature/drive/{id}/star:
 *   patch:
 *     summary: Toggle star status
 *     description: Star or unstar an item
 *     tags: [Drive]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isStarred
 *             properties:
 *               isStarred:
 *                 type: boolean
 *                 description: Whether to star or unstar
 *     responses:
 *       200:
 *         description: Item star status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Item starred successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/digital-signature/drive/{id}/rename:
 *   patch:
 *     summary: Rename item
 *     description: Rename a file or folder
 *     tags: [Drive]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name for the item
 *     responses:
 *       200:
 *         description: Item renamed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Item renamed successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/digital-signature/contacts/list:
 *   get:
 *     summary: Get contacts list
 *     description: Retrieve list of contacts for the authenticated user
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contacts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Contact'
 *                 message:
 *                   type: string
 *                   example: "Contacts retrieved successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/digital-signature/contacts/add:
 *   post:
 *     summary: Add contact
 *     description: Add a new contact to the contact book
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 description: Contact name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Contact email
 *               mobile:
 *                 type: string
 *                 description: Contact mobile number
 *               company:
 *                 type: string
 *                 description: Contact company
 *               designation:
 *                 type: string
 *                 description: Contact designation
 *     responses:
 *       200:
 *         description: Contact added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *                 message:
 *                   type: string
 *                   example: "Contact added successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/digital-signature/contacts/details/{id}:
 *   get:
 *     summary: Get contact details
 *     description: Retrieve details of a specific contact
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact ID
 *     responses:
 *       200:
 *         description: Contact details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *                 message:
 *                   type: string
 *                   example: "Contact details retrieved successfully"
 *       404:
 *         description: Contact not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */ 