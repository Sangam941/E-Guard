'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserPlus, Phone, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function ContactsPage() {
  const { contacts, addContact, removeContact, isSOSActive } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: '' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) return;
    
    addContact({
      id: Date.now().toString(),
      ...newContact,
    });
    setNewContact({ name: '', phone: '', relation: '' });
    setIsAdding(false);
  };

  return (
    <div className="flex flex-col h-full py-4 gap-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#1e2130] p-4 rounded-2xl border border-[#2d3748]">
        <div className="flex items-center gap-3">
          <div className="bg-[#3b82f6]/20 p-2 rounded-full">
            <Users className="w-6 h-6 text-[#3b82f6]" />
          </div>
          <div>
            <h1 className="font-bold text-white">Emergency Contacts</h1>
            <p className="text-xs text-[#9ca3af]">Notified during SOS</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="p-2 bg-[#2d3748] rounded-full hover:bg-[#4b5563] transition-colors"
        >
          <UserPlus className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* SOS Status Banner */}
      {isSOSActive && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3"
        >
          <ShieldAlert className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="text-sm font-bold text-red-500">Alert Active</h3>
            <p className="text-xs text-red-400 mt-0.5">Contacts have been notified of your location.</p>
          </div>
        </motion.div>
      )}

      {/* Add Contact Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAdd} className="bg-[#1e2130] p-4 rounded-2xl border border-[#2d3748] flex flex-col gap-3">
              <input
                type="text"
                placeholder="Name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                className="bg-[#0f111a] border border-[#2d3748] rounded-xl px-4 py-2 text-sm text-white placeholder:text-[#9ca3af] focus:outline-none focus:border-[#8b5cf6]"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                className="bg-[#0f111a] border border-[#2d3748] rounded-xl px-4 py-2 text-sm text-white placeholder:text-[#9ca3af] focus:outline-none focus:border-[#8b5cf6]"
                required
              />
              <input
                type="text"
                placeholder="Relation (e.g., Parent, Friend)"
                value={newContact.relation}
                onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                className="bg-[#0f111a] border border-[#2d3748] rounded-xl px-4 py-2 text-sm text-white placeholder:text-[#9ca3af] focus:outline-none focus:border-[#8b5cf6]"
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2 rounded-xl text-sm font-medium text-[#9ca3af] bg-[#2d3748] hover:bg-[#4b5563] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3">
        {contacts.map((contact) => (
          <div key={contact.id} className="bg-[#1e2130] p-4 rounded-2xl border border-[#2d3748] flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#2d3748] rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">{contact.name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">{contact.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <Phone className="w-3 h-3 text-[#9ca3af]" />
                  <p className="text-xs text-[#9ca3af]">{contact.phone}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`tel:${contact.phone}`}
                className="p-2 text-[#9ca3af] hover:text-green-500 hover:bg-green-500/10 rounded-full transition-colors"
                title="Call Contact"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                onClick={() => removeContact(contact.id)}
                className="p-2 text-[#9ca3af] hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                title="Remove Contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {contacts.length === 0 && (
          <div className="text-center py-8 text-[#9ca3af]">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No emergency contacts added.</p>
            <p className="text-xs mt-1">Add contacts to notify them during an SOS.</p>
          </div>
        )}
      </div>
    </div>
  );
}
