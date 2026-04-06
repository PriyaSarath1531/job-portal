const Job = require("../models/Job");
const Application = require("../models/Application");
const SavedJob = require("../models/SavedJob");
const { checkTrustAndStatus, analyzeText } = require("../utils/trustService");
const User = require("../models/user");

exports.createJob = async (req, res) => {
    try {
        if (req.user.role !== "employer") {
            return res.status(403).json({ message: "Only employers can create jobs" });
        }

        const user = await User.findById(req.user._id);
        const trustCheck = await checkTrustAndStatus(user, res, "posting a job");
        if (trustCheck) return trustCheck;

        const spamScore = analyzeText(req.body.title + " " + req.body.description);
        let isFlagged = false;
        let jobFlags = [];
        
        if (spamScore > 0) {
            user.trustScore = Math.max(0, user.trustScore - (spamScore * 10)); 
            user.flags.push({ reason: `Posted job with spam keywords`, timestamp: new Date() });
            await user.save();
            isFlagged = true;
            jobFlags.push({ reason: 'Contains suspicious/spam keywords', timestamp: new Date() });
        }

        const job = await Job.create({ ...req.body, company: req.user._id, isFlagged, flags: jobFlags });
        res.status(201).json(job);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.getJobs = async (req, res) => {
    const {
        keyword,
        location,
        category,
        type,
        minSalary,
        maxSalary,
        userId,
    } = req.query;

    const query = {
        isClosed: false,
    };

    if (keyword) {
        query.title = { $regex: keyword, $options: "i" };
    }
    if (location) {
        query.location = { $regex: location, $options: "i" };
    }
    if (category) {
        query.category = category;
    }
    if (type) {
        query.type = type;
    }

    if (minSalary || maxSalary) {
        query.$and = [];
        if (minSalary) {
            query.$and.push({ salaryMin: { $gte: Number(minSalary) } });
        }
        if (maxSalary) {
            query.$and.push({ salaryMax: { $lte: Number(maxSalary) } });
        }
        if (query.$and.length === 0) {
            delete query.$and;
        }
    }

    try {
        const jobs = await Job.find(query).populate("company", "name companyName companyLogo");
        let savedJobIds = [];
        let appliesJobStatusMap = {};

        if (userId) {
            const savedJobs = await SavedJob.find({ user: userId }).select("job");
            savedJobIds = savedJobs.map((s) => String(s.job));
            const applications = await Application.find({ applicant: userId }).select("job status");
            applications.forEach((app) => {
                appliesJobStatusMap[String(app.job)] = app.status;
            });
        }

        const jobsWithExtras = jobs.map((job) => {
            const jobIdStr = String(job._id);
            return {
                ...job.toObject(),
                isSaved: savedJobIds.includes(jobIdStr),
                applicationStatus: appliesJobStatusMap[jobIdStr] || null,
            };
        });
        res.json(jobsWithExtras);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getJobEmployer = async (req, res) => {
    try {
        const userId = req.user._id;
        if (req.user.role !== "employer") {
            return res.status(403).json({ message: "Access Denied" });
        }
        const jobs = await Job.find({ company: userId })
            .populate("company", "name companyName companyLogo")
            .lean();
        
        const jobWithApplicationCounts = await Promise.all(
            jobs.map(async (job) => {
                const applicationCount = await Application.countDocuments({ job: job._id });
                return {
                    ...job,
                    applicationCount,
                };
            })
        );
        res.json(jobWithApplicationCounts);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate("company", "name companyName companyLogo email avatar isVerified trustScore");
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }
        res.json(job);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job || job.company.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this job" });
        }
        const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedJob);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job || job.company.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this job" });
        }
        await Job.findByIdAndDelete(req.params.id);
        res.json({ message: "Job deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.toggleCloseJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job || job.company.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to modify this job" });
        }
        job.isClosed = !job.isClosed;
        await job.save();
        res.json({ message: `Job ${job.isClosed ? 'closed' : 'opened'} successfully`, isClosed: job.isClosed });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
