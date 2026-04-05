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

exports.getMe = async (req, res) => {
    res.json(req.user);

};