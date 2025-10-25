import mongoose from 'mongoose';

const otpTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    email: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['user', 'admin'],
        required: true
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 600 // 10 minutes
    }
}, {
    timestamps: true
});

// Index for efficient queries
// Note: token field already has unique: true which creates an index automatically
otpTokenSchema.index({ userId: 1 });
// Note: expiresAt field already has expires: 600 which creates TTL index automatically

// Static method to find valid token
otpTokenSchema.statics.findValidToken = async function(token) {
    return await this.findOne({
        token,
        isUsed: false,
        expiresAt: { $gt: new Date() }
    });
};

// Static method to invalidate user tokens
otpTokenSchema.statics.invalidateUserTokens = async function(userId) {
    return await this.updateMany(
        { userId, isUsed: false },
        { isUsed: true }
    );
};

// Static method to mark token as used
otpTokenSchema.methods.markAsUsed = async function() {
    this.isUsed = true;
    return await this.save();
};

// Static method to cleanup expired tokens
otpTokenSchema.statics.cleanupExpired = async function() {
    return await this.deleteMany({
        $or: [
            { expiresAt: { $lt: new Date() } },
            { isUsed: true }
        ]
    });
};

const OTPToken = mongoose.model('OTPToken', otpTokenSchema);

export default OTPToken;
