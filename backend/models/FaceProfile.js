const mongoose = require('mongoose');

const faceProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    faceEmbedding: { type: [Number], required: true },
    faceDescriptor: { type: String, default: null },
    enrolledAt: { type: Date, default: Date.now },
    verificationAttempts: { type: Number, default: 0 },
    lastVerifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FaceProfile', faceProfileSchema);