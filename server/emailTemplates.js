// Email templates for authentication system

export const getPasswordResetEmailTemplate = (name, resetToken, resetUrl) => {
    return `
        <div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; max-width: 640px; margin: 0 auto; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; background: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <!-- Header with Subtle Gradient -->
            <div style="background: linear-gradient(135deg, #051C3B, #163560); padding: 28px 20px; text-align: center; animation: fadeInHeader 1.5s ease forwards;">
                <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">TruPath Services</h1>
                <p style="color: #bcd0f0; font-size: 14px; margin: 6px 0 0;">Password Reset Request</p>
            </div>

            <!-- Body Section -->
            <div style="padding: 24px; animation: fadeInBody 1.8s ease;">
                <p style="font-size: 16px; color: #111827; margin: 0 0 14px;">
                    <strong>Hello ${name},</strong>
                </p>
                <p style="font-size: 15px; color: #444; margin: 0 0 18px;">
                    We received a request to reset your password for your TruPath Services account. If you made this request, click the button below to reset your password:
                </p>

                <!-- Reset Button -->
                <div style="text-align: center; margin: 24px 0;">
                    <a href="${resetUrl}?token=${resetToken}" 
                       style="background: linear-gradient(45deg, #4ecdc4, #45b7d1); 
                              color: #051C3B; 
                              text-decoration: none; 
                              padding: 14px 32px; 
                              border-radius: 30px; 
                              font-weight: 700; 
                              font-size: 16px; 
                              display: inline-block; 
                              box-shadow: 0 5px 15px rgba(78, 205, 196, 0.3);
                              transition: all 0.3s ease;">
                        Reset My Password
                    </a>
                </div>

                <div style="border-top: 1px solid #e5e7eb; margin: 24px 0; animation: fadeInDivider 2s ease;"></div>

                <!-- Security Information -->
                <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #4ecdc4;">
                    <h3 style="color: #051C3B; margin: 0 0 8px; font-size: 14px;">Security Information:</h3>
                    <ul style="color: #555; font-size: 14px; margin: 0; padding-left: 20px;">
                        <li>This link will expire in 1 hour for security reasons</li>
                        <li>If you didn't request this reset, please ignore this email</li>
                        <li>Your password will remain unchanged until you create a new one</li>
                    </ul>
                </div>

                <!-- Alternative Method -->
                <div style="margin-top: 20px; padding: 16px; background: #f9fafb; border-radius: 8px;">
                    <p style="font-size: 14px; color: #555; margin: 0 0 8px;">
                        <strong>Alternative Method:</strong> If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    <p style="font-size: 13px; color: #4ecdc4; word-break: break-all; margin: 0; font-family: monospace;">
                        ${resetUrl}?token=${resetToken}
                    </p>
                </div>

                <p style="font-size: 14px; color: #555; margin: 20px 0 0;">
                    If you have any questions or concerns, please contact our support team.
                </p>
            </div>

            <!-- Animated Footer -->
            <div style="background-color: #f9fafb; text-align: center; padding: 18px; color: #6b7280; font-size: 13px; border-top: 1px solid #e5e7eb; animation: fadeInFooter 2.2s ease;">
                <p style="margin: 0;">
                    Sent via <a href="https://trupathservices.com" style="color: #4ecdc4; text-decoration: none;">trupathservices.com</a>
                </p>
                <p style="margin: 4px 0 0;">© ${new Date().getFullYear()} TruPath Services. All rights reserved.</p>
            </div>

            <!-- Embedded Keyframe Animations -->
            <style>
                @keyframes fadeInHeader { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeInBody { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeInDivider { from { width: 0; opacity: 0; } to { width: 100%; opacity: 1; } }
                @keyframes fadeInFooter { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            </style>
        </div>
    `;
};

