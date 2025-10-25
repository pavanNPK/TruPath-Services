# TruPath Services Authentication System

## Overview
This authentication system provides complete user management functionality including registration, login, forgot password, and reset password features with JWT-based authentication.

## Features
- ✅ User Registration with validation
- ✅ User Login with JWT tokens
- ✅ Forgot Password with email functionality
- ✅ Reset Password with secure tokens
- ✅ JWT Authentication middleware
- ✅ Rate limiting for security
- ✅ Email templates for all auth flows
- ✅ Input sanitization and validation
- ✅ Password strength requirements

## API Endpoints

### 1. User Registration
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "isEmailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. User Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "isEmailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token-here"
}
```

### 3. Forgot Password
**POST** `/auth/forgot-password`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset instructions sent to your email"
}
```

### 4. Reset Password
**POST** `/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "NewSecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### 5. Get User Profile
**GET** `/auth/profile`

**Headers:**
```
Authorization: Bearer jwt-token-here
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "isEmailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 6. Verify Token
**GET** `/auth/verify`

**Headers:**
```
Authorization: Bearer jwt-token-here
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "isEmailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Security Features

### Rate Limiting
- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **Password reset**: 3 requests per hour per IP
- **Contact form**: 10 requests per hour per IP

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

### JWT Configuration
- **Secret**: Set via `JWT_SECRET` environment variable
- **Expiry**: 24 hours (configurable via `JWT_EXPIRES_IN`)
- **Algorithm**: HS256

### Password Reset Tokens
- **Expiry**: 1 hour
- **Format**: Cryptographically secure random tokens
- **Storage**: Hashed tokens for security

## Environment Variables

Create a `.env` file in the server directory:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password

# Application Configuration
APP_PORT=3000
APP_HOST=https://api.trupathservices.com
FRONTEND_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

## Email Templates

The system includes beautiful HTML email templates for:
- Welcome email (registration)
- Password reset instructions
- Password reset confirmation

## Frontend Integration

### Login Flow
```javascript
const login = async (email, password) => {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.token);
    // Redirect to dashboard
  }
};
```

### Protected Routes
```javascript
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
};
```

### Forgot Password Flow
```javascript
const forgotPassword = async (email) => {
  const response = await fetch('/auth/forgot-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  
  const data = await response.json();
  // Show success message
};
```

## File Structure

```
server/
├── auth.js                    # Authentication logic
├── database.js               # MongoDB connection
├── emailTemplates.js         # Email templates
├── middleware.js             # Middleware functions
├── server.js                 # Main server file
├── models/
│   ├── User.js              # User model
│   └── PasswordResetToken.js # Password reset token model
├── package.json              # Dependencies
├── .env                      # Environment variables
├── test-auth.js              # Authentication tests
├── test-mongodb.js           # MongoDB integration tests
├── AUTHENTICATION.md         # This documentation
└── MONGODB_SETUP.md          # MongoDB setup guide
```

## Database Integration

**Current Implementation**: MongoDB with Mongoose ODM

**Features**:
- ✅ MongoDB connection with Mongoose
- ✅ User model with validation and indexes
- ✅ Password reset token model with TTL
- ✅ Account lockout protection
- ✅ Automatic token cleanup
- ✅ User statistics and admin endpoints
- ✅ Connection pooling and error handling

**Database Models**:
- **User**: Complete user management with roles, login attempts, and security features
- **PasswordResetToken**: Secure token management with automatic expiration

## Testing the API

### Using curl:

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"SecurePass123!"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123!"}'

# Forgot Password
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com"}'

# Reset Password
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"reset-token","password":"NewPass123!"}'

# Get Profile
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer jwt-token"
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created (registration)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials/token)
- `403` - Forbidden (invalid token)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Security Best Practices

1. **Environment Variables**: Never commit secrets to version control
2. **HTTPS**: Use HTTPS in production
3. **Rate Limiting**: Implemented to prevent brute force attacks
4. **Input Validation**: All inputs are sanitized and validated
5. **Password Hashing**: Uses bcrypt with salt rounds
6. **Token Security**: JWT tokens are signed and have expiration
7. **Email Security**: Reset tokens expire after 1 hour

## Next Steps

1. **Database Integration**: Replace in-memory storage with a real database
2. **Email Verification**: Add email verification for new accounts
3. **Two-Factor Authentication**: Implement 2FA for enhanced security
4. **Role-Based Access**: Add user roles and permissions
5. **Audit Logging**: Log authentication events for security monitoring
6. **Session Management**: Add logout and session invalidation
7. **Social Login**: Add OAuth integration (Google, Facebook, etc.)

## Support

For questions or issues with the authentication system, please contact the development team.
