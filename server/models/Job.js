import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true,
        maxlength: [200, 'Job title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Job description is required']
    },
    location: {
        type: String,
        required: [true, 'Job location is required'],
        trim: true,
        maxlength: [100, 'Location cannot exceed 100 characters']
    },
    experience: {
        type: String,
        required: [true, 'Experience level is required'],
        trim: true,
        maxlength: [50, 'Experience level cannot exceed 50 characters']
    },
    salary: {
        type: String,
        required: [true, 'Salary information is required'],
        trim: true,
        maxlength: [100, 'Salary information cannot exceed 100 characters']
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open',
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for better search performance
jobSchema.index({ title: 'text', description: 'text', location: 'text' });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ createdAt: -1 });

// Virtual for formatted date
jobSchema.virtual('formattedDate').get(function() {
    const now = new Date();
    const diffTime = Math.abs(now - this.createdAt);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 Day Ago';
    if (diffDays < 7) return `${diffDays} Days Ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} Weeks Ago`;
    return `${Math.ceil(diffDays / 30)} Months Ago`;
});

// Static method to search jobs
jobSchema.statics.searchJobs = function(searchTerm, status = null) {
    const query = {};
    
    if (searchTerm) {
        // Use regex for case-insensitive search across multiple fields
        query.$or = [
            { title: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { location: { $regex: searchTerm, $options: 'i' } },
            { experience: { $regex: searchTerm, $options: 'i' } },
            { salary: { $regex: searchTerm, $options: 'i' } }
        ];
    }
    
    // Filter by status if provided
    if (status) {
        query.status = status;
    }
    
    return this.find(query).sort({ createdAt: -1 });
};

// Static method to get job statistics
jobSchema.statics.getJobStats = function() {
    return this.aggregate([
        {
            $group: {
                _id: null,
                totalJobs: { $sum: 1 }
            }
        }
    ]);
};

const Job = mongoose.model('Job', jobSchema);

export default Job;
