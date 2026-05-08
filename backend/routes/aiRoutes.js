const express = require("express");
const User = require("../models/user");
const { protect } = require("../middlewares/authMiddleware");
const { postJson } = require("../utils/pythonClient");
const { buildMlPayload } = require("../utils/profileFeatures");

const router = express.Router();

// Evaluate the currently logged-in job seeker profile
router.post("/evaluate-me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "jobseeker") {
      return res.status(200).json({ message: "Non-jobseeker not evaluated", verificationStatus: "genuine" });
    }

    const mlApiUrl = (process.env.ML_API_URL || "http://localhost:7002").replace(/\/$/, "");
    const payload = await buildMlPayload(user);
    const result = await postJson(`${mlApiUrl}/predict`, { profile: payload });

    const cls = Number(result.classification);
    const confidence = Number(result.confidence || 0);
    const reasons = Array.isArray(result.reasons) ? result.reasons : [];

    user.verificationConfidence = confidence;
    user.verificationReasons = reasons;

    if (cls === 0) {
      user.verificationStatus = "genuine";
      if (user.accountStatus === "under_review") user.accountStatus = "active";
      user.trustScore = Math.min(100, user.trustScore + 2);
    } else if (cls === 1) {
      user.verificationStatus = "suspicious";
      user.accountStatus = "under_review";
      user.trustScore = Math.max(0, user.trustScore - 5);
      user.flags.push({ reason: `AI flagged suspicious (${Math.round(confidence * 100)}%)`, timestamp: new Date() });
    } else {
      user.verificationStatus = "fake";
      user.accountStatus = "suspended";
      user.trustScore = Math.max(0, user.trustScore - 20);
      user.flags.push({ reason: `AI classified fake (${Math.round(confidence * 100)}%)`, timestamp: new Date() });
    }

    await user.save();

    res.json({
      verificationStatus: user.verificationStatus,
      confidence: user.verificationConfidence,
      reasons: user.verificationReasons,
      trustScore: user.trustScore,
      accountStatus: user.accountStatus,
      features: result.features || {},
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

