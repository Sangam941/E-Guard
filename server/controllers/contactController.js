import Contact from '../models/Contact.js';

export const createContact = async (req, res, next) => {
  try {
    const { userId, name, phone, email, relationship, isPrimary } = req.body;

    if (!userId || !name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const contact = new Contact({
      userId,
      name,
      phone,
      email,
      relationship,
      isPrimary: isPrimary || false,
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Contact created',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const getContacts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const contacts = await Contact.find({ userId });

    res.json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const contact = await Contact.findByIdAndUpdate(id, updates, { new: true });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    res.json({
      success: true,
      message: 'Contact updated',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    res.json({
      success: true,
      message: 'Contact deleted',
    });
  } catch (error) {
    next(error);
  }
};
