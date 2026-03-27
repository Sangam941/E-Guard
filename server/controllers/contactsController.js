import asyncHandler from 'express-async-handler';
import Contact from '../models/Contact.js';

// POST /api/contacts
export const createContact = asyncHandler(async (req, res) => {
  const { name, phone, email, relationship, isPrimary } = req.body;
  const userId = req.user._id;
  if (!userId || !name || !phone) {
    res.status(400).json({ success: false, message: 'userId, name, and phone are required' });
    return;
  }
  const contact = await Contact.create({ userId, name, phone, email, relationship, isPrimary });
  res.status(201).json({ success: true, data: contact });
});

// GET /api/contacts/:userId
export const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: contacts });
});

// PATCH /api/contacts/:id
export const updateContact = asyncHandler(async (req, res) => {
  const { name, phone, email, relationship, isPrimary } = req.body;
  const contact = await Contact.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { name, phone, email, relationship, isPrimary },
    { new: true, runValidators: true }
  );
  if (!contact) {
    res.status(404).json({ success: false, message: 'Contact not found' });
    return;
  }
  res.json({ success: true, data: contact });
});

// DELETE /api/contacts/:id
export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!contact) {
    res.status(404).json({ success: false, message: 'Contact not found' });
    return;
  }
  res.json({ success: true, message: 'Contact removed' });
});
