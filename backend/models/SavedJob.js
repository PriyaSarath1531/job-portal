const mongoose = require('mongoose');
const savedJobSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
}, { timestamps: true });

const SavedJob = mongoose.model('SavedJob', savedJobSchema);

module.exports = SavedJob;