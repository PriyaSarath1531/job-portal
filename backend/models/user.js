const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["jobseeker", "employer"],
    required: true
  },
  avatar: String,
  resume: String,
  companyName: String,
  companyDescription: String,
  companyLogo: String,
  isVerified: { type: Boolean, default: false },
  trustScore: { type: Number, default: 50 },
  accountStatus: { type: String, enum: ['active', 'suspended', 'under_review'], default: 'active' },
  flags: [{
    reason: String,
    timestamp: { type: Date, default: Date.now }
  }],
  faceDescriptor: {
    type: [Number],
    default: undefined
  }
}, { timestamps: true });
//encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


userSchema.methods.matchPassword = function (enterPassword) {
    return bcrypt.compare(enterPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;