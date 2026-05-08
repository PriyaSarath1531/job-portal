const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { postJson } = require("../utils/pythonClient");

const generateToken = (id)=>{
    return jwt.sign({ id }, process.env.JWT_SECRET, {expiresIn: "60d"});
};
exports.register = async (req, res) => {
    try{
        const {name, email, password, role, phone, isPhoneVerified} = req.body;
        const userExists = await User.findOne({ $or: [{email}, {phone}] });
        if(userExists){
            return res.status(400).json({message: "User with this email or phone already exists"});
        };
        const user = await User.create({
            name,
            email,
            password,
            role,
            phone,
            isPhoneVerified: !!isPhoneVerified,
            registrationMeta: { lastKnownIp: req.ip || "" },
        });

        // Set initial status based on role
        if (role === 'employer') {
            user.verificationStatus = 'genuine';
            user.accountStatus = 'active';
            user.trustScore = 60;
            await user.save();
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isFaceEnrolled: user.isFaceEnrolled,
            avatar: user.avatar,
            token: generateToken(user._id),
            companyName: user.companyName || '',
            companyDescription: user.companyDescription || '',
            companyLogo: user.companyLogo || '',
            resume: user.resume||'',
        });

    }catch(err){ 
        res.status(500).json({message: err.message});
        
    }
};
exports.login = async (req, res) => {
    try{
        const{email, password} = req.body;
        const user = await User.findOne({email});
        if(!user || !(await user.matchPassword(password))){
            return res.status(401).json({ message: " Invalid email or password"});

        }
        res.json({
            _id : user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isFaceEnrolled: user.isFaceEnrolled,
            avatar: user.avatar,
            token: generateToken(user._id),
            companyName: user.companyName || '',
            companyDescription: user.companyDescription || '',
            companyLogo: user.companyLogo || '',
            resume: user.resume||'',

        });
    }catch(err){
        res.status(500).json({message: err.message});     
    }

};

