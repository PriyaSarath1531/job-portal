const express = require("express");
const User = require("../models/user");
const { protect } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/adminMiddleware");

const router = express.Router();

// View flagged profiles (job seekers only)
router.get("/flagged-profiles", protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find({
      role: "jobseeker",
      $or: [
        { verificationStatus: { $in: ["suspicious", "fake"] } },
        { accountStatus: { $in: ["under_review", "suspended"] } },
      ],
    })
      .select("name email trustScore accountStatus verificationStatus verificationConfidence verificationReasons flags createdAt")
      .sort({ updatedAt: -1 })
      .limit(200);

    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Approve (mark genuine) / Reject (mark fake) - manual overrides
router.post("/profiles/:id/approve", protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "jobseeker") return res.status(400).json({ message: "Only job seekers supported" });

    user.verificationStatus = "genuine";
    user.accountStatus = "active";
    user.verificationConfidence = 1.0;
    user.verificationReasons = ["Manually approved by admin"];
    user.flags.push({ reason: "Admin approved profile", timestamp: new Date() });
    await user.save();

    res.json({ message: "Approved", userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/profiles/:id/reject", protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "jobseeker") return res.status(400).json({ message: "Only job seekers supported" });

    user.verificationStatus = "fake";
    user.accountStatus = "suspended";
    user.verificationConfidence = 1.0;
    user.verificationReasons = ["Manually rejected by admin"];
    user.flags.push({ reason: "Admin rejected profile", timestamp: new Date() });
    await user.save();

    res.json({ message: "Rejected", userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

