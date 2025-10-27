# TruPath Services

At TruPath Services, we simplify medical coding, payment integrity, and clinical documentation improvement (CDI) for healthcare providers. Our AHIMA & AAPC-certified experts ensure accuracy, compliance, and optimized reimbursements.

## 🏥 About TruPath Services

TruPath Services is a comprehensive healthcare technology platform that provides:

- **Medical Coding Services**: HCC, DRG, and outpatient coding
- **Payment Integrity**: Revenue cycle optimization
- **Clinical Documentation Improvement (CDI)**: Enhanced compliance and quality
- **Career Opportunities**: Job portal for healthcare professionals

## 🚀 Features

### Core Services
- **HCC Coding**: Hierarchical Condition Category coding for risk adjustment
- **DRG Coding**: Diagnosis Related Group coding for inpatient services
- **Outpatient Coding**: Professional coding for outpatient services
- **CDI Programs**: Clinical documentation improvement initiatives
- **Payment Integrity**: Revenue cycle management and optimization

### Platform Features
- **User Authentication**: Secure registration and login system
- **Job Management**: Admin panel for posting and managing job opportunities
- **Contact System**: Integrated contact form with email notifications
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Security**: Comprehensive security measures and HIPAA compliance

## 🛠️ Technology Stack

### Frontend
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Custom styling with Bootstrap integration
- **JavaScript**: Vanilla JS with modern ES6+ features
- **Bootstrap 5**: Responsive framework for UI components

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT**: JSON Web Tokens for authentication
- **Nodemailer**: Email service integration

### Security & Middleware
- **Helmet**: Security headers and CSP
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API protection against abuse
- **XSS Protection**: Input sanitization and validation
- **bcrypt**: Password hashing
- **UUID**: Unique identifier generation

## 📁 Project Structure

```
TruPath-Services/
├── admin/                    # Admin panel pages
│   ├── admin.css
│   ├── login.html
│   ├── register.html
│   ├── jobs.html
│   ├── forgot-password.html
│   └── reset-password.html
├── assets/                   # Static assets
│   ├── fonts/               # Custom fonts (Sen family)
│   ├── images/              # Images organized by category
│   │   ├── core/           # Brand assets and icons
│   │   ├── main/           # Homepage banners
│   │   ├── aboutUs/        # About section images
│   │   ├── services/       # Service icons
│   │   ├── careers/        # Career-related images
│   │   └── admin/          # Admin panel assets
├── lib/                     # Third-party libraries
│   ├── css/                # Bootstrap CSS files
│   └── js/                 # Bootstrap JavaScript files
├── server/                 # Backend server code
│   ├── models/             # Database models
│   │   ├── User.js
│   │   ├── Job.js
│   │   ├── OTPToken.js
│   │   └── PasswordResetToken.js
│   ├── auth.js             # Authentication logic
│   ├── config.js           # Environment configuration
│   ├── database.js         # Database connection
│   ├── emailTemplates.js   # Email template functions
│   ├── middleware.js       # Custom middleware
│   ├── server.js           # Main server file
│   └── package.json        # Node.js dependencies
├── index.html              # Main homepage
├── careers.html           # Careers page
├── style.css              # Main stylesheet
├── index.js               # Frontend JavaScript
├── robots.txt             # SEO robots file
└── sitemap.xml            # SEO sitemap
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Email service (SMTP configuration)

### Environment Variables
Create a `.env` file in the `server/` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/trupath-services

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password

# Server Configuration
APP_PORT=3000
APP_HOST=https://api.trupathservices.com
NODE_ENV=production
```

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/TruPath-Services.git
   cd TruPath-Services
   ```

2. **Install dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the application**
   - Frontend: `http://localhost:3000`
   - API: `http://localhost:3000/api`
   - Admin Panel: `http://localhost:3000/admin`

## 🔐 Security Features

### Authentication System
- **Server-Side Token Verification**: All tokens validated on the server
- **Automatic Login Redirect**: Prevents duplicate sessions
- **Token Monitoring**: Background validation every 5 minutes
- **Auto-Logout**: Automatic logout on token expiry
- **Session Management**: Proper cleanup and server-side logout

### Security Headers
- **Content Security Policy (CSP)**: Prevents XSS attacks
- **HSTS**: Forces HTTPS connections
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing

### Data Protection
- **Input Sanitization**: XSS protection on all user inputs
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: API protection against abuse
- **CORS Configuration**: Controlled cross-origin access

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/verify` - Token verification
- `POST /auth/verify-otp` - OTP verification
- `POST /auth/resend-otp` - Resend OTP
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset
- `POST /auth/logout` - User logout

### Job Management
- `GET /api/jobs` - Get all jobs (with search/pagination)
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create new job (Admin)
- `PUT /api/jobs/:id` - Update job (Admin)
- `DELETE /api/jobs/:id` - Delete job (Admin)
- `GET /api/jobs/stats` - Get job statistics (Admin)
- `GET /api/careers/jobs` - Get open jobs for careers page

### Contact & Monitoring
- `POST /contact` - Contact form submission
- `GET /api/monitor` - API monitoring endpoint
- `GET /test-logging` - Test logging functionality

## 🎨 Design Features

### Responsive Design
- Mobile-first approach
- Bootstrap 5 integration
- Custom CSS with modern styling
- Optimized images and fonts

### User Experience
- Smooth animations and transitions
- Toast notifications
- Form validation with real-time feedback
- Loading states and error handling

### SEO Optimization
- Semantic HTML structure
- Meta tags and Open Graph
- Structured data (JSON-LD)
- Sitemap and robots.txt
- Canonical URLs

## 📧 Email Templates

The system includes comprehensive email templates for:
- User registration OTP
- Admin verification OTP
- Welcome emails
- Password reset instructions
- Password reset confirmation
- Contact form notifications

## 🚀 Deployment

### Production Deployment
1. Set up MongoDB Atlas or local MongoDB instance
2. Configure SMTP email service
3. Set environment variables for production
4. Deploy to your preferred hosting platform
5. Configure domain and SSL certificates

### Recommended Hosting
- **Frontend**: Vercel, Netlify, or GitHub Pages
- **Backend**: Heroku, DigitalOcean, or AWS
- **Database**: MongoDB Atlas
- **Email**: SendGrid, Mailgun, or AWS SES

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**TruPath Services**
- 📧 Email: info@trupathservices.com
- 📱 Phone: +91-9391481020, +91-9666178974
- 🌐 Website: https://trupathservices.com
- 💼 LinkedIn: [TruPath Services](https://www.linkedin.com/company/trupathservices)

## 🙏 Acknowledgments

- AHIMA & AAPC certified coding professionals
- Healthcare industry experts
- Open source community contributors

---

**Built with ❤️ for the healthcare community**