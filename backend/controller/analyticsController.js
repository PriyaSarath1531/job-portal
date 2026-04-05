const Job = require("../models/Job");
const Application = require("../models/Application");

const getTrend = (prev, current) => {
    if (prev === 0) return current > 0 ? 100 : 0; // If no previous data, any current data is a 100% increase
    const change = ((current - prev) / prev) * 100;
    return Math.round(change); // Round to two decimal places
};


exports.getEmployerAnalytics = async (req, res) => {
    try {
        const companyId = req.user._id;

        if (req.user.role !== "employer") {
            return res.status(403).json({ message: "Access denied. Only employers can view analytics." });
        }
        const now = new Date();
        const last7Days = new Date(now);
        last7Days.setDate(now.getDate() - 7);
        const prev7Days = new Date(now);
        prev7Days.setDate(now.getDate() - 14);
        // 1. Get total jobs posted by this employer
        const totalActiveJobs = await Job.countDocuments({ company: companyId, isClosed: false });
        const jobs = await Job.find({ company: companyId}).select("_id").lean();
        const jobIds = jobs.map(job => job._id);

        // 2. Get all job IDs posted by this employer to find related applications

        // 3. Get total applications received for those jobs
        const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });

        // 4. Get count of hired candidates (Status: "Accepted")
        const totalHired = await Application.countDocuments({ 
            job: { $in: jobIds }, 
            status: "Accepted" 
        });

        // 5. Get count of rejected candidates
        const totalRejected = await Application.countDocuments({ 
            job: { $in: jobIds }, 
            status: "Rejected" 
        });
        const activeJobsLast7 = await Job.countDocuments({ company: companyId, createdAt: {$gte: last7Days, $lte:now }, });
        const activeJobsPrev7 = await Job.countDocuments({ company: companyId, createdAt: {$gte: prev7Days, $lt:last7Days }, });
        const activeJobTrend = getTrend(activeJobsPrev7, activeJobsLast7);
        const applicationsLast7 = await Application.countDocuments({ job: { $in: jobIds }, createdAt: {$gte: last7Days, $lte:now } });
        const applicationsPrev7 = await Application.countDocuments({ job: { $in: jobIds }, createdAt: {$gte: prev7Days, $lt:last7Days } });
        const applicationTrend = getTrend(applicationsPrev7, applicationsLast7);
        const hiredLast7 = await Application.countDocuments({ job: { $in: jobIds }, status: "Accepted", createdAt: {$gte: last7Days, $lte:now } });
        const hiredPrev7 = await Application.countDocuments({ job: { $in: jobIds }, status: "Accepted", createdAt: {$gte: prev7Days, $lt:last7Days } });
        const hiredTrend = getTrend(hiredPrev7, hiredLast7);
        res.status(200).json({
            totalJobsPosted: totalActiveJobs,
            totalApplicationsReceived: totalApplications,
            totalHired,
            totalRejected,
            activeJobs: await Job.countDocuments({ company: companyId, isClosed: false })
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};