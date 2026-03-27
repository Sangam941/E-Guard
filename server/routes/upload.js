import express from 'express';
import multer from 'multer';
import * as uploadController from '../controllers/uploadController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), uploadController.uploadEvidence);
router.get('/progress/:sosId', uploadController.getUploadProgress);

export default router;
