// This file is a copy of authController.js from the controller folder
// Add your route logic here
const express = require('express');
const {register, login, getMe} = require("../controller/authController");

const {protect} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);  

router.post("/upload-image", upload.single("image"), (req, res) => {
    if(!req.file){
        return res.status(400).json({message: "No file uploaded"});
    }
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;   
    res.status(200).json({imageUrl});
    });
module.exports = router;