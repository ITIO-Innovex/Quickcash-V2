# QuickCash API Documentation with Swagger

This project now includes comprehensive API documentation using Swagger/OpenAPI 3.0.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Set up environment variables:
Create a `.env` file in the backend directory with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

3. Start the server:
```bash
npm start
```

## 📚 API Documentation

### Accessing Swagger UI

Once the server is running, you can access the API documentation at:

**Development:**
```
http://localhost:5000/api-docs
```

**Production:**
```
https://your-production-domain.com/api-docs
```

### Features

The Swagger documentation includes:

- **Interactive API Explorer**: Test endpoints directly from the browser
- **Request/Response Examples**: See example requests and responses
- **Authentication**: JWT Bearer token authentication
- **Schema Definitions**: Complete data models for all entities
- **Error Handling**: Documented error responses
- **File Upload Support**: Documentation for multipart/form-data endpoints

### API Categories

The documentation is organized into the following categories:

1. **Authentication** - User registration, login, logout
2. **Users** - User management and profile operations
3. **Invoices** - Invoice creation and management
4. **Crypto** - Cryptocurrency trading and market data
5. **Digital Signature** - Digital signature endpoints
6. **Documents** - Document management endpoints
7. **Signatures** - Signature management endpoints
8. **Files** - File management endpoints
9. **Drive** - Drive management endpoints
10. **Contacts** - Contact book management endpoints
11. **KYC** - Know Your Customer verification
12. **Wallet** - Wallet balance and transaction management
13. **System** - Health checks and system endpoints

### Authentication

Most endpoints require JWT authentication. To use protected endpoints:

1. First, authenticate using the login endpoint
2. Copy the JWT token from the response
3. Click the "Authorize" button in Swagger UI
4. Enter the token in the format: `Bearer YOUR_JWT_TOKEN`
5. Click "Authorize"

### Example Usage

#### 1. User Registration
```bash
POST /api/v1/user/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "mobile": "+1234567890",
  "country": "US"
}
```

#### 2. User Login
```bash
POST /api/v1/user/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 3. Get User Profile (Authenticated)
```bash
GET /api/v1/user/get-user-details
Authorization: Bearer YOUR_JWT_TOKEN
```

#### 4. Update Profile with File Upload
```bash
PATCH /api/v1/user/update-profile
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

{
  "name": "John Updated",
  "mobile": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "country": "US",
  "ownerbrd": [file],
  "ownerProfile": [file]
}
```

## 🔐 Digital Signature APIs

The Digital Signature module provides comprehensive document signing capabilities with the following features:

### Document Management

#### Create Document
```bash
POST /api/v1/digital-signature/documents/after-save
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Contract Agreement",
  "description": "Business contract for services",
  "url": "https://example.com/document.pdf",
  "note": "Please review and sign",
  "SendinOrder": true,
  "Signers": [
    {
      "userId": "user123",
      "objectId": "contact456",
      "name": "John Doe",
      "email": "john@example.com",
      "mobile": "+1234567890"
    }
  ]
}
```

#### Get Document List
```bash
GET /api/v1/digital-signature/documents/list
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Document by ID
```bash
GET /api/v1/digital-signature/documents/{documentId}
```

#### Update Document
```bash
PUT /api/v1/digital-signature/documents/update-document/{docId}
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Updated Contract",
  "description": "Updated description",
  "note": "Updated notes"
}
```

#### Forward Document
```bash
POST /api/v1/digital-signature/documents/forward-doc
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "documentId": "doc123",
  "Signers": [
    {
      "userId": "user789",
      "objectId": "contact101",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "mobile": "+1234567890"
    }
  ]
}
```

#### Save Signed PDF
```bash
POST /api/v1/digital-signature/documents/save-pdf
Content-Type: application/json

{
  "documentId": "doc123",
  "pdfFile": "base64_encoded_pdf_content",
  "userId": "user123"
}
```

#### Decline Document
```bash
PUT /api/v1/digital-signature/documents/decline-document
Content-Type: application/json

{
  "documentId": "doc123",
  "userId": "user123",
  "reason": "Terms not acceptable"
}
```

