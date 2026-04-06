const User = require('../models/user');

const SPAM_KEYWORDS = ['easy money', 'get rich quick', 'no experience needed', 'work from home immediately', 'free money', 'scam', 'click here'];

exports.calculateProfileTrust = (user) => {
    let score = 50; // base score

    if (user.role === 'jobseeker') {
        if (user.resume) score += 20;
        if (user.avatar) score += 10;
        if (user.isVerified) score += 20;
    } else if (user.role === 'employer') {
        if (user.companyName) score += 15;
        if (user.companyDescription && user.companyDescription.length > 50) score += 15;
        if (user.companyLogo) score += 10;
        if (user.isVerified) score += 10;
    }

    return Math.min(score, 100);
};

exports.analyzeText = (text) => {
    if (!text) return 0;
    const lowerText = text.toLowerCase();
    let spamCount = 0;
    SPAM_KEYWORDS.forEach(keyword => {
        if (lowerText.includes(keyword)) {
            spamCount++;
        }
    });
    return spamCount;
};

exports.checkTrustAndStatus = async (user, res, actionType) => {
    if (user.accountStatus === 'suspended') {
         return res.status(403).json({ message: 'Account is suspended.' });
    }
    if (user.accountStatus === 'under_review') {
         return res.status(403).json({ message: 'Account is under review. Please contact support.' });
    }
    
    if (user.trustScore < 30) {
        user.accountStatus = 'under_review';
        user.flags.push({ reason: `Trust score dropped too low (${user.trustScore}) during ${actionType}`, timestamp: new Date() });
        await user.save();
        return res.status(403).json({ message: 'Account flagged for suspicious activity. Under review.' });
    }
    
    return null; // OK
};
