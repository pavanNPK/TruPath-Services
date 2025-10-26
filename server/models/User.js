import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [15, 'Name cannot exceed 15 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  isVerified: { type: Boolean, default: false },
  verifiedAt: { type: Date, default: null },
  otp: { type: String, default: null },
  isActive: { type: Boolean, default: false },
  lastLogin: { type: Date, default: null },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.otp;
      return ret;
    }
  },
  toObject: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.otp;
      return ret;
    }
  }
});

// Auto-delete inactive users after 10 minutes
userSchema.index(
  { createdAt: 1 },
  { name: 'inactive_user_cleanup', expireAfterSeconds: 600, partialFilterExpression: { isVerified: false } }
);

// Pre-save hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Pre-save lowercase email
userSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

// JWT generator
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '1d' }
  );
};

// Static helper: find by email
userSchema.statics.findByEmail = async function(email) {
    console.log("🔍 Finding user by email:", email);
    if (!email) return null;
    const user = await this.findOne({ email: email.toLowerCase().trim() });
    console.log("✅ User found:", user ? user.name : 'None');
    return user;
}


const User = mongoose.model('User', userSchema);
export default User;
