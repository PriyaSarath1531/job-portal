const express = require('express');
const {
    applyToJob,
    getApplications,
    getApplicantsForJob,  
    getApplicationById,
    updateStatus
} = require('../controller/applicationController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();    
router.post('/:jobId', protect, applyToJob);
router.get('/my', protect, getApplications);
router.get('/job/:jobId', protect, getApplicantsForJob);
router.get('/:id', protect, getApplicationById);
router.put('/:id/status', protect, updateStatus);
module.exports = router;