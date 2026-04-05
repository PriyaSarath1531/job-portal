    


exports.saveJob =  async(req, res) => {
    try{
        const { jobId } = req.params;
        const userId = req.user._id;
        
        if (req.user.role !== "jobseeker") {
            return res.status(403).json({ message: "Only job seekers can save jobs" });
        }

        const existing = await SavedJob.findOne({ user: userId, job: jobId });
        if (existing) {
            return res.status(400).json({ message: "Job already saved" });
        }

        const savedJob = await SavedJob.create({ user: userId, job: jobId });
        res.status(201).json(savedJob);
    }catch(err){
        res.status(500).json({ message: err.message });
    }
};
 
exports.unSavedJob = async(req,res) =>{
    try {
        const { jobId } = req.params;
        const userId = req.user._id;

        const result = await SavedJob.findOneAndDelete({ user: userId, job: jobId });
        if (!result) {
            return res.status(404).json({ message: "Saved job not found" });
        }

        res.json({ message: "Job removed from saved list" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getSavedJobs = async (req, res) => {
    try {
        const userId = req.user._id;
        const savedJobs = await SavedJob.find({ user: userId })
            .populate({
                path: 'job',
                populate: {
                    path: 'company',
                    select: 'name companyName companyLogo'
                }
            })
            .sort({ createdAt: -1 });
        res.json(savedJobs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};