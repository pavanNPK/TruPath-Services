# MongoDB Setup Guide for TruPath Services

## Overview
This guide will help you set up MongoDB for your TruPath Services authentication system. You can choose between local MongoDB installation or MongoDB Atlas (cloud).

## Option 1: Local MongoDB Installation

### 1. Install MongoDB Community Edition

#### macOS (using Homebrew)
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community
```

#### Ubuntu/Debian
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Windows
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. MongoDB will start automatically as a Windows service

### 2. Verify Installation
```bash
# Check if MongoDB is running
mongosh --version

# Connect to MongoDB
mongosh
```

### 3. Create Database and User (Optional)
```javascript
// In mongosh
use trupath_auth
db.createUser({
  user: "trupath_user",
  pwd: "your_secure_password",
  roles: ["readWrite"]
})
```

## Option 2: MongoDB Atlas (Cloud)

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (choose the free M0 tier)

### 2. Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Create a user with read/write permissions
4. Note down the username and password

### 3. Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Add your current IP address or use `0.0.0.0/0` for development (not recommended for production)

### 4. Get Connection String
1. Go to "Clusters" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string

## Environment Configuration

### 1. Create .env File
Copy the `env.example` file to `.env` and update with your MongoDB connection:

```bash
cp env.example .env
```

### 2. Update .env File

#### For Local MongoDB:
```env
MONGODB_URI=mongodb://localhost:27017/trupath_auth
```

#### For MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/trupath_auth
```

#### For Local MongoDB with Authentication:
```env
MONGODB_URI=mongodb://trupath_user:your_secure_password@localhost:27017/trupath_auth
```

## Testing the Connection

### 1. Start Your Server
```bash
cd server
npm start
```

You should see:
```
🍃 MongoDB Connected: localhost
📊 Database: trupath_auth
🚀 Server running at http://localhost:3000/welcome
```

### 2. Test Authentication Endpoints
```bash
# Register a user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"TestPass123!"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'
```

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  isEmailVerified: Boolean,
  isActive: Boolean,
  role: String (enum: ['user', 'admin', 'moderator']),
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### PasswordResetTokens Collection
```javascript
{
  _id: ObjectId,
  token: String (hashed, unique),
  userId: ObjectId (ref: User),
  email: String,
  expiresAt: Date (TTL index),
  used: Boolean,
  usedAt: Date,
  ipAddress: String,
  userAgent: String,
  createdAt: Date,
  updatedAt: Date
}
```

## MongoDB Compass (GUI Tool)

### 1. Install MongoDB Compass
Download from [MongoDB Compass](https://www.mongodb.com/products/compass)

### 2. Connect to Your Database
- **Local**: `mongodb://localhost:27017`
- **Atlas**: Use your connection string from Atlas

### 3. Explore Your Data
- View collections: `users`, `passwordresettokens`
- Query documents
- Monitor performance

## Production Considerations

### 1. Security
- Use strong passwords
- Enable authentication
- Use SSL/TLS connections
- Restrict network access
- Regular security updates

### 2. Performance
- Create appropriate indexes
- Monitor query performance
- Use connection pooling
- Regular maintenance

### 3. Backup
- Set up regular backups
- Test restore procedures
- Monitor backup integrity

## Troubleshooting

### Common Issues

#### Connection Refused
```bash
# Check if MongoDB is running
brew services list | grep mongodb  # macOS
sudo systemctl status mongod      # Linux
```

#### Authentication Failed
- Verify username/password
- Check user roles and permissions
- Ensure database exists

#### Network Issues (Atlas)
- Check IP whitelist
- Verify connection string
- Check firewall settings

### Debug Mode
Add to your `.env` file:
```env
DEBUG=mongoose:*
```

## Monitoring

### 1. MongoDB Atlas Monitoring
- Built-in monitoring dashboard
- Performance metrics
- Alert configurations

### 2. Local MongoDB Monitoring
```bash
# Check MongoDB status
mongosh --eval "db.serverStatus()"

# Check database stats
mongosh --eval "db.stats()"
```

## Next Steps

1. **Set up indexes** for better performance
2. **Configure backups** for data safety
3. **Set up monitoring** for production
4. **Implement data validation** rules
5. **Add database migrations** for schema changes

## Support

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

For TruPath Services specific issues, contact the development team.
