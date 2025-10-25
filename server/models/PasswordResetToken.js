import mongoose from 'mongoose';

const passwordResetTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, 'Token is required'],
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true
    },
    expiresAt: {
        type: Date,
        required: [true, 'Expiration date is required']
    },
    used: {
        type: Boolean,
        default: false
    },
    usedAt: {
        type: Date,
        default: null
    },
    ipAddress: {
        type: String,
        default: null
    },
    userAgent: {
        type: String,
        default: null
    }
}, { timestamps: true });


// ✅ Explicit, non-duplicated indexes
// Note: token field already has unique: true which creates an index automatically
passwordResetTokenSchema.index({ userId: 1 });
passwordResetTokenSchema.index({ email: 1 });
passwordResetTokenSchema.index({ used: 1 });
// Note: TTL index will be created automatically by MongoDB based on the schema



// ---------- Virtuals ----------
passwordResetTokenSchema.virtual('isExpired').get(function () {
    return Date.now() > this.expiresAt.getTime();
});

passwordResetTokenSchema.virtual('isValid').get(function () {
    return !this.isExpired && !this.used;
});


// ---------- Methods ----------
passwordResetTokenSchema.methods.markAsUsed = function () {
    this.used = true;
    this.usedAt = new Date();
    return this.save();
};

passwordResetTokenSchema.statics.findValidToken = function (token) {
    return this.findOne({
        token,
        used: false,
        expiresAt: { $gt: new Date() }
    }).populate('userId', 'name email');
};

passwordResetTokenSchema.statics.findByUser = function (userId) {
    return this.find({ userId }).sort({ createdAt: -1 });
};

passwordResetTokenSchema.statics.findByEmail = function (email) {
    return this.find({ email: email.toLowerCase().trim() }).sort({ createdAt: -1 });
};

passwordResetTokenSchema.statics.cleanupExpired = function () {
    return this.deleteMany({
        $or: [
            { expiresAt: { $lt: new Date() } },
            { used: true, usedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
        ]
    });
};

passwordResetTokenSchema.statics.invalidateUserTokens = function (userId) {
    return this.updateMany(
        { userId, used: false },
        { used: true, usedAt: new Date() }
    );
};

passwordResetTokenSchema.pre('save', function (next) {
    if (this.isModified('email')) {
        this.email = this.email.toLowerCase().trim();
    }
    next();
});


const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
export default PasswordResetToken;
