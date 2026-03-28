'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Phone, Trash2, ShieldAlert, Plus, Mail } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function ContactsPage() {
  const { contacts, addContact, removeContact, isSOSActive, fetchContacts } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: '' });

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) return;
    
    await addContact({
      name: newContact.name,
      phone: newContact.phone,
      relation: newContact.relation,
    });
    setNewContact({ name: '', phone: '', relation: '' });
    setIsAdding(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-12">
          <p className="text-green-400 text-xs font-bold tracking-widest mb-2 sm:mb-4">● EMERGENCY CONTACT NETWORK</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-1 sm:mb-2">Emergency</h1>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">Contacts</h2>
        </div>

        {/* SOS Status Banner */}
        {isSOSActive && (
          <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4 sm:p-6 mb-6 sm:mb-12 flex items-start gap-3 sm:gap-4">
            <ShieldAlert className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-red-500 mb-1">Alert Active</h3>
              <p className="text-gray-300">Your emergency contacts have been notified of your location. They are receiving your real-time updates.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-12">
          {/* Left: Contact List */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold flex items-center gap-3">
                <Users className="text-green-400" />
                Your Emergency Contacts
              </h3>
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg transition-colors font-semibold flex items-center gap-2"
              >
                <Plus size={18} />
                Add Contact
              </button>
            </div>

            {/* Add Contact Form */}
            {isAdding && (
              <form onSubmit={handleAdd} className="bg-gray-900 border border-gray-800 rounded-lg p-6 sm:p-8 mb-6 sm:mb-8">
                <h4 className="text-lg font-bold mb-6">Add New Emergency Contact</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Relation (Parent, Friend, etc.)"
                    value={newContact.relation}
                    onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-3 rounded-lg text-white bg-gray-800 hover:bg-gray-700 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-lg text-white bg-green-600 hover:bg-green-500 transition-colors font-semibold"
                  >
                    Save Contact
                  </button>
                </div>
              </form>
            )}

            {/* Contact List */}
            <div className="space-y-3 sm:space-y-4">
              {contacts.map((contact) => (
                <div key={contact.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6 hover:border-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500/30 to-green-600/30 rounded-lg flex items-center justify-center border border-green-500/30">
                        <span className="text-lg font-bold text-green-400">{contact.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg">{contact.name}</h4>
                        <p className="text-sm text-gray-400">{contact.relation}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone size={14} className="text-gray-500" />
                          <p className="text-xs font-mono text-gray-500">{contact.phone}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${contact.phone}`}
                        className="p-3 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                        title="Call Contact"
                      >
                        <Phone size={18} />
                      </a>
                      <button
                        onClick={() => contact.id && removeContact(contact.id)}
                        className="p-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remove Contact"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {contacts.length === 0 && (
                <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-lg">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-lg text-gray-400 mb-2">No emergency contacts added yet.</p>
                  <p className="text-sm text-gray-500">Add contacts who will be notified during an SOS alert.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Info & Stats */}
          <div className="col-span-1 space-y-6">
            {/* Quick Stats */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h4 className="text-sm font-bold tracking-widest mb-4 text-gray-400">CONTACT STATISTICS</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Contacts</p>
                  <p className="text-4xl font-bold text-green-400">{contacts.length}</p>
                </div>
                <div className="border-t border-gray-800 pt-4">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <p className="text-sm text-green-400 font-semibold">Ready to notify</p>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h4 className="text-sm font-bold tracking-widest mb-4 text-gray-400">HOW IT WORKS</h4>
              <ol className="space-y-3 text-xs text-gray-400">
                <li className="flex gap-3">
                  <span className="text-green-400 font-bold flex-shrink-0">1.</span>
                  <span>Add your trusted emergency contacts</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-400 font-bold flex-shrink-0">2.</span>
                  <span>When SOS is triggered, they&apos;re immediately notified</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-400 font-bold flex-shrink-0">3.</span>
                  <span>They receive your location and situation details</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-400 font-bold flex-shrink-0">4.</span>
                  <span>They can track your location in real-time</span>
                </li>
              </ol>
            </div>

            {/* Privacy Notice */}
            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-6">
              <h4 className="text-sm font-bold mb-2 text-blue-300 flex items-center gap-2">
                <Mail size={16} />
                Privacy & Security
              </h4>
              <p className="text-xs text-blue-200 leading-relaxed">
                All contact information is encrypted and secured. Notifications are only sent during active emergencies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
