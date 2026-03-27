// API Service - connects to backend
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiService = {
  // SOS Endpoints
  sos: {
    trigger: async (data: { location: { lat: number; lng: number }; description?: string }) => {
      const res = await fetch(`${API_BASE}/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    getStatus: async () => {
      const res = await fetch(`${API_BASE}/sos/status`);
      return res.json();
    },
  },

  // Chat Endpoints (AI Assistant)
  chat: {
    send: async (message: string) => {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      return res.json();
    },
    getHistory: async () => {
      const res = await fetch(`${API_BASE}/chat/history`);
      return res.json();
    },
  },

  // Upload Endpoints
  upload: {
    evidence: async (file: File, type: 'audio' | 'video') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });
      return res.json();
    },
  },

  // Fake Call Endpoints
  fakeCall: {
    trigger: async (data: { callerId: string; duration: number; theme: string }) => {
      const res = await fetch(`${API_BASE}/fake-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
  },

  // Contacts Endpoints
  contacts: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/contacts`);
      return res.json();
    },
    add: async (data: { name: string; phone: string; email?: string }) => {
      const res = await fetch(`${API_BASE}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    delete: async (id: string) => {
      const res = await fetch(`${API_BASE}/contacts/${id}`, { method: 'DELETE' });
      return res.json();
    },
  },

  // Alerts Endpoints
  alerts: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/alerts`);
      return res.json();
    },
    getById: async (id: string) => {
      const res = await fetch(`${API_BASE}/alerts/${id}`);
      return res.json();
    },
  },
};
