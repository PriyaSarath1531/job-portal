const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    default: "",
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  
  // Auth
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["jobseeker", "employer"],
    required: true
  },
  
  // Profile Completeness
  avatar: String,
  resume: String,
  education: {
    type: [String],
    default: undefined,
  },
  skills: {
    type: [String],
    default: undefined,
  },
  experienceYears: {
    type: Number,
    default: 0,
  },
  profileCompletionPct: {
    type: Number,
    default: 0,
  },
  
  // Employer-specific
  companyName: String,
  companyDescription: String,
  companyLogo: String,
  
  // Verification & Security
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  accountStatus: { 
    type: String, 
    enum: ['active', 'suspended', 'under_review'], 
    default: 'under_review' 
  },
  
  // Face Recognition
  isFaceEnrolled: { 
    type: Boolean, 
    default: false 
  },
  faceDescriptor: { 
    type: String,  // base64 encoded descriptor from ML service
    default: undefined 
  },
  faceEmbeddings: {
    type: [[Number]],
    default: undefined,
  },
  faceEnrollment: {
    enrolledAt: { type: Date },
    imageCount: { type: Number, default: 0 },
  },
  faceLoginSecurity: {
    mismatchAttempts: { type: Number, default: 0 },
    lastMismatchAt: { type: Date },
    lockedUntil: { type: Date },
  },
  
  // Fake Profile Detection
  trustScore: { 
    type: Number, 
    default: 50,  // 0-100 scale
  },
  verificationStatus: {
    type: String,
    enum: ["genuine", "suspicious", "fake"],
    default: "suspicious",
  },
  verificationConfidence: {
    type: Number,
    default: 0,
  },
  verificationReasons: {
    type: [String],
    default: undefined,
  },
  resumeDuplicateCount: {
    type: Number,
    default: 0,
  },
  skillExperienceMismatch: {
    type: Number,
    default: 0,
  },
  unrealisticPatternScore: {
    type: Number,
    default: 0,
  },
  
  // Audit & Flags
  flags: [{
    reason: String,
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    timestamp: { type: Date, default: Date.now }
  }],
  registrationMeta: {
    lastKnownIp: { type: String, default: "" },
    deviceFingerprint: { type: String, default: "" },
    registrationSource: { type: String, default: "web" },
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare passwords
userSchema.methods.matchPassword = function (enterPassword) {
  return bcrypt.compare(enterPassword, this.password);
};

// Calculate profile completion
userSchema.methods.calculateProfileCompletion = function () {
  const fields = [
    !!this.name,
    !!this.email,
    !!this.phone,
    !!this.avatar,
    this.role === 'jobseeker' ? !!this.resume : !!this.companyName,
    (this.education?.length || 0) > 0,
    (this.skills?.length || 0) > 0,
    this.role === 'jobseeker' ? this.experienceYears > 0 : !!this.companyDescription,
  ];
  this.profileCompletionPct = (fields.filter(Boolean).length / fields.length) * 100;
};

const User = mongoose.model("User", userSchema);

module.exports = User;