const Application = require("../models/Application");
const Job = require("../models/Job");

exports.applyToJob = async (req, res) => {
  try {
    if (req.user.role !== "jobseeker") {
      return res
        .status(403)
        .json({ message: "Only job seekers can apply to jobs" });
    }

    const existing = await Application.findOne({
      job: req.params.jobId,
      applicant: req.user._id
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "You have already applied to this job" });
    }

    // ✅ ADD THIS (IP address)
    const ipAddress =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress;

    // ✅ ADD THIS (device info from frontend)
    const { deviceInfo } = req.body;

    const application = await Application.create({
      ...req.body,
      job: req.params.jobId,
      applicant: req.user._id,
      resume: req.user.resume,

      // ✅ ADD THESE TWO LINES
      ipAddress: ipAddress,
      deviceInfo: deviceInfo
    });

    res.status(201).json(application);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getMyApplications = async(req,res) =>{
    try{
        const applications = (await Application.find({applicant: req.user._id}).populate('job', 'title company location')).sort({createdAt: -1});
        res.json(apps);     

    }catch(err){        
        res.status(500).json({message: err.message});
    }

};  
exports.getApplicantsForJob = async(req,res) =>{
    try{
        const job = await Job.findById(req.params.jobId);
        if(!job || job.company.toString() !== req.user._id.toString()){
            return res.status(404).json({message: "Not authorized  to view applicants"});
        }
        const applications = await Application.find({job: req.params.jobId}).populate('job', "title location category type").populate("applicant", "name  email avatar resume");
        res.json(applications);
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
};
exports.getApplicationById = async(req,res) =>{
    try{
        const app = await Application.findById(req.params.id).populate('job', "title ").populate("applicant", "name  email avatar resume");
        if(!app){
            return res.status(404).json({message: "Application not found", id: req.params.id  });
        }
        const isOwner = app.applicant._id.toString() === req.user._id.toString() || app.job.company.toString() === req.user._id.toString();
        if(!isOwner){
            return res.status(403).json({message: "Not authorized to view this application"});
        }
        res.json(app);
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
};
exports.updateStatus = async(req,res) =>{
    try{
        const {status} = req.body;
        const app = await Application.findById(req.params.id).populate('job');
        if(!app || app.job.company.toString() !== req.user._id.toString()){
            return res.status(403).json({message: "Not authorized to update this application"});
        }
        
        app.status = status;
        await app.save();
        res.json({message: "Application status updated", status});
    }catch(err){
        res.status(500).json({message: err.message});
    }
};
