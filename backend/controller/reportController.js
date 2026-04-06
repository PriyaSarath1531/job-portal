const Report = require("../models/Report");
const User = require("../models/user");
const Job = require("../models/Job");

exports.createReport = async (req, res) => {
    try {
        const { reportedUserId, reportedJobId, reason, details } = req.body;
        
        if (!reportedUserId && !reportedJobId) {
            return res.status(400).json({ message: "Must provide either reportedUserId or reportedJobId" });
        }

        const report = await Report.create({
            reporter: req.user._id,
            reportedUser: reportedUserId || null,
            reportedJob: reportedJobId || null,
            reason,
            details
        });

        if (reportedUserId) {
            const user = await User.findById(reportedUserId);
            if (user) {
                user.trustScore = Math.max(0, user.trustScore - 15);
                user.flags.push({ reason: `User reported: ${reason}`, timestamp: new Date() });
                if (user.trustScore < 30) {
                    user.accountStatus = 'under_review';
                }
                await user.save();
            }
        }
        
        if (reportedJobId) {
            const job = await Job.findById(reportedJobId);
            if (job) {
                job.isFlagged = true;
                job.flags.push({ reason: `Job reported: ${reason}`, timestamp: new Date() });
                await job.save();
                
                if (job.company) {
                    const company = await User.findById(job.company);
                    if (company) {
                        company.trustScore = Math.max(0, company.trustScore - 10);
                        company.flags.push({ reason: `Job reported: ${reason}`, timestamp: new Date() });
                        if (company.trustScore < 30) {
                            company.accountStatus = 'under_review';
                        }
                        await company.save();
                    }
                }
            }
        }

        res.status(201).json({ message: "Report submitted successfully", report });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
