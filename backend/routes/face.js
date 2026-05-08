const express = require("express");
const router = express.Router();
const faceController = require("../controllers/faceController");
const { verifyToken } = require("../middleware/auth");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/enroll", verifyToken, upload.single("image"), faceController.enrollFace);
router.post("/verify", upload.single("image"), faceController.verifyFace);

module.exports = router;