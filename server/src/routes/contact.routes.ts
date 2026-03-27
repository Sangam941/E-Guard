import { Router } from 'express';
import { ContactController } from '../controllers/contactController.js';

const router = Router();

router.post('/', ContactController.create);
router.get('/', ContactController.getAll);
router.put('/:contactId', ContactController.update);
router.delete('/:contactId', ContactController.delete);

export default router;
