const User = require("../models/User");
const axios = require("axios");

const ML_API_URL = process.env.ML_API_URL || "http://localhost:8001";
const FACE_MATCH_THRESHOLD = 0.6;
const MAX_MISMATCH_ATTEMPTS = 5;

exports.enrollFace = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Face image required" });
    }

    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const imageBase64 = req.file.buffer.toString("base64");

    // Call ML API to extract embedding
    const mlResponse = await axios.post(`${ML_API_URL}/face/enroll`, {
      image: imageBase64,
    });

    if (!mlResponse.data.success) {
      return res.status(400).json({ error: "Face enrollment failed" });
    }

    const { embedding, descriptor } = mlResponse.data;

    user.faceDescriptor = descriptor;
    user.faceEmbeddings = user.faceEmbeddings || [];
    user.faceEmbeddings.push(embedding);
    user.isFaceEnrolled = true;
    user.faceEnrollment = {
      enrolledAt: new Date(),
      imageCount: (user.faceEnrollment?.imageCount || 0) + 1,
    };
    user.accountStatus = "active"; // Auto-activate after face enrollment
    user.faceLoginSecurity = {
      mismatchAttempts: 0,
      lastMismatchAt: null,
    };

    await user.save();

    const token = require("jsonwebtoken").sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Face enrolled successfully",
      faceEnrolled: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Enroll error:", err.message);
    res.status(500).json({ error: "Face enrollment failed: " + err.message });
  }
};

exports.verifyFace = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Face image required" });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.isFaceEnrolled || !user.faceDescriptor) {
      return res.status(400).json({ error: "Face not enrolled for this user" });
    }

    // Check if locked due to too many attempts
    if (user.faceLoginSecurity?.lockedUntil > new Date()) {
      return res.status(429).json({
        error: "Face verification temporarily locked. Try again later.",
      });
    }

    const imageBase64 = req.file.buffer.toString("base64");

    // Call ML API to verify
    const mlResponse = await axios.post(`${ML_API_URL}/face/verify`, {
      image: imageBase64,
      enrollment: user.faceDescriptor,
    });

    const { match, confidence } = mlResponse.data;
    user.faceLoginSecurity.mismatchAttempts = (user.faceLoginSecurity.mismatchAttempts || 0) + 1;

    if (match && confidence > FACE_MATCH_THRESHOLD) {
      // Success
      user.faceLoginSecurity.mismatchAttempts = 0;
      user.faceLoginSecurity.lastMismatchAt = null;
      await user.save();

      const token = require("jsonwebtoken").sign(
        { userId: user._id, role: user.role, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        success: true,
        message: "Face verified - Login successful",
        token,
        confidence: parseFloat(confidence.toFixed(2)),
      });
    }

    // Failure
    user.faceLoginSecurity.lastMismatchAt = new Date();

    if (user.faceLoginSecurity.mismatchAttempts >= MAX_MISMATCH_ATTEMPTS) {
      user.faceLoginSecurity.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
      user.flags.push({
        reason: `${MAX_MISMATCH_ATTEMPTS} failed face verification attempts`,
        severity: "medium",
      });
    }

    await user.save();

    res.status(401).json({
      success: false,
      error: "Face verification failed",
      attempts: user.faceLoginSecurity.mismatchAttempts,
      attemptsRemaining: MAX_MISMATCH_ATTEMPTS - user.faceLoginSecurity.mismatchAttempts,
      confidence: parseFloat(confidence.toFixed(2)),
    });
  } catch (err) {
    console.error("Verify error:", err.message);
    res.status(500).json({ error: "Face verification failed: " + err.message });
  }
};