const User = require("../models/user");

// Mock function to send OTP via SMS/Email
const sendSmsOtp = async (phone, otp) => {
  console.log(`[MOCK SMS] Sending OTP ${otp} to phone ${phone}`);
  return true;
};

exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    console.log("Received OTP request for phone:", phone);

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Check if phone is already in use by a VERIFIED user
    try {
        const userExists = await User.findOne({ phone, isPhoneVerified: true });
        if (userExists) {
          return res.status(400).json({ message: "This phone number is already registered and verified." });
        }
    } catch (dbErr) {
        console.error("Database error during OTP check:", dbErr);
        return res.status(500).json({ message: "Database connection error. Please ensure MongoDB is running." });
    }

    // Generate a 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In a real app, we'd store this in a temporary collection or Redis
    // For this prototype, we just "send" it and return it to the client
    await sendSmsOtp(phone, otp);

    console.log("OTP generated successfully:", otp);

    res.status(200).json({ 
      success: true,
      message: "OTP sent successfully", 
      otp: otp // Returning OTP for development/testing
    });
  } catch (err) {
    console.error("Internal Error in sendOtp:", err);
    res.status(500).json({ message: "Internal server error: " + err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp, enteredOtp } = req.body;
    
    if (!enteredOtp) {
        return res.status(400).json({ message: "Please enter the OTP" });
    }

    if (otp === enteredOtp) {
      res.status(200).json({ message: "OTP verified successfully", success: true });
    } else {
      res.status(400).json({ message: "Invalid OTP. Please try again.", success: false });
    }
  } catch (err) {
    console.error("Internal Error in verifyOtp:", err);
    res.status(500).json({ message: err.message });
  }
};
