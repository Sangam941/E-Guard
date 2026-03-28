import {
  triggerSOS,
} from '@/api/sos';
import {
  createContact,
  getContacts,
  updateContact,
  deleteContact,
} from '@/api/contacts';
import apiClient from '@/api/apiClient';

// Named export for convenience - provides aliased methods matching common usage patterns
export const apiService = {
  sos: {
    trigger: triggerSOS,
  },
  contacts: {
    create: createContact,
    getAll: getContacts,
    update: updateContact,
    delete: deleteContact,
  },
};

// Also export individual functions for direct imports
export { triggerSOS} from '@/api/sos';
export { createContact, getContacts, updateContact, deleteContact } from '@/api/contacts';
export * from '@/api/chat';
export * from '@/api/alerts';
export * from '@/api/fakeCall';
export * from '@/api/upload';
export { apiClient };
