import express from 'express';
import {
  createContact,
  getContacts,
  updateContact,
  deleteContact,
} from '../controllers/contactsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createContact);
router.get('/:userId', getContacts);
router.patch('/:id', updateContact);
router.delete('/:id', deleteContact);

export default router;
