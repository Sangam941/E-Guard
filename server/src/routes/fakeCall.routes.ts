import { Router } from 'express';
import { FakeCallController } from '../controllers/fakeCallController.js';

const router = Router();

router.post('/trigger', FakeCallController.trigger);
router.post('/end', FakeCallController.end);

export default router;