exports.faceLogin = async (req, res) => {
    try {
        const { email, image } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const stored = (user.faceEmbeddings && user.faceEmbeddings.length > 0)
          ? user.faceEmbeddings
          : (user.faceDescriptor && user.faceDescriptor.length > 0 ? [user.faceDescriptor] : null);

        if (!stored) {
            return res.status(400).json({ message: "Face not registered for this account. Please log in with password and enroll." });
        }

        if (!image) {
            return res.status(400).json({ message: "Missing image" });
        }

        const faceApiUrl = (process.env.FACE_API_URL || "http://localhost:7001").replace(/\/$/, "");
        const threshold = Number(process.env.FACE_MATCH_THRESHOLD || 0.6);
        let result;
        try {
            result = await postJson(`${faceApiUrl}/verify`, {
                probe_image: image,
                stored_embeddings: stored,
                threshold,
            }, { timeoutMs: 30000 });
        } catch (apiErr) {
            console.error("Face API Connection Error (Login):", apiErr.message);
            const hint = apiErr.message.includes("ECONNREFUSED") ? ". Is the Python Face API running on port 7001?" : "";
            return res.status(503).json({ message: `Face service unavailable${hint}`, error: apiErr.message });
        }

        if (!result?.match) {
            user.faceLoginSecurity = user.faceLoginSecurity || {};
            user.faceLoginSecurity.mismatchAttempts = (user.faceLoginSecurity.mismatchAttempts || 0) + 1;
            user.faceLoginSecurity.lastMismatchAt = new Date();
            user.trustScore = Math.max(0, user.trustScore - 5);
            user.flags.push({ reason: `Face mismatch login attempt (dist=${result?.best_distance ?? "n/a"})`, timestamp: new Date() });

            if (user.faceLoginSecurity.mismatchAttempts >= 5) {
                user.accountStatus = "under_review";
                user.flags.push({ reason: "Account under review: repeated face mismatches", timestamp: new Date() });
            }

            await user.save();
            return res.status(401).json({ message: "Face recognition failed" });
        }

        // Successful face login: reset counters
        if (user.faceLoginSecurity?.mismatchAttempts) {
            user.faceLoginSecurity.mismatchAttempts = 0;
            await user.save();
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isFaceEnrolled: user.isFaceEnrolled,
            avatar: user.avatar,
            token: generateToken(user._id),
            resume: user.resume || '',
            companyName: user.companyName || '',
            companyLogo: user.companyLogo || '',
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.registerFace = async (req, res) => {
    try {
        const { images } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!Array.isArray(images) || images.length < 3) {
            return res.status(400).json({ message: "Please provide at least 3 face images" });
        }

        const faceApiUrl = (process.env.FACE_API_URL || "http://localhost:7001").replace(/\/$/, "");
        let embedRes;
        try {
            embedRes = await postJson(`${faceApiUrl}/embed`, { images }, { timeoutMs: 60000 });
        } catch (apiErr) {
            console.error("Face API Connection Error:", apiErr.message);
            const hint = apiErr.message.includes("ECONNREFUSED") 
                ? ". Is the Python Face API running on port 7001?" 
                : "";
            return res.status(503).json({ 
                message: `Face service unavailable${hint}`,
                error: apiErr.message 
            });
        }

        const embeddings = embedRes?.embeddings;
        if (!Array.isArray(embeddings) || embeddings.length < 1) {
            return res.status(400).json({ 
                message: "Face enrollment failed: No usable face detected in the captures. Please ensure good lighting and look directly at the camera.",
                details: embedRes?.per_image
            });
        }

        user.faceEmbeddings = embeddings;
        user.isFaceEnrolled = true;
        user.faceEnrollment = user.faceEnrollment || {};
        user.faceEnrollment.enrolledAt = new Date();
        user.faceEnrollment.imageCount = embeddings.length;

        user.trustScore = Math.min(100, user.trustScore + 20);
        user.flags.push({ reason: `Face enrolled (${embeddings.length} embeddings)`, timestamp: new Date() });
        await user.save();

        res.json({ message: "Face registered successfully", trustScore: user.trustScore, imageCount: embeddings.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.checkUserStatus = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email }).select('isFaceEnrolled role name');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            isFaceEnrolled: user.isFaceEnrolled,
            role: user.role,
            name: user.name
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.verifyFace = async (req, res) => {
    try {
        const { image } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role !== 'jobseeker') {
            return res.status(403).json({ message: "Face verification is only for job seekers" });
        }

        const stored = (user.faceEmbeddings && user.faceEmbeddings.length > 0)
          ? user.faceEmbeddings
          : (user.faceDescriptor && user.faceDescriptor.length > 0 ? [user.faceDescriptor] : null);

        if (!stored) {
            return res.status(400).json({ message: "Face not registered for this account" });
        }

        if (!image) {
            return res.status(400).json({ message: "Missing image" });
        }

        const faceApiUrl = (process.env.FACE_API_URL || "http://localhost:7001").replace(/\/$/, "");
        const threshold = Number(process.env.FACE_MATCH_THRESHOLD || 0.6);
        let result;
        try {
            result = await postJson(`${faceApiUrl}/verify`, {
                probe_image: image,
                stored_embeddings: stored,
                threshold,
            }, { timeoutMs: 30000 });
        } catch (apiErr) {
            console.error("Face API Connection Error (Login):", apiErr.message);
            const hint = apiErr.message.includes("ECONNREFUSED") ? ". Is the Python Face API running on port 7001?" : "";
            return res.status(503).json({ message: `Face service unavailable${hint}`, error: apiErr.message });
        }

        if (!result?.match) {
            user.faceLoginSecurity = user.faceLoginSecurity || {};
            user.faceLoginSecurity.mismatchAttempts = (user.faceLoginSecurity.mismatchAttempts || 0) + 1;
            user.faceLoginSecurity.lastMismatchAt = new Date();
            user.trustScore = Math.max(0, user.trustScore - 2); // Lower penalty for verification than login
            user.flags.push({ reason: `Face verification failed (dist=${result?.best_distance ?? "n/a"})`, timestamp: new Date() });
            await user.save();
            return res.status(401).json({ success: false, message: "Face recognition failed" });
        }

        res.json({ success: true, message: "Face verified" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getMe = async (req, res) => {
    res.json(req.user);

};