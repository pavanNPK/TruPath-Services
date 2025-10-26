// Import config FIRST to load environment variables
import './config.js';

import express from "express";
import cors from "cors";
import helmet from "helmet";
import xss from "xss";
import bodyParser from 'body-parser';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import nodemailer from "nodemailer";

// Import database connection
import connectDB from './database.js';

// Import authentication modules
import { 
    registerUser, 
    loginUser, 
    generatePasswordResetToken, 
    resetPassword,
    verifyToken,
    getUserById,
    cleanupExpiredTokens,
    getAllUsers,
    getUserStats,
    generateRegistrationOTP,
    verifyOTP,
    cleanupExpiredOTPs
} from './auth.js';

// Import models
import OTPToken from './models/OTPToken.js';
import User from './models/User.js';
import Job from './models/Job.js';

import { 
    getPasswordResetEmailTemplate, 
    getPasswordResetSuccessEmailTemplate,
    getWelcomeEmailTemplate,
    getUserOTPEmailTemplate,
    getAdminOTPEmailTemplate
} from './emailTemplates.js';

import { 
    authLimiter, 
    passwordResetLimiter, 
    contactLimiter,
    authenticateToken,
    errorHandler,
    notFoundHandler,
    requestLogger
} from './middleware.js';

// dotenv.config() already called at the top of the file

const app = express();

// Middleware
app.use(requestLogger);
app.use(express.json());
app.use(express.static('public'));
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.quilljs.com"],
            scriptSrc: ["'self'", "https://cdn.quilljs.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Trust proxy configuration for accurate IP addresses
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
} else {
    app.set('trust proxy', 'loopback');
}

// Sanitize user input
function sanitizeInput(obj) {
    const sanitized = {};
    for (const key in obj) {
        sanitized[key] = xss(obj[key]);
    }
    return sanitized;
}

// Email template function
function getEmailTemplate(name, email, phone, message) {
    return `
        <div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; max-width: 640px; margin: 0 auto; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; background: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <div style="background: linear-gradient(135deg, #051C3B, #163560); padding: 28px 20px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 700;">TruPath Services</h1>
                <p style="color: #bcd0f0; font-size: 14px; margin: 6px 0 0;">Simplifying Medical Coding, Payment Integrity & CDI</p>
            </div>
            <div style="padding: 24px;">
                <p style="font-size: 16px; color: #111827; margin: 0 0 14px;"><strong>New Inquiry Received</strong></p>
                <p style="font-size: 15px; color: #444; margin: 0 0 18px;">A new contact form submission has been received.</p>
                <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
                    <tr><td style="padding: 8px 0; font-weight: 600; color: #051C3B; width: 28%;">Name</td><td style="padding: 8px 0;">${name}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: 600; color: #051C3B;">Email</td><td style="padding: 8px 0;">${email}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: 600; color: #051C3B;">Phone</td><td style="padding: 8px 0;">${phone || 'N/A'}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: 600; color: #051C3B; vertical-align: top;">Message</td><td style="padding: 8px 0; white-space: pre-wrap; color: #333;">${message}</td></tr>
                </table>
                <div style="border-top: 1px solid #e5e7eb; margin: 24px 0;"></div>
                <p style="font-size: 14px; color: #555; margin: 0;">Please review this inquiry and respond promptly.</p>
            </div>
            <div style="background-color: #f9fafb; text-align: center; padding: 18px; color: #6b7280; font-size: 13px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0;">Sent via <a href="https://trupathservices.com" style="color: #4ecdc4; text-decoration: none;">trupathservices.com</a></p>
                <p style="margin: 4px 0 0;">© ${new Date().getFullYear()} TruPath Services. All rights reserved.</p>
            </div>
        </div>
    `;
}

