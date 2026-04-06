const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id)=>{
    return jwt.sign({ id }, process.env.JWT_SECRET, {expiresIn: "60d"});
};
exports.register = async (req, res) => {
    try{
        const {name, email, password, role} = req.body;
        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({message: "User already exists"});
        };
        const user = await User.create({name, email, password, role});
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            token: generateToken(user._id),
            companyName: user.companyName || '',
            companyDescription: user.companyDescription || '',
            companyLogo: user.companyLogo || '',
            resume: user.resume||'',
        });

    }catch(err){ 
        res.status(500).json({error: err.message});
        
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
            avatar: user.avatar,
            token: generateToken(user._id),
            companyName: user.companyName || '',
            companyDescription: user.companyDescription || '',
            companyLogo: user.companyLogo || '',
            resume: user.resume||'',

        });
    }catch(err){
        res.status(500).json({error: err.message});     
    }

};

exports.faceLogin = async (req, res) => {
    try {
        const { email, descriptor } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role !== 'jobseeker') {
            return res.status(403).json({ message: "Face login is only for job seekers" });
        }

        if (!user.faceDescriptor || user.faceDescriptor.length === 0) {
            return res.status(400).json({ message: "Face not registered for this account" });
        }

        // Euclidean distance comparison (done simply here, but usually needs a threshold)
        // In a real app, you might use face-api.js on the backend too, or a library like 'face-recognition'
        // For simplicity, we assume the frontend sends a high-quality descriptor.
        // A common threshold for face-api.js is 0.6 (lower is better).
        const dist = Math.sqrt(user.faceDescriptor.reduce((sum, val, i) => sum + Math.pow(val - descriptor[i], 2), 0));
        
        if (dist > 0.6) {
            return res.status(401).json({ message: "Face recognition failed" });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            token: generateToken(user._id),
            resume: user.resume || '',
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.registerFace = async (req, res) => {
    try {
        const { descriptor } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role !== 'jobseeker') {
            return res.status(403).json({ message: "Face registration is only for job seekers" });
        }

        user.faceDescriptor = descriptor;
        user.trustScore = Math.min(100, user.trustScore + 10);
        user.flags.push({ reason: 'Face registered', timestamp: new Date() });
        await user.save();

        res.json({ message: "Face registered successfully", trustScore: user.trustScore });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMe = async (req, res) => {
    res.json(req.user);

};