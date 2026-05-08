const User = require("../models/User");
const OTP = require("../models/OTP");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const axios = require("axios");

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.sendOtp = async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email && !phone) {
      return res.status(400).json({ error: "Email or phone required" });
    }

    const otp = generateOtp();
    const salt = await bcryptjs.genSalt(10);
    const otpHash = await bcryptjs.hash(otp, salt);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await OTP.findOneAndUpdate(
      { email },
      { otpHash, phone, expiresAt, attempts: 0, used: false },
      { upsert: true, new: true }
    );

    if (email) {
      await transporter.sendMail({
        to: email,
        subject: "🔐 Your Job Portal OTP",
        html: `
          <h2>Your OTP is: <strong>${otp}</strong></h2>
          <p>Valid for 5 minutes</p>
          <p>Do not share this with anyone</p>
        `,
      });
    }

    res.json({ message: "OTP sent successfully", email });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP required" });
    }

    const otpDoc = await OTP.findOne({ email });
    if (!otpDoc || otpDoc.used) {
      return res.status(400).json({ error: "OTP not found or already used" });
    }

    if (otpDoc.attempts >= 5) {
      return res.status(429).json({ error: "Too many attempts. Request new OTP" });
    }

    if (new Date() > otpDoc.expiresAt) {
      await OTP.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({ error: "OTP expired" });
    }

    const isValid = await otpDoc.compareOtp(otp);
    if (!isValid) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return res.status(400).json({ error: "Invalid OTP" });
    }

    otpDoc.used = true;
    await otpDoc.save();

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ error: "OTP verification failed" });
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Name, email, password, and role required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const otpDoc = await OTP.findOne({ email, used: true });
    if (!otpDoc) {
      return res.status(400).json({ error: "Email not verified via OTP" });
    }

    const user = new User({
      name,
      email,
      phone: phone || "",
      password,
      role,
      isVerified: true,
      accountStatus: "under_review", // Pending face enrollment
    });

    user.calculateProfileCompletion();
    await user.save();

    // Trigger fake profile detection async
    runFakeProfileDetection(user);

    await OTP.deleteOne({ email });

    res.status(201).json({
      message: "Account created. Please enroll your face.",
      userId: user._id,
      role: user.role,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if account is suspended
    if (user.accountStatus === "suspended") {
      return res.status(403).json({ error: "Account suspended" });
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.isFaceEnrolled) {
      return res.status(400).json({
        error: "Please enroll face first",
        userId: user._id,
        requiresFaceEnrollment: true,
      });
    }

    // Check face login security
    if (user.faceLoginSecurity?.lockedUntil > new Date()) {
      return res.status(429).json({
        error: "Too many failed face attempts. Try again later.",
      });
    }

    res.json({
      message: "Credentials verified. Verify face next.",
      userId: user._id,
      requiresFaceVerification: true,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.verifyFaceAndLogin = async (req, res) => {
  try {
    const { userId } = req.userId ? { userId: req.userId } : req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.isFaceEnrolled) {
      return res.status(400).json({ error: "Face not enrolled" });
    }

    // Face verification is handled by faceController
    // This just issues JWT after successful face match

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Reset mismatch attempts on successful login
    user.faceLoginSecurity.mismatchAttempts = 0;
    await user.save();

    res.json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Face login error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.logout = async (req, res) => {
  res.json({ message: "Logged out successfully" });
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fake Profile Detection (Async)
async function runFakeProfileDetection(user) {
  try {
    const ML_API_URL = process.env.ML_API_URL || "http://localhost:8001";

    const payload = {
      profile: {
        user_id: user._id.toString(),
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar || "",
        resume: user.resume || "",
        education: user.education || [],
        skills: user.skills || [],
        experience_years: user.experienceYears || 0,
        profile_completion_pct: user.profileCompletionPct,
        resume_duplicate_count: user.resumeDuplicateCount || 0,
        skill_experience_mismatch: user.skillExperienceMismatch || 0,
        multiple_accounts_same_ip_count: 0,
        face_mismatch_attempts: user.faceLoginSecurity?.mismatchAttempts || 0,
        unrealistic_patterns_score: user.unrealisticPatternScore || 0,
      },
    };

    const response = await axios.post(`${ML_API_URL}/predict`, payload, {
      timeout: 5000,
    });

    user.verificationStatus = ["genuine", "suspicious", "fake"][response.data.classification];
    user.verificationConfidence = response.data.confidence;
    user.verificationReasons = response.data.reasons;
    user.trustScore = Math.round((1 - response.data.confidence) * 100);

    if (response.data.classification === 2) {
      user.accountStatus = "suspended";
      user.flags.push({
        reason: "Detected as fake profile",
        severity: "high",
      });
    }

    await user.save();
    console.log(`✅ Verification done for ${user.email}: ${user.verificationStatus}`);
  } catch (err) {
    console.error("❌ Fake profile detection error:", err.message);
  }
}

// ✅ attach helper without overwriting other exports
exports.runFakeProfileDetection = runFakeProfileDetection;