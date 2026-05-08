const fs = require('fs');
const path = require('path');
const User = require("../models/user");
const { postJson } = require("../utils/pythonClient");
const { buildMlPayload } = require("../utils/profileFeatures");
exports.updateProfile = async (req, res) => {
    try {
        const { name, avatar, companyName, companyDescription, companyLogo, resume, phone, education, skills, experienceYears } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }       
        user.name = name || user.name;
        
        if (resume) {
            if (!resume.toLowerCase().endsWith('.pdf')) {
                return res.status(400).json({ message: "Only PDF resumes are allowed" });
            }
            user.resume = resume;
        }

        user.avatar = avatar || user.avatar;
        user.phone = phone ?? user.phone;
        if (Array.isArray(education)) user.education = education;
        if (Array.isArray(skills)) user.skills = skills;
        if (experienceYears !== undefined) user.experienceYears = Number(experienceYears);
        if (user.role === 'employer') {
            user.companyName = companyName || user.companyName;
            user.companyDescription = companyDescription || user.companyDescription;  
            user.companyLogo = companyLogo || user.companyLogo;
        }
        await user.save();

        // Auto-evaluate job seeker profiles after updates (best-effort)
        if (user.role === "jobseeker") {
            try {
                const mlApiUrl = (process.env.ML_API_URL || "http://localhost:7002").replace(/\/$/, "");
                const payload = await buildMlPayload(user);
                const result = await postJson(`${mlApiUrl}/predict`, { profile: payload });

                const cls = Number(result.classification);
                user.verificationConfidence = Number(result.confidence || 0);
                user.verificationReasons = Array.isArray(result.reasons) ? result.reasons : [];

                if (cls === 0) {
                    user.verificationStatus = "genuine";
                } else if (cls === 1) {
                    user.verificationStatus = "suspicious";
                    user.accountStatus = "under_review";
                } else {
                    user.verificationStatus = "fake";
                    user.accountStatus = "suspended";
                }
                await user.save();
            } catch (e) {
                // Swallow ML errors to avoid blocking profile update if ML service is down.
                console.warn("ML evaluation failed:", e.message || e);
            }
        }

        res.json({
            _id: user._id,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
            companyName: user.companyName,
            companyDescription: user.companyDescription,
            companyLogo: user.companyLogo,
            resume: user.resume || '',
            trustScore: user.trustScore,
            accountStatus: user.accountStatus,
            verificationStatus: user.verificationStatus,
            verificationConfidence: user.verificationConfidence,
            verificationReasons: user.verificationReasons,
        });
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message});
    }
};
exports.deleteResume = async (req, res) => {
    try {
        const { resumeUrl} = req.body;
        const fileName = resumeUrl.split('/').pop();
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if(user.role !== "jobseeker") {
            return res.status(403).json({ message: "Only job seekers can delete resumes" });
        }
        const filePath = path.join(__dirname, '..', 'uploads', fileName);
        if(fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        user.resume = '';
        await user.save();
        res.json({ message: "Resume deleted successfully" });
    }catch (error) {
        res.status(500).json({ message: error.message});
    }
};
exports.getPublicProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }  
        res.json({user}) 
    }catch (error) {
        res.status(500).json({ message: error.message});
    }
};

exports.verifyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        user.isVerified = true;
        user.trustScore = Math.min(100, user.trustScore + 20);
        await user.save();
        
        res.json({ message: "Profile successfully verified", isVerified: user.isVerified, trustScore: user.trustScore });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};