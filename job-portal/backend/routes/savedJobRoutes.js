const express = require("express");
const router = express.Router();
const {protect} = require("../middlewares/authMiddleware");
const {saveJob, unSavedJob, getSavedJobs} = require("../controller/savedJobController");
router.post("/:jobId", protect, saveJob);
router.get("/my", protect, getSavedJobs); 
router.delete("/:jobId", protect, unSavedJob);
module.exports = router;