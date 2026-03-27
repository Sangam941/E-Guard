const express = require('express');
const multer = require('multer');
const uploadController = require('../controllers/uploadController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), uploadController.uploadEvidence);
router.get('/progress/:sosId', uploadController.getUploadProgress);

module.exports = router;