export const getPasswordResetSuccessEmailTemplate = (name) => {
    return `
        <div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; max-width: 640px; margin: 0 auto; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; background: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <!-- Header with Success Gradient -->
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 28px 20px; text-align: center; animation: fadeInHeader 1.5s ease forwards;">
                <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">TruPath Services</h1>
                <p style="color: #d1fae5; font-size: 14px; margin: 6px 0 0;">Password Successfully Reset</p>
            </div>

            <!-- Body Section -->
            <div style="padding: 24px; animation: fadeInBody 1.8s ease;">
                <p style="font-size: 16px; color: #111827; margin: 0 0 14px;">
                    <strong>Hello ${name},</strong>
                </p>
                <p style="font-size: 15px; color: #444; margin: 0 0 18px;">
                    Your password has been successfully reset for your TruPath Services account. You can now log in with your new password.
                </p>

                <!-- Success Icon -->
                <div style="text-align: center; margin: 24px 0;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(45deg, #10b981, #059669); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3);">
                        <span style="color: white; font-size: 24px;">✓</span>
                    </div>
                </div>

                <div style="border-top: 1px solid #e5e7eb; margin: 24px 0; animation: fadeInDivider 2s ease;"></div>

                <!-- Security Information -->
                <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; border-left: 4px solid #10b981;">
                    <h3 style="color: #065f46; margin: 0 0 8px; font-size: 14px;">Security Reminder:</h3>
                    <ul style="color: #555; font-size: 14px; margin: 0; padding-left: 20px;">
                        <li>Your account is now secure with your new password</li>
                        <li>If you didn't make this change, please contact support immediately</li>
                        <li>Consider enabling two-factor authentication for added security</li>
                    </ul>
                </div>

                <p style="font-size: 14px; color: #555; margin: 20px 0 0;">
                    If you have any questions or concerns, please contact our support team.
                </p>
            </div>

            <!-- Animated Footer -->
            <div style="background-color: #f9fafb; text-align: center; padding: 18px; color: #6b7280; font-size: 13px; border-top: 1px solid #e5e7eb; animation: fadeInFooter 2.2s ease;">
                <p style="margin: 0;">
                    Sent via <a href="https://trupathservices.com" style="color: #4ecdc4; text-decoration: none;">trupathservices.com</a>
                </p>
                <p style="margin: 4px 0 0;">© ${new Date().getFullYear()} TruPath Services. All rights reserved.</p>
            </div>

            <!-- Embedded Keyframe Animations -->
            <style>
                @keyframes fadeInHeader { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeInBody { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeInDivider { from { width: 0; opacity: 0; } to { width: 100%; opacity: 1; } }
                @keyframes fadeInFooter { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            </style>
        </div>
    `;
};

export const getWelcomeEmailTemplate = (name, email) => {
    return `
        <div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; max-width: 640px; margin: 0 auto; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; background: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <!-- Header with Subtle Gradient -->
            <div style="background: linear-gradient(135deg, #051C3B, #163560); padding: 28px 20px; text-align: center; animation: fadeInHeader 1.5s ease forwards;">
                <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">TruPath Services</h1>
                <p style="color: #bcd0f0; font-size: 14px; margin: 6px 0 0;">Welcome to Our Platform</p>
            </div>

            <!-- Body Section -->
            <div style="padding: 24px; animation: fadeInBody 1.8s ease;">
                <p style="font-size: 16px; color: #111827; margin: 0 0 14px;">
                    <strong>Welcome ${name}!</strong>
                </p>
                <p style="font-size: 15px; color: #444; margin: 0 0 18px;">
                    Thank you for registering with TruPath Services. Your account has been successfully created and you can now access our medical coding and documentation services.
                </p>

                <!-- Account Details -->
                <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #051C3B; margin: 0 0 12px; font-size: 14px;">Your Account Details:</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <tr>
                            <td style="padding: 6px 0; font-weight: 600; color: #051C3B; width: 30%;">Name:</td>
                            <td style="padding: 6px 0; color: #333;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-weight: 600; color: #051C3B;">Email:</td>
                            <td style="padding: 6px 0; color: #333;">${email}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-weight: 600; color: #051C3B;">Status:</td>
                            <td style="padding: 6px 0; color: #10b981; font-weight: 600;">✓ Active</td>
                        </tr>
                    </table>
                </div>

                <!-- Next Steps -->
                <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; border-left: 4px solid #4ecdc4;">
                    <h3 style="color: #051C3B; margin: 0 0 8px; font-size: 14px;">What's Next?</h3>
                    <ul style="color: #555; font-size: 14px; margin: 0; padding-left: 20px;">
                        <li>Log in to your account to access our services</li>
                        <li>Explore our medical coding and CDI solutions</li>
                        <li>Contact our team for personalized assistance</li>
                    </ul>
                </div>

                <p style="font-size: 14px; color: #555; margin: 20px 0 0;">
                    If you have any questions, please don't hesitate to contact our support team.
                </p>
            </div>

            <!-- Animated Footer -->
            <div style="background-color: #f9fafb; text-align: center; padding: 18px; color: #6b7280; font-size: 13px; border-top: 1px solid #e5e7eb; animation: fadeInFooter 2.2s ease;">
                <p style="margin: 0;">
                    Sent via <a href="https://trupathservices.com" style="color: #4ecdc4; text-decoration: none;">trupathservices.com</a>
                </p>
                <p style="margin: 4px 0 0;">© ${new Date().getFullYear()} TruPath Services. All rights reserved.</p>
            </div>

            <!-- Embedded Keyframe Animations -->
            <style>
                @keyframes fadeInHeader { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeInBody { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeInDivider { from { width: 0; opacity: 0; } to { width: 100%; opacity: 1; } }
                @keyframes fadeInFooter { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            </style>
        </div>
    `;
};

