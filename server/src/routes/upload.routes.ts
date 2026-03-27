import { Router } from 'express';
import { UploadController } from '../controllers/uploadController.js';

const router = Router();

router.post('/', UploadController.uploadFile);

export default router;
