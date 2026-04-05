const job=require("../models/job");
const user=require("../models/user");
const application=require("../models/application");
const savedjob=require("../models/savedjob");
const Job = require("../models/job");

exports.createjob = async(req, res) => {
    try{
        if(req.user.role !== "employer"){
            return res.status(403).json({message: "Only employers can create jobs"});
        }
        const job = await job.create({...req.body, comapany: req.user._id}) ;
        res.status(201).josn(job);
    }catch(err){
        res.status(500).json({message:  err.message});
    }
}
exports.getjobs =async(req,res)=>{
    const{
        keyword,
        location,
        category,
        type,
        minSalary,
        maxSalary,
        userId,
    } = req.query ;
    const query = {
        isClosed: false,
        ...{keyword && {title: { $regex: keyword, $options: "i"}}},
        ...{location && {location: { $regex: location, $options: "i"}}},
        ...{category && {category}},
        ...{type && {type}},
    };
    if(minSalary || maxSalary){
        query.$and = [];
        if(minSalary){
            query.$and.push({salary: {$gte: Number(minSalary)}});
        }
        if(maxSalary){
            query.$and.push({salary: {$lte: Number(maxSalary)}});
        }
        if(query.$and.length === 0){
            delete query.$and;
        }

    }   
    try{
        const jobs = await job.find(query).populate("company", "name companyName companyLogo");
        let savedJobIds = [];
        let appliesJobStatusMap = {};
        if(userId){
            const savedJobs = await savedjob.find({jobseeker: userId}).select("job");
            savedJobIds = savedJobs.map((s) => String(s.job));
            const applications = await Application.find({applicant: userId}).select("job status");
            application.forEach((app) => {
                appliesJobStatusMap[String(app.job)] = app.status;
            })

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
         
    }catch(err){
        res.status(500).json({message: err.message});
    }
};
exports.getJobsEmployer = async(req, res) =>{
    try{
        const userId = req.user._id;
        const {role} = req.user;
        if(role !== "employer"){
            return res.status(403).json({message: "Access Denied"});
        }
        const jobs = await job.find({company: userId})
            .populate("company", "name companyName companyLogo")
            .lean();
        const jobWithApplicationCounts = await Promise.all(
            jobs.map(async (job) => {
                const applicationCount = await Application.countDocuments({job: job._id});
                return {
                    ...job,
                    applicationCount,
                };
            })
        );
        res.json(jobWithApplicationCounts);

    }catch(err){
        res.status(500).json({message: err.message});
    }

};

exports.getJobById = async (req, res) =>{
    try{
        const {userId} = req.query;
        const job = await Job.findById(req.params.id).populate("company", "name companyName companyLogo");
        if(!job){
            return res.status(404).json({message: "Job not found"});
        }
        let applicationStatus = null;
        if(userId){
            const application = await Application.findOne({job: job._id, applicant: userId}).select("status");
            if(application){
                applicationStatus = application.status;
            }
        }
        res.json({...job.toObject(),  applicationStatus});
    }catch(err){
        res.status(500).json({message: err.message});
    }

};

exports.updateJob = async(req,res) =>{
    try{
        const job = await Job.findById(req.params.id);
        if(!job) return res.status(404).json({message: "Job not found"});
        if(job.company.toString() !== req.user._id.toString()){
            return res.status(403).json({message: "Not authorized to update this job"});
        }
        Object.assign(job, req.body);
        const updated = await job.save();
        res.json(updated);


    }catch(err){
        res.status(500).json({message: err.message});
    }

};

exports.deleteJob = async(req,res) =>{
    try{
        const job = await Job.findById(req.params.id);
        if(!job) return res.status(404).json({message: "Job not found"});
        if(job.company.toString() !== req.user._id.toString()){
            return res.status(403).json({message: "Not authorized to delete this job"});
        }
        await job.deletesOne();
        res.json({message: "Job deleted successfully"});

    }catch(err){
        res.status(500).json({message: err.message});
    }

};

exports.toggleCloseJob = async(req,res) =>{
    try{
        const job = await Job.findById(req.params.id);
        if(!job) return res.status(404).json({message: "Job not found"});
        if(job.company.toString() !== req.user._id.toString()){
            return res.status(403).json({message: "Not authorized to update this job"});
        }
        job.isClosed = !job.isClosed;
        await job.save();
        res.json({message: "Job marked as closed"});


    }catch(err){
        res.status(500).json({message: err.message});
    }

};

