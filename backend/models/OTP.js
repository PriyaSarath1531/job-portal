const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const otpSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true,
    lowercase: true,
  },
  phone: { 
    type: String, 
    default: null 
  },
  otpHash: { 
    type: String, 
    required: true 
  },
  expiresAt: { 
    type: Date, 
    required: true,
    index: { expireAfterSeconds: 0 }  // Auto-delete after expiry
  },
  attempts: { 
    type: Number, 
    default: 0 
  },
  used: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

// Auto-delete after expiry
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compare OTP
otpSchema.methods.compareOtp = async function (candidateOtp) {
  return bcrypt.compare(candidateOtp, this.otpHash);
};

const OTP = mongoose.model("OTP", otpSchema);

module.exports = OTP;