// Welcome page function
function getWelcomePage() {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to TruPath Services</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #051C3B 0%, #071f42 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                margin: 0;
                padding: 20px;
            }
            .welcome-container {
                text-align: center;
                max-width: 600px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 40px;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            h1 { font-size: 2.5rem; margin-bottom: 1rem; }
            p { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; }
            .status { 
                background: rgba(76, 175, 80, 0.2); 
                border: 1px solid #4CAF50; 
                border-radius: 10px; 
                padding: 15px; 
                margin: 20px 0; 
            }
        </style>
    </head>
    <body>
        <div class="welcome-container">
            <h1>🚀 TruPath Services API</h1>
            <p>Your authentication server is running successfully!</p>
            <div class="status">
                <h3>✅ Server Status: Online</h3>
                <p>Authentication endpoints are ready for use.</p>
            </div>
            <p>API Documentation available at <code>/auth/*</code> endpoints</p>
        </div>
    </body>
    </html>
    `;
}

// Initialize server
async function startServer() {
    try {
        // Connect to MongoDB
        await connectDB();

        // Clean up expired tokens every hour
        setInterval(cleanupExpiredTokens, 60 * 60 * 1000);
        // Clean up expired OTP tokens every 10 minutes
        setInterval(cleanupExpiredOTPs, 10 * 60 * 1000);

        // Nodemailer transporter setup
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        // Test email connection
        try {
            await transporter.verify();
            console.log("📧 Email server connection verified");
        } catch (error) {
            console.log("⚠️ Email server connection failed - continuing without email functionality");
        }

        // ==================== AUTHENTICATION ROUTES ====================

        // User Registration
        app.post("/auth/register", authLimiter, async (req, res) => {
            console.log("\n🔥🔥🔥 REGISTER API CALLED 🔥🔥🔥");
            console.log("🆔 Request ID:", req.requestId);
            console.log("📍 Client IP:", req.ip);
            console.log("⏰ Timestamp:", new Date().toISOString());
            console.log("📦 Full payload:", JSON.stringify(req.body, null, 2));
            console.log("🔗 Full URL:", req.protocol + '://' + req.get('host') + req.originalUrl);
            
            try {
                const { name, email, password, phone } = sanitizeInput(req.body);

                if (!name || !email || !password) {
                    console.log("❌ Registration failed: Missing required fields");
                    return res.status(400).json({
                        success: false,
                        message: 'Name, email, and password are required'
                    });
                }

                console.log("✅ Creating user account for:", email);
                const user = await registerUser({ name, email, password, phone });
                console.log("✅ User created with ID:", user._id);

                // Generate OTPs for user and admin
                console.log("🔐 Generating OTPs...");
                const userOTP = await generateRegistrationOTP(user._id, user.email, 'user');
                const adminOTP = await generateRegistrationOTP(user._id, user.email, 'admin');
                console.log("✅ OTPs generated successfully");
                console.log("🔑 User OTP:", userOTP);
                console.log("🔑 Admin OTP:", adminOTP);

                // Send user OTP email
                try {
                    await transporter.sendMail({
                        from: `"TruPath Services" <${process.env.MAIL_USER}>`,
                        to: user.email,
                        subject: "Registration Verification - TruPath Services",
                        html: getUserOTPEmailTemplate(user.name, userOTP)
                    });
                    console.log("📧 User OTP email sent to:", user.email);
                } catch (emailError) {
                    console.error("❌ Error sending user OTP email:", emailError);
                }

                // Send admin OTP email
                try {
                    await transporter.sendMail({
                        from: `"TruPath Services" <${process.env.MAIL_USER}>`,
                        to: 'trupathservices@gmail.com',
                        subject: "New User Registration - Admin Verification Required",
                        html: getAdminOTPEmailTemplate(user.name, user.email, adminOTP)
                    });
                    console.log("📧 Admin OTP email sent to trupathservices@gmail.com");
                } catch (emailError) {
                    console.error("❌ Error sending admin OTP email:", emailError);
                }

                console.log("📊 Response Status: 201 - Created");
                res.status(201).json({
                    success: true,
                    message: "Registration initiated. Please check your email for OTP verification.",
                    userId: user._id,
                    email: user.email
                });

            } catch (error) {
                console.error("❌ Registration error:", error);
                console.log("📊 Response Status: 400 - Bad Request");
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
        });

        // User Login
        app.post("/auth/login", authLimiter, async (req, res) => {
            console.log("\n🔥🔥🔥 LOGIN API CALLED 🔥🔥🔥");
            console.log("🆔 Request ID:", req.requestId);
            console.log("📍 Client IP:", req.ip);
            console.log("⏰ Timestamp:", new Date().toISOString());
            console.log("📧 Email:", req.body?.email || 'Not provided');
            console.log("🔒 Password provided:", !!req.body?.password);
            console.log("📦 Full payload:", JSON.stringify(req.body, null, 2));
            console.log("🔗 Full URL:", req.protocol + '://' + req.get('host') + req.originalUrl);
            
            let email = null;
            
            try {
                const { email, password } = sanitizeInput(req.body);

                if (!email || !password) {
                    console.log("❌ Login failed: Missing email or password");
                    return res.status(400).json({
                        success: false,
                        message: 'Email and password are required'
                    });
                }

                console.log("🔍 Attempting login for:", email);
                const result = await loginUser(email, password);
                console.log("✅ Login successful for user:", result.user.name);

                console.log("📊 Response Status: 200 - OK");
                res.json({
                    success: true,
                    message: 'Login successful',
                    user: result.user,
                    token: result.token
                });

            } catch (error) {
                console.error("❌ Login error:", error);
                console.log("❌ Login failed for email:", email || 'Unknown');
                console.log("📊 Response Status: 401 - Unauthorized");
                console.log("❌ Login failed response sent");
                res.status(401).json({
                    success: false,
                    message: error.message
                });
            }
        });

        // Token Verification
        app.get("/auth/verify", authenticateToken, async (req, res) => {
            console.log("\n🔥🔥🔥 VERIFY TOKEN API CALLED 🔥🔥🔥");
            console.log("🆔 Request ID:", req.requestId);
            console.log("📍 Client IP:", req.ip);
            console.log("⏰ Timestamp:", new Date().toISOString());
            console.log("👤 User ID:", req.user?.userId);
            console.log("📧 User Email:", req.user?.email);
            console.log("🔗 Full URL:", req.protocol + '://' + req.get('host') + req.originalUrl);
            
            try {
                // Get user details
                const user = await getUserById(req.user.userId);
                console.log("✅ User found:", user.name);
                
                console.log("📊 Response Status: 200 - OK");
                res.json({
                    success: true,
                    message: 'Token is valid',
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        isVerified: user.isVerified,
                        isActive: user.isActive
                    }
                });

            } catch (error) {
                console.error("❌ Token verification error:", error);
                console.log("📊 Response Status: 401 - Unauthorized");
                res.status(401).json({
                    success: false,
                    message: 'Invalid or expired token'
                });
            }
        });

        // OTP Verification
        app.post("/auth/verify-otp", authLimiter, async (req, res) => {
            console.log("\n🔥🔥🔥 VERIFY OTP API CALLED 🔥🔥🔥");
            console.log("🆔 Request ID:", req.requestId);
            console.log("📍 Client IP:", req.ip);
            console.log("⏰ Timestamp:", new Date().toISOString());
            console.log("📦 Full payload:", JSON.stringify(req.body, null, 2));
            console.log("🔗 Full URL:", req.protocol + '://' + req.get('host') + req.originalUrl);
            
            try {
                const { userOtp, adminOtp, userId } = sanitizeInput(req.body);

                if (!userOtp || !adminOtp || !userId) {
                    console.log("❌ OTP verification failed: Missing required fields");
                    console.log("📋 Received fields:", { userOtp: !!userOtp, adminOtp: !!adminOtp, userId: !!userId });
                    return res.status(400).json({
                        success: false,
                        message: 'userOtp, adminOtp, and userId are required'
                    });
                }

                console.log("🔍 Verifying user OTP for user:", userId);
                console.log("🔑 User OTP:", userOtp);
                await verifyOTP(userOtp, userId, 'user');
                console.log("✅ User OTP verification successful");

                console.log("🔍 Verifying admin OTP for user:", userId);
                console.log("🔑 Admin OTP:", adminOtp);
                await verifyOTP(adminOtp, userId, 'admin');
                console.log("✅ Admin OTP verification successful");

                // Update the user's verification status
                const user = await User.findById(userId);
                if (user) {
                    user.isVerified = true;
                    user.isActive = true;
                    user.verifiedAt = new Date();
                    await user.save();
                    console.log("✅ User verification status updated");
                    console.log("👤 User details:", {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        isVerified: user.isVerified,
                        verifiedAt: user.verifiedAt
                    });

                    // Send welcome email after successful verification
                    try {
                        await transporter.sendMail({
                            from: `"TruPath Services" <${process.env.MAIL_USER}>`,
                            to: user.email,
                            subject: "Welcome to TruPath Services - Account Verified",
                            html: getWelcomeEmailTemplate(user.name, user.email)
                        });
                        console.log("📧 Welcome email sent to:", user.email);
                    } catch (emailError) {
                        console.error("❌ Error sending welcome email:", emailError);
                    }
                }

                console.log("📊 Response Status: 200 - OK");
                res.json({
                    success: true,
                    message: 'OTP verification successful'
                });

            } catch (error) {
                console.error("❌ OTP verification error:", error);
                console.log("📊 Response Status: 400 - Bad Request");
                console.log("💬 Error message:", error.message);
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
        });

        // Forgot Password route
        app.post("/auth/forgot-password", passwordResetLimiter, async (req, res) => {
            console.log("\n🔥🔥🔥 FORGOT PASSWORD API CALLED 🔥🔥🔥");
            console.log("🆔 Request ID:", req.requestId);
            console.log("📍 Client IP:", req.ip);
            console.log("⏰ Timestamp:", new Date().toISOString());
            console.log("📧 Email:", req.body?.email || 'Not provided');
            console.log("📦 Full payload:", JSON.stringify(req.body, null, 2));
            console.log("🔗 Full URL:", req.protocol + '://' + req.get('host') + req.originalUrl);
            
            try {
                const { email } = sanitizeInput(req.body);

                if (!email) {
                    console.log("❌ Forgot password failed: Missing email");
                    return res.status(400).json({
                        success: false,
                        message: 'Email is required'
                    });
                }

                console.log("🔍 Generating password reset token for:", email);
                const result = await generatePasswordResetToken(email);
                console.log("✅ Password reset token generated successfully");

                // Send password reset email
                console.log("📧 Sending password reset email...");
                const resetUrl = `${process.env.APP_HOST || 'http://localhost:3000'}/admin/reset-password.html`;
                console.log("🔗 Reset URL:", resetUrl);
                
                await transporter.sendMail({
                    from: `"TruPath Services" <${process.env.MAIL_USER}>`,
                    to: email,
                    subject: "Password Reset Instructions",
                    html: getPasswordResetEmailTemplate(result.user.name, result.resetToken, resetUrl)
                });

                console.log("✅ Password reset email sent successfully");
                console.log("📊 Response Status: 200 - OK");
                res.json({
                    success: true,
                    message: 'Password reset instructions sent to your email'
                });

            } catch (error) {
                console.error("❌ Forgot password error:", error);
                console.log("📊 Response Status: 400 - Bad Request");
                console.log("💬 Error message:", error.message);
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
        });

        // Resend OTP route
        app.post("/auth/resend-otp", authLimiter, async (req, res) => {
            console.log("\n🔥🔥🔥 RESEND OTP API CALLED 🔥🔥🔥");
            console.log("🆔 Request ID:", req.requestId);
            console.log("📍 Client IP:", req.ip);
            console.log("⏰ Timestamp:", new Date().toISOString());
            console.log("📦 Full payload:", JSON.stringify(req.body, null, 2));
            console.log("🔗 Full URL:", req.protocol + '://' + req.get('host') + req.originalUrl);
            
            try {
                const { userId } = sanitizeInput(req.body);

                if (!userId) {
                    console.log("❌ Resend OTP failed: Missing userId");
                    return res.status(400).json({
                        success: false,
                        message: 'User ID is required'
                    });
                }

                // Find the user
                const user = await User.findById(userId);
                if (!user) {
                    console.log("❌ Resend OTP failed: User not found");
                    return res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                }

                console.log("🔍 Resending OTPs for user:", user.email);

                // Generate new OTPs for user and admin
                console.log("🔐 Generating new OTPs...");
                const userOTP = await generateRegistrationOTP(user._id, user.email, 'user');
                const adminOTP = await generateRegistrationOTP(user._id, user.email, 'admin');
                console.log("✅ New OTPs generated successfully");
                console.log("🔑 User OTP:", userOTP);
                console.log("🔑 Admin OTP:", adminOTP);

                // Send user OTP email
                try {
                    await transporter.sendMail({
                        from: `"TruPath Services" <${process.env.MAIL_USER}>`,
                        to: user.email,
                        subject: "Registration Verification - New OTP - TruPath Services",
                        html: getUserOTPEmailTemplate(user.name, userOTP)
                    });
                    console.log("📧 User OTP email resent to:", user.email);
                } catch (emailError) {
                    console.error("❌ Error sending user OTP email:", emailError);
                }

                // Send admin OTP email
                try {
                    await transporter.sendMail({
                        from: `"TruPath Services" <${process.env.MAIL_USER}>`,
                        to: 'trupathservices@gmail.com',
                        subject: "New User Registration - Admin Verification Required (Resent)",
                        html: getAdminOTPEmailTemplate(user.name, user.email, adminOTP)
                    });
                    console.log("📧 Admin OTP email resent to trupathservices@gmail.com");
                } catch (emailError) {
                    console.error("❌ Error sending admin OTP email:", emailError);
                }

                console.log("📊 Response Status: 200 - OK");
                res.json({
                    success: true,
                    message: "OTPs have been resent to your email and admin email"
                });

            } catch (error) {
                console.error("❌ Resend OTP error:", error);
                console.log("📊 Response Status: 400 - Bad Request");
                console.log("💬 Error message:", error.message);
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
        });

        // Reset Password route
        app.post("/auth/reset-password", passwordResetLimiter, async (req, res) => {
            console.log("\n🔥🔥🔥 RESET PASSWORD API CALLED 🔥🔥🔥");
            console.log("🆔 Request ID:", req.requestId);
            console.log("📍 Client IP:", req.ip);
            console.log("⏰ Timestamp:", new Date().toISOString());
            console.log("🔑 Token provided:", !!req.body?.token);
            console.log("🔒 Password provided:", !!req.body?.password);
            console.log("📦 Full payload:", JSON.stringify(req.body, null, 2));
            console.log("🔗 Full URL:", req.protocol + '://' + req.get('host') + req.originalUrl);
            
            try {
                const { token, password } = sanitizeInput(req.body);

                if (!token || !password) {
                    console.log("❌ Reset password failed: Missing token or password");
                    return res.status(400).json({
                        success: false,
                        message: 'Token and password are required'
                    });
                }

                console.log("🔍 Resetting password with token...");
                const user = await resetPassword(token, password);
                console.log("✅ Password reset successful for user:", user.name);

                // Send password reset success email
                console.log("📧 Sending password reset success email...");
                await transporter.sendMail({
                    from: `"TruPath Services" <${process.env.MAIL_USER}>`,
                    to: user.email,
                    subject: "Password Reset Successful",
                    html: getPasswordResetSuccessEmailTemplate(user.name)
                });

                console.log("✅ Password reset success email sent");
                console.log("📊 Response Status: 200 - OK");
                res.json({
                    success: true,
                    message: 'Password reset successfully'
                });

            } catch (error) {
                console.error("❌ Reset password error:", error);
                console.log("📊 Response Status: 400 - Bad Request");
                console.log("💬 Error message:", error.message);
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
        });

        // Contact form route
        app.post("/contact", contactLimiter, async (req, res) => {
            console.log("\n🔥🔥🔥 CONTACT FORM API CALLED 🔥🔥🔥");
            console.log("🆔 Request ID:", req.requestId);
            console.log("📍 Client IP:", req.ip);
            console.log("⏰ Timestamp:", new Date().toISOString());
            console.log("📦 Full payload:", JSON.stringify(req.body, null, 2));
            console.log("🔗 Full URL:", req.protocol + '://' + req.get('host') + req.originalUrl);
            
            const { name, email, message, phone } = sanitizeInput(req.body);

            try {
                console.log("📧 Sending contact form email...");
                await transporter.sendMail({
                    from: `"TruPath Services Contact Form" <${process.env.MAIL_USER}>`,
                    to: process.env.MAIL_USER,
                    replyTo: `${name} <${email}>`,
                    subject: "New Contact Form Submission",
                    html: getEmailTemplate(name, email, phone, message)
                });

                console.log("✅ Contact form email sent successfully");
                console.log("📊 Response Status: 200 - OK");
                res.send("Thank you! Your message has been sent.");
            } catch (error) {
                console.error("❌ Error sending email:", error);
                console.log("📊 Response Status: 500 - Internal Server Error");
                res.status(500).send("Something went wrong. Please try again later.");
            }
        });

        // Test endpoint for logging verification
        app.get('/test-logging', (req, res) => {
            console.log('\n🔥🔥🔥 TEST LOGGING ENDPOINT CALLED 🔥🔥🔥');
            console.log('🆔 Request ID:', req.requestId);
            console.log('📍 Client IP:', req.ip);
            console.log('⏰ Timestamp:', new Date().toISOString());
            console.log('🔗 Full URL:', req.protocol + '://' + req.get('host') + req.originalUrl);
            console.log('📱 User-Agent:', req.get('User-Agent'));
            console.log('📍 This should show detailed logging information');
            
            res.json({
                success: true,
                message: 'Logging test successful - check your console for detailed logs',
                timestamp: new Date().toISOString(),
                clientIP: req.ip,
                userAgent: req.get('User-Agent'),
                requestId: req.requestId
            });
        });

        // Token Verification endpoint
        app.get("/auth/verify", authenticateToken, async (req, res) => {
            try {
                console.log('\n🔐 TOKEN VERIFICATION API CALLED 🔐');
                console.log('🆔 Request ID:', req.requestId);
                console.log('📍 Client IP:', req.ip);
                console.log('👤 User ID:', req.user?.id);
                console.log('⏰ Timestamp:', new Date().toISOString());

                // If we reach here, the token is valid (authenticateToken middleware passed)
                res.json({
                    success: true,
                    message: 'Token is valid',
                    user: {
                        id: req.user.id,
                        email: req.user.email,
                        name: req.user.name
                    }
                });
            } catch (error) {
                console.error('❌ Token verification error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Token verification failed'
                });
            }
        });

        // Logout endpoint
        app.post("/auth/logout", authenticateToken, async (req, res) => {
            try {
                console.log('\n🚪 LOGOUT API CALLED 🚪');
                console.log('🆔 Request ID:', req.requestId);
                console.log('📍 Client IP:', req.ip);
                console.log('👤 User ID:', req.user?.id);
                console.log('⏰ Timestamp:', new Date().toISOString());

                // In a real application, you might want to blacklist the token
                // For now, we'll just return success as the client will remove the token
                res.json({
                    success: true,
                    message: 'Logged out successfully'
                });
            } catch (error) {
                console.error('❌ Logout error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Logout failed'
                });
            }
        });

        // ==================== JOB MANAGEMENT ROUTES ====================

        // Get all jobs with search
        app.get('/api/jobs', async (req, res) => {
            console.log('\n🔥🔥🔥 GET JOBS API CALLED 🔥🔥🔥');
            console.log('🆔 Request ID:', req.requestId);
            console.log('📍 Client IP:', req.ip);
            console.log('⏰ Timestamp:', new Date().toISOString());
            console.log('📦 Query params:', JSON.stringify(req.query, null, 2));
            console.log('🔗 Full URL:', req.protocol + '://' + req.get('host') + req.originalUrl);
            
            try {
                const { search, page = 1, limit = 10 } = req.query;
                
                const searchTerm = search ? search.trim() : '';
                
                const jobs = await Job.searchJobs(searchTerm)
                    .populate('postedBy', 'name email')
                    .limit(limit * 1)
                    .skip((page - 1) * limit);
                
                // Use the same search logic for counting
                let countQuery = {};
                if (searchTerm) {
                    countQuery = {
                        $or: [
                            { title: { $regex: searchTerm, $options: 'i' } },
                            { description: { $regex: searchTerm, $options: 'i' } },
                            { location: { $regex: searchTerm, $options: 'i' } },
                            { experience: { $regex: searchTerm, $options: 'i' } },
                            { salary: { $regex: searchTerm, $options: 'i' } }
                        ]
                    };
                }
                
                const totalJobs = await Job.countDocuments(countQuery);
                
                console.log(`✅ Found ${jobs.length} jobs out of ${totalJobs} total`);
                console.log('📊 Response Status: 200 - OK');
                
                res.json({
                    success: true,
                    data: jobs,
                    pagination: {
                        current: parseInt(page),
                        pages: Math.ceil(totalJobs / limit),
                        total: totalJobs,
                        limit: parseInt(limit)
                    }
                });
                
            } catch (error) {
                console.error('❌ Get jobs error:', error);
                console.log('📊 Response Status: 500 - Internal Server Error');
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch jobs'
                });
            }
        });

        // Get single job by ID
        app.get('/api/jobs/:id', async (req, res) => {
            console.log('\n🔥🔥🔥 GET JOB BY ID API CALLED 🔥🔥🔥');
            console.log('🆔 Request ID:', req.requestId);
            console.log('📍 Client IP:', req.ip);
            console.log('⏰ Timestamp:', new Date().toISOString());
            console.log('🆔 Job ID:', req.params.id);
            console.log('🔗 Full URL:', req.protocol + '://' + req.get('host') + req.originalUrl);
            
            try {
                const job = await Job.findById(req.params.id)
                    .populate('postedBy', 'name email');
                
                if (!job) {
                    console.log('❌ Job not found');
                    console.log('📊 Response Status: 404 - Not Found');
                    return res.status(404).json({
                        success: false,
                        message: 'Job not found'
                    });
                }
                
                console.log('✅ Job found');
                console.log('📊 Response Status: 200 - OK');
                
                res.json({
                    success: true,
                    data: job
                });
                
            } catch (error) {
                console.error('❌ Get job by ID error:', error);
                console.log('📊 Response Status: 500 - Internal Server Error');
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch job'
                });
            }
        });

        // Create new job (Admin only)
        app.post('/api/jobs', authenticateToken, async (req, res) => {
            console.log('\n🔥🔥🔥 CREATE JOB API CALLED 🔥🔥🔥');
            console.log('🆔 Request ID:', req.requestId);
            console.log('📍 Client IP:', req.ip);
            console.log('⏰ Timestamp:', new Date().toISOString());
            console.log('👤 User ID:', req.user?.userId);
            console.log('📦 Full payload:', JSON.stringify(req.body, null, 2));
            console.log('🔗 Full URL:', req.protocol + '://' + req.get('host') + req.originalUrl);
            
            try {
                const { title, description, location, experience, salary } = sanitizeInput(req.body);
                
                if (!title || !description || !location || !experience || !salary) {
                    console.log('❌ Create job failed: Missing required fields');
                    console.log('📊 Response Status: 400 - Bad Request');
                    return res.status(400).json({
                        success: false,
                        message: 'All required fields must be provided'
                    });
                }
                
                const jobData = {
                    title,
                    description,
                    location,
                    experience,
                    salary,
                    postedBy: req.user.userId
                };
                
                const job = new Job(jobData);
                await job.save();
                
                const populatedJob = await Job.findById(job._id).populate('postedBy', 'name email');
                
                console.log('✅ Job created successfully with ID:', job._id);
                console.log('📊 Response Status: 201 - Created');
                
                res.status(201).json({
                    success: true,
                    message: 'Job created successfully',
                    data: populatedJob
                });
                
            } catch (error) {
                console.error('❌ Create job error:', error);
                console.log('📊 Response Status: 400 - Bad Request');
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to create job'
                });
            }
        });

        // Update job (Admin only)
        app.put('/api/jobs/:id', authenticateToken, async (req, res) => {
            console.log('\n🔥🔥🔥 UPDATE JOB API CALLED 🔥🔥🔥');
            console.log('🆔 Request ID:', req.requestId);
            console.log('📍 Client IP:', req.ip);
            console.log('⏰ Timestamp:', new Date().toISOString());
            console.log('👤 User ID:', req.user?.userId);
            console.log('🆔 Job ID:', req.params.id);
            console.log('📦 Full payload:', JSON.stringify(req.body, null, 2));
            console.log('🔗 Full URL:', req.protocol + '://' + req.get('host') + req.originalUrl);
            
            try {
                const { title, description, location, experience, salary } = sanitizeInput(req.body);
                
                const job = await Job.findById(req.params.id);
                
                if (!job) {
                    console.log('❌ Job not found');
                    console.log('📊 Response Status: 404 - Not Found');
                    return res.status(404).json({
                        success: false,
                        message: 'Job not found'
                    });
                }
                
                // Update fields if provided
                if (title) job.title = title;
                if (description) job.description = description;
                if (location) job.location = location;
                if (experience) job.experience = experience;
                if (salary) job.salary = salary;
                
                await job.save();
                
                const updatedJob = await Job.findById(job._id).populate('postedBy', 'name email');
                
                console.log('✅ Job updated successfully');
                console.log('📊 Response Status: 200 - OK');
                
                res.json({
                    success: true,
                    message: 'Job updated successfully',
                    data: updatedJob
                });
                
            } catch (error) {
                console.error('❌ Update job error:', error);
                console.log('📊 Response Status: 400 - Bad Request');
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to update job'
                });
            }
        });

        // Delete job (Admin only)
        app.delete('/api/jobs/:id', authenticateToken, async (req, res) => {
            console.log('\n🔥🔥🔥 DELETE JOB API CALLED 🔥🔥🔥');
            console.log('🆔 Request ID:', req.requestId);
            console.log('📍 Client IP:', req.ip);
            console.log('⏰ Timestamp:', new Date().toISOString());
            console.log('👤 User ID:', req.user?.userId);
            console.log('🆔 Job ID:', req.params.id);
            console.log('🔗 Full URL:', req.protocol + '://' + req.get('host') + req.originalUrl);
            
            try {
                const job = await Job.findById(req.params.id);
                
                if (!job) {
                    console.log('❌ Job not found');
                    console.log('📊 Response Status: 404 - Not Found');
                    return res.status(404).json({
                        success: false,
                        message: 'Job not found'
                    });
                }
                
                // Hard delete - remove from database
                await Job.findByIdAndDelete(req.params.id);
                
                console.log('✅ Job deleted successfully');
                console.log('📊 Response Status: 200 - OK');
                
                res.json({
                    success: true,
                    message: 'Job deleted successfully'
                });
                
            } catch (error) {
                console.error('❌ Delete job error:', error);
                console.log('📊 Response Status: 500 - Internal Server Error');
                res.status(500).json({
                    success: false,
                    message: 'Failed to delete job'
                });
            }
        });

        // Get job statistics (Admin only)
        app.get('/api/jobs/stats', authenticateToken, async (req, res) => {
            console.log('\n🔥🔥🔥 GET JOB STATS API CALLED 🔥🔥🔥');
            console.log('🆔 Request ID:', req.requestId);
            console.log('📍 Client IP:', req.ip);
            console.log('⏰ Timestamp:', new Date().toISOString());
            console.log('👤 User ID:', req.user?.userId);
            console.log('🔗 Full URL:', req.protocol + '://' + req.get('host') + req.originalUrl);
            
            try {
                const stats = await Job.getJobStats();
                
                console.log('✅ Job statistics retrieved successfully');
                console.log('📊 Response Status: 200 - OK');
                
                res.json({
                    success: true,
                    data: {
                        totalJobs: stats[0]?.totalJobs || 0
                    }
                });
                
            } catch (error) {
                console.error('❌ Get job stats error:', error);
                console.log('📊 Response Status: 500 - Internal Server Error');
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch job statistics'
                });
            }
        });

        // API Monitoring endpoint
        app.get('/api/monitor', (req, res) => {
            console.log('\n🔥🔥🔥 API MONITOR ENDPOINT CALLED 🔥🔥🔥');
            console.log('🆔 Request ID:', req.requestId);
            console.log('📍 Client IP:', req.ip);
            console.log('⏰ Timestamp:', new Date().toISOString());
            
            res.json({
                success: true,
                message: 'API Monitoring Active',
                timestamp: new Date().toISOString(),
                server: {
                    status: 'online',
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    version: process.version
                },
                endpoints: {
                    auth: {
                        register: 'POST /auth/register',
                        login: 'POST /auth/login',
                        verify: 'GET /auth/verify',
                        verifyOtp: 'POST /auth/verify-otp'
                    },
                    jobs: {
                        getAll: 'GET /api/jobs',
                        getById: 'GET /api/jobs/:id',
                        create: 'POST /api/jobs',
                        update: 'PUT /api/jobs/:id',
                        delete: 'DELETE /api/jobs/:id',
                        stats: 'GET /api/jobs/stats'
                    },
                    contact: 'POST /contact',
                    test: 'GET /test-logging',
                    monitor: 'GET /api/monitor'
                },
                requestId: req.requestId,
                clientIP: req.ip
            });
        });

        // Default route with styled HTML response
        app.get('/welcome', (req, res) => {
            res.send(getWelcomePage());
        });

        // Error handling middleware (must be last)
        app.use(notFoundHandler);
        app.use(errorHandler);

        // Start server
        const port = process.env.APP_PORT || 3000;
        const host = process.env.APP_HOST || 'http://localhost:3000';

        app.listen(port, () => {
            console.log('\n' + '🔥'.repeat(60));
            console.log('🚀 TRUPATH SERVICES API SERVER STARTED');
            console.log('🔥'.repeat(60));
            console.log(`🌐 Server running at ${host}/welcome`);
            console.log(`🔐 Authentication endpoints available at ${host}/auth/*`);
            console.log(`👑 Admin endpoints available at ${host}/admin/*`);
            console.log(`📧 Email functionality configured`);
            console.log(`🍃 MongoDB connection established`);
            console.log(`📊 API Monitor available at ${host}/api/monitor`);
            console.log(`🧪 Test logging available at ${host}/test-logging`);
            console.log('\n🔥 ENHANCED LOGGING ACTIVE 🔥');
            console.log('📝 All API calls will be logged with:');
            console.log('   • Request ID for tracking');
            console.log('   • Client IP addresses');
            console.log('   • Full payloads (passwords hidden)');
            console.log('   • Response times and status codes');
            console.log('   • Detailed error information');
            console.log('🔥'.repeat(5) + '\n');
        });
    } catch (error) {
        console.error('❌ Server startup failed:', error);
        process.exit(1);
    }
}

// Start the server
startServer();
