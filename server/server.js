import path from 'path';
import { fileURLToPath } from 'url';
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import xss from "xss";
import bodyParser from 'body-parser';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

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
            <!-- Header with Subtle Gradient -->
            <div style="background: linear-gradient(135deg, #051C3B, #163560); padding: 28px 20px; text-align: center; animation: fadeInHeader 1.5s ease forwards;">
                <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">TruPath Services</h1>
                <p style="color: #bcd0f0; font-size: 14px; margin: 6px 0 0;">Simplifying Medical Coding, Payment Integrity & CDI</p>
            </div>

            <!-- Body Section -->
            <div style="padding: 24px; animation: fadeInBody 1.8s ease;">
                <p style="font-size: 16px; color: #111827; margin: 0 0 14px;">
                    <strong>New Inquiry Received</strong>
                </p>
                <p style="font-size: 15px; color: #444; margin: 0 0 18px;">
                    A new contact form submission has been received via <strong>trupathservices.com</strong>. Below are the details:
                </p>

                <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
                    <tr style="animation: slideInRow 0.5s ease;">
                        <td style="padding: 8px 0; font-weight: 600; color: #051C3B; width: 28%;">Name</td>
                        <td style="padding: 8px 0;">${name}</td>
                    </tr>
                    <tr style="animation: slideInRow 0.6s ease;">
                        <td style="padding: 8px 0; font-weight: 600; color: #051C3B;">Email</td>
                        <td style="padding: 8px 0;">${email}</td>
                    </tr>
                    <tr style="animation: slideInRow 0.7s ease;">
                        <td style="padding: 8px 0; font-weight: 600; color: #051C3B;">Phone</td>
                        <td style="padding: 8px 0;">${phone || 'N/A'}</td>
                    </tr>
                    <tr style="animation: slideInRow 0.8s ease;">
                        <td style="padding: 8px 0; font-weight: 600; color: #051C3B; vertical-align: top;">Message</td>
                        <td style="padding: 8px 0; white-space: pre-wrap; color: #333;">${message}</td>
                    </tr>
                </table>

                <div style="border-top: 1px solid #e5e7eb; margin: 24px 0; animation: fadeInDivider 2s ease;"></div>

                <p style="font-size: 14px; color: #555; margin: 0;">
                    Please review this inquiry and respond promptly. This submission may relate to coding audits, documentation improvement, or healthcare compliance.
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
                @keyframes slideInRow { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes fadeInDivider { from { width: 0; opacity: 0; } to { width: 100%; opacity: 1; } }
                @keyframes fadeInFooter { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            </style>
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
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #051C3B 0%, #071f42 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                color: white;
            }

            /* Glass Container */
            .welcome-container {
                position: relative;
                text-align: center;
                background: rgba(255, 255, 255, 0.08);
                backdrop-filter: blur(12px);
                border-radius: 25px;
                padding: 3rem 2.5rem;
                border: 1px solid rgba(255, 255, 255, 0.15);
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
                animation: fadeInUp 0.8s ease-out;
                max-width: 520px;
                width: 90%;
            }

            .logo {
                font-size: 2.4rem;
                font-weight: 800;
                background: linear-gradient(45deg, #4ecdc4, #45b7d1, #ffffff);
                background-size: 200% 200%;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: gradientShift 5s ease-in-out infinite;
                margin-bottom: 0.8rem;
                letter-spacing: 0.5px;
            }

            .tagline {
                color: rgba(255, 255, 255, 0.9);
                font-size: 1rem;
                margin-bottom: 1.5rem;
                font-weight: 500;
            }

            .welcome-text {
                color: rgba(255, 255, 255, 0.85);
                font-size: 0.95rem;
                line-height: 1.6;
                margin-bottom: 2rem;
            }

            .quest-button {
                background: linear-gradient(45deg, #4ecdc4, #45b7d1);
                color: #051C3B;
                border: none;
                padding: 12px 32px;
                border-radius: 30px;
                font-size: 1rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-block;
                box-shadow: 0 5px 15px rgba(78, 205, 196, 0.3);
            }

            .quest-button:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 25px rgba(78, 205, 196, 0.5);
            }

            /* Particle Background */
            .particles {
                position: absolute;
                width: 100%;
                height: 100%;
                z-index: -1;
            }

            .particle {
                position: absolute;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                animation: float 6s ease-in-out infinite;
            }

            /* TruPath Icons (Themed for Medical Coding) */
            .TruPath-icons {
                display: flex;
                justify-content: center;
                gap: 1rem;
                margin-top: 2rem;
            }

            .TruPath-icon {
                width: 40px;
                height: 40px;
                background: rgba(255, 255, 255, 0.12);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 1.2rem;
                animation: pulse 2.5s infinite;
                box-shadow: 0 0 10px rgba(78, 205, 196, 0.3);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }

            .TruPath-icon:hover {
                transform: scale(1.15);
                box-shadow: 0 0 18px rgba(78, 205, 196, 0.8);
            }

            /* Animations */
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }

            @keyframes gradientShift {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
            }

            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-15px); }
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 0.8; }
                50% { transform: scale(1.1); opacity: 1; }
            }

            /* Sparkle effect */
            @keyframes sparkle {
                0% { transform: scale(0); opacity: 1; }
                100% { transform: scale(1); opacity: 0; }
            }

            @media (max-width: 576px) {
                .logo { font-size: 2rem; }
                .quest-button { font-size: 0.9rem; padding: 10px 25px; }
                .welcome-container { padding: 2.5rem 1.5rem; }
            }
        </style>
    </head>
    <body>
        <div class="particles">
            <div class="particle" style="width: 4px; height: 4px; top: 20%; left: 25%; animation-delay: 0s;"></div>
            <div class="particle" style="width: 6px; height: 6px; top: 65%; left: 75%; animation-delay: 1.8s;"></div>
            <div class="particle" style="width: 3px; height: 3px; top: 80%; left: 35%; animation-delay: 3.2s;"></div>
            <div class="particle" style="width: 5px; height: 5px; top: 30%; left: 60%; animation-delay: 0.7s;"></div>
        </div>

        <div class="welcome-container">
            <div class="logo">TruPath Services</div>
            <p class="tagline">Your Trusted Partner in Medical Coding & Documentation Excellence</p>
            <p class="welcome-text">
                We specialize in accurate, compliant, and efficient medical coding and CDI solutions. 
                Our AHIMA & AAPC-certified experts ensure data integrity, minimize denials, 
                and help healthcare providers achieve optimal reimbursement.
            </p>

            <a href="https://trupathservices.com" class="quest-button" target="_blank">
                Discover Medical Coding Excellence
            </a>

            <div class="TruPath-icons">
                <div class="TruPath-icon" title="Medical Expertise">🩺</div>
                <div class="TruPath-icon" title="Data Accuracy">💾</div>
                <div class="TruPath-icon" title="Compliance">🔍</div>
                <div class="TruPath-icon" title="Analytics">📊</div>
                <div class="TruPath-icon" title="Certified Coders">🧠</div>
            </div>
        </div>

        <script>
            document.addEventListener('mousemove', (e) => {
                const sparkle = document.createElement('div');
                sparkle.style.position = 'absolute';
                sparkle.style.left = e.clientX + 'px';
                sparkle.style.top = e.clientY + 'px';
                sparkle.style.width = '4px';
                sparkle.style.height = '4px';
                sparkle.style.background = 'rgba(255, 255, 255, 0.9)';
                sparkle.style.borderRadius = '50%';
                sparkle.style.pointerEvents = 'none';
                sparkle.style.zIndex = '1000';
                sparkle.style.animation = 'sparkle 1s ease-out forwards';
                document.body.appendChild(sparkle);
                setTimeout(() => sparkle.remove(), 1000);
            });
        </script>
    </body>
    </html>
    `;
}

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT, // 465
    secure: true, // important: false for port 587
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

// Contact form route
app.post("/contact", async (req, res) => {
    const { name, email, message, phone } = sanitizeInput(req.body);

    try {
        await transporter.sendMail({
            from: `"TruPath Services Contact Form" <${process.env.MAIL_USER}>`,
            to: process.env.MAIL_USER,
            replyTo: `${name} <${email}>`,
            subject: "New Contact Form Submission",
            headers: {
                'X-Priority': '1',
                'X-MSMail-Priority': 'High',
                'Importance': 'high'
            },
            html: getEmailTemplate(name, email, phone, message)
        });

        console.log("📬 Contact form email sent");
        res.send("Thank you! Your message has been sent.");
    } catch (error) {
        console.error("❌ Error sending email:", error);
        res.status(500).send("Something went wrong. Please try again later.");
    }
});

// Default route with styled HTML response
app.get('/welcome', (req, res) => {
    res.send(getWelcomePage());
});

// Start server
const port = process.env.APP_PORT || 3000;
const host = process.env.APP_HOST || 'https://api.trupathservices.com';

app.listen(port, () => {
    console.log(`Server running at ${host}/welcome`);
});