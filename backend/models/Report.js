const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reportedJob: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
    details: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
