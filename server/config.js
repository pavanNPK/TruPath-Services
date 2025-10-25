// Load environment variables FIRST before any other imports
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Verify environment variables are loaded
console.log("🔧 ENVIRONMENT VARIABLES LOADED:");
console.log("🔑 JWT_SECRET:", process.env.JWT_SECRET ? "✅ Loaded" : "❌ Missing");
console.log("📊 DB_URL:", process.env.DB_URL ? "✅ Loaded" : "❌ Missing");
console.log("📧 MAIL_USER:", process.env.MAIL_USER ? "✅ Loaded" : "❌ Missing");

// Export the environment variables for use in other modules
export const config = {
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES: process.env.JWT_EXPIRES || '24h',
    DB_URL: process.env.DB_URL,
    MAIL_HOST: process.env.MAIL_HOST,
    MAIL_PORT: process.env.MAIL_PORT,
    MAIL_USER: process.env.MAIL_USER,
    MAIL_PASS: process.env.MAIL_PASS,
    NODE_ENV: process.env.NODE_ENV,
    APP_PORT: process.env.APP_PORT || 3000,
    APP_HOST: process.env.APP_HOST || 'http://localhost:3000'
};
