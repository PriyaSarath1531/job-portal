const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");

router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/verify-face-login", authController.verifyFaceAndLogin);
router.post("/logout", verifyToken, authController.logout);
router.get("/me", verifyToken, authController.getProfile);

module.exports = router;