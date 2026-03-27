import express from 'express';
import * as contactController from '../controllers/contactController.js';

const router = express.Router();

router.post('/', contactController.createContact);
router.get('/:userId', contactController.getContacts);
router.patch('/:id', contactController.updateContact);
router.delete('/:id', contactController.deleteContact);

export default router;