// OTP Email Templates
export const getUserOTPEmailTemplate = (name, otp) => {
    return `
        <div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; max-width: 640px; margin: 0 auto; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; background: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <!-- Header with Brand Gradient -->
            <div style="background: linear-gradient(135deg, #051C3B, #0B224A); padding: 28px 20px; text-align: center; animation: fadeInHeader 1.5s ease forwards;">
                <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">TruPath Services</h1>
                <p style="color: #bcd0f0; font-size: 14px; margin: 6px 0 0;">Registration Verification</p>
            </div>

            <!-- Body Section -->
            <div style="padding: 24px; animation: fadeInBody 1.8s ease;">
                <p style="font-size: 16px; color: #111827; margin: 0 0 14px;">
                    <strong>Hello ${name},</strong>
                </p>
                <p style="font-size: 15px; color: #444; margin: 0 0 18px;">
                    Thank you for registering with TruPath Services. Please use the OTP below to complete your registration:
                </p>

                <!-- OTP Display with Brand Colors -->
                <div style="text-align: center; margin: 24px 0;">
                    <div style="background: linear-gradient(45deg, #4ecdc4, #051C3B); 
                                color: #fff; 
                                padding: 20px 40px; 
                                border-radius: 12px; 
                                font-weight: 700; 
                                font-size: 32px; 
                                letter-spacing: 8px;
                                display: inline-block; 
                                box-shadow: 0 5px 15px rgba(5, 28, 59, 0.3);
                                border: 2px solid rgba(78, 205, 196, 0.3);">
                        ${otp}
                    </div>
                </div>

                <div style="border-top: 1px solid #e5e7eb; margin: 24px 0; animation: fadeInDivider 2s ease;"></div>

                <!-- Security Information -->
                <div style="background: #F7F7F7; padding: 16px; border-radius: 8px; border-left: 4px solid #4ecdc4;">
                    <h3 style="color: #051C3B; margin: 0 0 8px; font-size: 14px;">Security Information:</h3>
                    <ul style="color: #555; font-size: 14px; margin: 0; padding-left: 20px;">
                        <li>This OTP will expire in 10 minutes for security reasons</li>
                        <li>Do not share this OTP with anyone</li>
                        <li>If you didn't request this registration, please ignore this email</li>
                    </ul>
                </div>

                <p style="font-size: 14px; color: #555; margin: 20px 0 0;">
                    If you have any questions, please contact our support team.
                </p>
            </div>

            <!-- Animated Footer -->
            <div style="background-color: #F7F7F7; text-align: center; padding: 18px; color: #6b7280; font-size: 13px; border-top: 1px solid #e5e7eb; animation: fadeInFooter 2.2s ease;">
                <p style="margin: 0;">
                    Sent via <a href="https://trupathservices.com" style="color: #4ecdc4; text-decoration: none;">trupathservices.com</a>
                </p>
                <p style="margin: 4px 0 0;">© ${new Date().getFullYear()} TruPath Services. All rights reserved.</p>
            </div>

            <!-- Embedded Keyframe Animations -->
            <style>
                @keyframes fadeInHeader { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeInBody { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeInDivider { from { width: 0; opacity: 0; } to { width: 100%; opacity: 1; } }
                @keyframes fadeInFooter { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            </style>
        </div>
    `;
};

