const mongoose = require("mongoose");
const jobSchema = new mongoose.Schema(
    {
        title: {type: String, required: true},
        description: {type: String, required: true},
        location: {type: String, required: true},
        category: {type: String},
        type:{
            type: String,
            enum: ["Remote", "Full-time", "Part-time", "Internship", "Contract"],
            required: true
        },
        company: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
        salaryMin : {type: Number},
        salaryMax : {type: Number},
        isClosed: {type: Boolean, default : false},
    }, { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;