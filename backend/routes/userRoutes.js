// This file is a copy of userController.js from the controller folder
// Add your route logic here
const express = require('express');
const {
    updateProfile,
    deleteResume,
    getPublicProfile,
    verifyProfile
} = require('../controller/userController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();    
router.put('/profile', protect, updateProfile);
router.delete('/resume', protect, deleteResume);
router.get('/public/:userId', getPublicProfile);
router.post('/verify', protect, verifyProfile);
module.exports = router;