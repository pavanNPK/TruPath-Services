import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from './models/User.js';
import PasswordResetToken from './models/PasswordResetToken.js';
import OTPToken from './models/OTPToken.js';

// JWT Secret - In production, use a strong secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES || '24h';

// Debug: Log environment variables on module load
console.log("🔧 AUTH MODULE LOADED - Environment Variables:");
console.log("🔑 JWT_SECRET:", JWT_SECRET ? "✅ Loaded" : "❌ Missing");
console.log("⏰ JWT_EXPIRES_IN:", JWT_EXPIRES_IN);

// Password reset token expiry (1 hour)
const RESET_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

// Validation functions
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password) => {
    // Password must be at least 8 characters, contain at least one uppercase, one lowercase, one number, and one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

export const validateName = (name) => {
    return name && name.trim().length >= 2 && name.trim().length <= 50;
};

// User registration
export const registerUser = async (userData) => {
    console.log("📝 REGISTER USER FUNCTION CALLED");
    console.log("📦 User data received:", {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        passwordLength: userData.password ? userData.password.length : 0
    });
    
    const { name, email, password, phone } = userData;

    // Validation
    console.log("🔍 Validating user data...");
    if (!validateName(name)) {
        console.log("❌ Name validation failed");
        throw new Error('Name must be between 2 and 50 characters');
    }
    console.log("✅ Name validation passed");

    if (!validateEmail(email)) {
        console.log("❌ Email validation failed");
        throw new Error('Please provide a valid email address');
    }
    console.log("✅ Email validation passed");

    if (!validatePassword(password)) {
        console.log("❌ Password validation failed");
        throw new Error('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }
    console.log("✅ Password validation passed");

    // Check if user already exists
    console.log("🔍 Checking if user already exists...");
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
        console.log("❌ User already exists with email:", email);
        throw new Error('User with this email already exists');
    }
    console.log("✅ No existing user found");

    // Create user (password will be hashed by User model pre-save hook)
    console.log("👤 Creating new user object...");
    const user = new User({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: password, // Password will be automatically hashed by User model
        phone: phone || null,
        isEmailVerified: false
    });
    console.log("✅ User object created");

    // Save user to database
    console.log("💾 Saving user to database...");
    await user.save();
    console.log("✅ User saved to database successfully");
    console.log("👤 Created user details:", {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        createdAt: user.createdAt
    });

    // Return user (password is automatically excluded by schema transform)
    return user;
};

// User login
export const loginUser = async (email, password) => {
    console.log("🔍 LOGIN USER FUNCTION CALLED");
    console.log("📧 Email:", email);
    console.log("🔒 Password length:", password ? password.length : 0);
    
    // Find user
    const user = await User.findOne({ email: email}).exec();
    console.log("🔍 User found:", !!user);
    if (user) {
        console.log("👤 User details:", {
            id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
            isActive: user.isActive,
            hasPassword: !!user.password
        });
    }
    
    if (!user) {
        console.log("❌ User not found for email:", email);
        throw new Error('Invalid email or password');
    }

    // Check password
    console.log("🔐 Checking password...");
    console.log("🔍 Stored password hash (first 20 chars):", user.password ? user.password.substring(0, 20) + "..." : "No password");
    console.log("🔍 Input password:", password);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("🔍 Password validation result:", isPasswordValid);
    if (!isPasswordValid) {
        console.log("❌ Password validation failed");
        throw new Error('Invalid email or password');
    }
    console.log("✅ Password validation successful");

    // Update last login
    console.log("📅 Updating last login timestamp");
    user.lastLogin = new Date();
    await user.save();
    console.log("✅ Last login updated");

    // Generate JWT token
    console.log("🔑 Generating JWT token...");
    console.log("🔑 JWT Secret:", JWT_SECRET);
    console.log("🔑 JWT Expires In:", JWT_EXPIRES_IN);
    const token = jwt.sign(
        { 
            userId: user._id, 
            email: user.email,
            name: user.name
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
    console.log("✅ JWT token generated successfully");

    console.log("🎉 Login successful - returning user and token");
    // Return user and token (password is automatically excluded by schema transform)
    return {
        user,
        token
    };
};

// Generate password reset token
export const generatePasswordResetToken = async (email) => {
    const user = await User.findByEmail(email);
    if (!user) {
        throw new Error('No user found with this email address');
    }

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Invalidate any existing tokens for this user
    await PasswordResetToken.invalidateUserTokens(user._id);

    // Create new token
    const tokenData = new PasswordResetToken({
        token: hashedToken,
        userId: user._id,
        email: user.email,
        expiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRY)
    });

    await tokenData.save();

    return {
        resetToken, // Return the unhashed token for email
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    };
};

// Reset password
export const resetPassword = async (token, newPassword) => {
    // Hash the provided token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid token
    const tokenData = await PasswordResetToken.findValidToken(hashedToken);
    if (!tokenData) {
        throw new Error('Invalid or expired reset token');
    }

    // Validate new password
    if (!validatePassword(newPassword)) {
        throw new Error('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    // Find user
    const user = await User.findById(tokenData.userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Update user password (will be automatically hashed by User model pre-save hook)
    user.password = newPassword;
    await user.save();

    // Mark token as used
    await tokenData.markAsUsed();

    // Return user (password is automatically excluded by schema transform)
    return user;
};

// Verify JWT token
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

// Get user by ID
export const getUserById = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    return user; // Password is automatically excluded by schema transform
};

// Get user by email
export const getUserByEmail = async (email) => {
    const user = await User.findByEmail(email);
    if (!user) {
        throw new Error('User not found');
    }
    return user; // Password is automatically excluded by schema transform
};

// Clean up expired tokens (call this periodically)
export const cleanupExpiredTokens = async () => {
    try {
        const result = await PasswordResetToken.cleanupExpired();
        console.log(`🧹 Cleaned up ${result.deletedCount} expired tokens`);
        return result;
    } catch (error) {
        console.error('❌ Error cleaning up expired tokens:', error);
    }
};

// Get all users (for admin purposes)
export const getAllUsers = async () => {
    return await User.find({}).select('-password');
};

// Get user statistics
export const getUserStats = async () => {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
    const recentUsers = await User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    return {
        totalUsers,
        activeUsers,
        verifiedUsers,
        recentUsers
    };
};

// Generate registration OTP
export const generateRegistrationOTP = async (userId, email, type) => {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Invalidate any existing OTPs for this user and specific type
    await OTPToken.updateMany(
        { userId, type, isUsed: false },
        { isUsed: true }
    );
    
    // Create new OTP token
    const otpToken = new OTPToken({
        token: otp,
        userId: userId,
        email: email,
        type: type,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });
    
    await otpToken.save();
    
    return otp;
};

// Verify OTP
export const verifyOTP = async (otp, userId, type) => {
    const otpToken = await OTPToken.findValidToken(otp);
    
    if (!otpToken) {
        throw new Error('Invalid or expired OTP');
    }
    
    if (otpToken.userId.toString() !== userId.toString()) {
        throw new Error('OTP does not match user');
    }
    
    if (otpToken.type !== type) {
        throw new Error('Invalid OTP type');
    }
    
    // Mark OTP as used
    await otpToken.markAsUsed();
    
    return true;
};

// Clean up expired OTPs
export const cleanupExpiredOTPs = async () => {
    try {
        const result = await OTPToken.cleanupExpired();
        console.log(`🧹 Cleaned up ${result.deletedCount} expired OTPs`);
        return result;
    } catch (error) {
        console.error('❌ Error cleaning up expired OTPs:', error);
    }
};