export const getAdminOTPEmailTemplate = (name, email, otp) => {
    return `
        <div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; max-width: 640px; margin: 0 auto; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; background: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <!-- Header with Brand Gradient -->
            <div style="background: linear-gradient(135deg, #051C3B, #0B224A); padding: 28px 20px; text-align: center; animation: fadeInHeader 1.5s ease forwards;">
                <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">TruPath Services</h1>
                <p style="color: #bcd0f0; font-size: 14px; margin: 6px 0 0;">Admin Registration Verification</p>
            </div>

            <!-- Body Section -->
            <div style="padding: 24px; animation: fadeInBody 1.8s ease;">
                <p style="font-size: 16px; color: #111827; margin: 0 0 14px;">
                    <strong>Hello Admin,</strong>
                </p>
                <p style="font-size: 15px; color: #444; margin: 0 0 18px;">
                    A new user registration requires admin approval. Please use the admin OTP below to verify the registration for <strong>${name}</strong> (${email}):
                </p>

                <!-- Admin OTP Display with Brand Colors -->
                <div style="text-align: center; margin: 24px 0;">
                    <div style="background: linear-gradient(45deg, #4ecdc4, #051C3B); 
                                color: #fff; 
                                padding: 20px 40px; 
                                border-radius: 12px; 
                                font-weight: 700; 
                                font-size: 32px; 
                                letter-spacing: 8px;
                                display: inline-block; 
                                box-shadow: 0 5px 15px rgba(5, 28, 59, 0.3);
                                border: 2px solid rgba(78, 205, 196, 0.3);">
                        ${otp}
                    </div>
                </div>

                <div style="border-top: 1px solid #e5e7eb; margin: 24px 0; animation: fadeInDivider 2s ease;"></div>

                <!-- User Information -->
                <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #051C3B; margin: 0 0 12px; font-size: 14px;">User Registration Details:</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <tr>
                            <td style="padding: 6px 0; font-weight: 600; color: #051C3B; width: 30%;">Name:</td>
                            <td style="padding: 6px 0; color: #333;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-weight: 600; color: #051C3B;">Email:</td>
                            <td style="padding: 6px 0; color: #333;">${email}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-weight: 600; color: #051C3B;">Status:</td>
                            <td style="padding: 6px 0; color: #f59e0b; font-weight: 600;">⏳ Pending Admin Approval</td>
                        </tr>
                    </table>
                </div>

                <!-- Admin Information -->
                <div style="background: #F7F7F7; padding: 16px; border-radius: 8px; border-left: 4px solid #4ecdc4;">
                    <h3 style="color: #051C3B; margin: 0 0 8px; font-size: 14px;">Admin Verification Required:</h3>
                    <ul style="color: #555; font-size: 14px; margin: 0; padding-left: 20px;">
                        <li>This OTP will expire in 10 minutes</li>
                        <li>Use this OTP to approve the user registration</li>
                        <li>Only authorized admins should use this OTP</li>
                    </ul>
                </div>

                <p style="font-size: 14px; color: #555; margin: 20px 0 0;">
                    This is an automated notification for admin verification purposes.
                </p>
            </div>

            <!-- Animated Footer -->
            <div style="background-color: #F7F7F7; text-align: center; padding: 18px; color: #6b7280; font-size: 13px; border-top: 1px solid #e5e7eb; animation: fadeInFooter 2.2s ease;">
                <p style="margin: 0;">
                    Sent via <a href="https://trupathservices.com" style="color: #4ecdc4; text-decoration: none;">trupathservices.com</a>
                </p>
                <p style="margin: 4px 0 0;">© ${new Date().getFullYear()} TruPath Services. All rights reserved.</p>
            </div>

            <!-- Embedded Keyframe Animations -->
            <style>
                @keyframes fadeInHeader { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeInBody { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeInDivider { from { width: 0; opacity: 0; } to { width: 100%; opacity: 1; } }
                @keyframes fadeInFooter { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            </style>
        </div>
    `;
};