#### Delete Document
```bash
DELETE /api/v1/digital-signature/documents/{id}
Authorization: Bearer YOUR_JWT_TOKEN
```

### Signature Management

#### Get Signatures
```bash
GET /api/v1/digital-signature/sign/signatures
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Store Signature
```bash
POST /api/v1/digital-signature/sign/signatures
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "My Signature",
  "signatureData": "base64_encoded_signature_data"
}
```

### File Management

#### Upload File
```bash
POST /api/v1/digital-signature/files/save
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

{
  "file": [file]
}
```

#### Get File List
```bash
GET /api/v1/digital-signature/files/list
Authorization: Bearer YOUR_JWT_TOKEN
```

### Drive Management

#### Create Folder
```bash
POST /api/v1/digital-signature/drive/folders
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "New Folder",
  "parentId": "parent_folder_id"
}
```

#### Get Drive Contents
```bash
GET /api/v1/digital-signature/drive/contents?parentId=folder123&type=all
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Toggle Trash Status
```bash
PATCH /api/v1/digital-signature/drive/{id}/trash
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "isTrashed": true
}
```

#### Toggle Star Status
```bash
PATCH /api/v1/digital-signature/drive/{id}/star
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "isStarred": true
}
```

#### Rename Item
```bash
PATCH /api/v1/digital-signature/drive/{id}/rename
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "New Name"
}
```

### Contact Management

#### Get Contacts
```bash
GET /api/v1/digital-signature/contacts/list
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Add Contact
```bash
POST /api/v1/digital-signature/contacts/add
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "+1234567890",
  "company": "ABC Corp",
  "designation": "Manager"
}
```

#### Get Contact Details
```bash
GET /api/v1/digital-signature/contacts/details/{id}
```

## 🔧 Configuration

### Swagger Configuration

The Swagger configuration is located in `src/config/swagger.js`. You can customize:

- API title and description
- Server URLs for different environments
- Security schemes
- Global schemas
- API file paths

### Adding New Endpoints

To add documentation for new endpoints:

1. Add JSDoc comments to your route files or controllers
2. Use the `@swagger` annotation
3. Define request/response schemas
4. Add proper tags for categorization

Example:
```javascript
/**
 * @swagger
 * /api/v1/example:
 *   get:
 *     summary: Example endpoint
 *     description: This is an example endpoint
 *     tags: [Example]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
```

## 🛠️ Development

### Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── swagger.js          # Swagger configuration
│   ├── docs/
│   │   └── api-docs.js         # API documentation
│   ├── routes/                 # Route definitions
│   │   └── DigitalSignature/   # Digital signature routes
│   ├── controllers/            # Route controllers
│   │   └── DigitalSignature/   # Digital signature controllers
│   └── server.js              # Main server file
├── package.json
└── README-SWAGGER.md
```

### Available Scripts

```bash
# Start development server
npm start

# Start with nodemon (auto-restart on changes)
npm run dev
```

## 🔒 Security

- All sensitive endpoints require JWT authentication
- File uploads are validated for type and size
- CORS is configured for cross-origin requests
- Helmet.js provides security headers
- Digital signature documents are secured with audit trails

## 📝 Notes

- The Swagger UI is only available in development mode by default
- For production, consider restricting access to the `/api-docs` endpoint
- All API responses follow a consistent format with `status`, `message`, and `data` fields
- File upload endpoints support multiple file types (images, documents, PDFs)
- Digital signature documents maintain complete audit trails for compliance

## 🤝 Contributing

When adding new endpoints:

1. Document them using Swagger annotations
2. Include proper request/response schemas
3. Add appropriate tags for categorization
4. Test the endpoints through Swagger UI
5. Update this README if necessary

## 📞 Support

For questions or issues with the API documentation:

- Check the Swagger UI for endpoint details
- Review the server logs for error information
- Contact the development team

---

**QuickCash API Documentation** - Powered by Swagger/OpenAPI 3.0 