const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    job: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Job', 
        required: true 
    },

    applicant: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    resume: { 
        type: String 
    },

    status: {
        type: String,
        enum: ["Applied", "Under Review", "Interview Scheduled", "Rejected", "Accepted"],
        default: "Applied"
    },

    // ✅ ADD FROM HERE
    ipAddress: {
        type: String
    },

    deviceInfo: {
        userAgent: String,
        platform: String,
        screen: String
    }
    // ✅ ADD TILL HERE

}, { timestamps: true });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;