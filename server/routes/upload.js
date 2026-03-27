import express from 'express';
import multer from 'multer';
import { uploadEvidence, getUploadProgress } from '../controllers/uploadController.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/tmp'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50 MB

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', upload.single('file'), uploadEvidence);
router.get('/progress/:sosId', getUploadProgress);

export default router;
