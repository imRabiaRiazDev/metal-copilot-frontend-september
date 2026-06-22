import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Building2,
  UserCircle,
  Search,
  Plus,
  X,
  Pencil,
  Trash2,
  Loader2,
  MoreHorizontal,
  Mail,
} from 'lucide-react';
import contactService from '../../services/contactService';
import EmptyState from '../../components/EmptyState';
import Skeleton from '../../components/Skeleton';
import ContextMenu from '../../components/ContextMenu';
import toast from 'react-hot-toast';

const typeStyles = {
  supplier: 'bg-emerald/10 text-emerald border-emerald/20',
  client: 'bg-navy/10 text-navy dark:text-gold border-navy/20 dark:border-gold/20',
};

const tabs = [
  { key: 'all', label: 'All', icon: Users },
  { key: 'supplier', label: 'Suppliers', icon: Building2 },
  { key: 'client', label: 'Clients', icon: UserCircle },
];

const InlineEdit = ({ value, onSave, onCancel }) => {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSave(editValue);
    if (e.key === 'Escape') onCancel();
  };

  return (
    <input
      ref={inputRef}
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => onSave(editValue)}
      className="w-full px-2 py-1 text-sm border border-gold rounded bg-white dark:bg-navy-light text-slate-700 dark:text-white outline-none"
    />
  );
};

const ContactDrawer = ({ contact, onClose, onSave, onDelete }) => {
  const isNew = !contact?.id;
  const [form, setForm] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    type: 'supplier',
    tags: '',
    tax_id: '',
    notes: '',
    ...contact,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [] });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-navy shadow-xl border-l border-border-light dark:border-white/10 animate-slideInRight overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-navy border-b border-border-light dark:border-white/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-white">
            {isNew ? 'Add Contact' : 'Edit Contact'}
          </h2>
          <button onClick={onClose} className="text-slate-400 dark:text-white/60 hover:text-slate-700 dark:hover:text-white">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60">Company Name</label>
            <input name="company_name" value={form.company_name} onChange={handleChange} required
              className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60">Contact Person</label>
            <input name="contact_person" value={form.contact_person} onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60">Type</label>
            <select name="type" value={form.type} onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold">
              <option value="supplier">Supplier</option>
              <option value="client">Client</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60">Tags (comma separated)</label>
            <input name="tags" value={form.tags} onChange={handleChange} placeholder="metal, steel, premium"
              className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60">Tax / VAT ID</label>
            <input name="tax_id" value={form.tax_id} onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={4}
              className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold resize-none" />
          </div>
          <div className="flex items-center justify-between pt-2">
            {!isNew && (
              <button type="button" onClick={() => onDelete(contact)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-danger/30 text-danger hover:bg-danger/10 text-sm font-medium transition-all duration-200">
                <Trash2 size={16} />
                Delete
              </button>
            )}
            <div className="flex gap-3 ml-auto">
              <button type="button" onClick={onClose}
                className="py-2.5 px-4 rounded-lg border border-border-light dark:border-white/20 text-slate-400 dark:text-white/60 hover:text-slate-700 dark:hover:text-white text-sm transition-all duration-200">
                Cancel
              </button>
              <button type="submit"
                className="py-2.5 px-4 bg-gold text-white font-semibold rounded-lg text-sm hover:bg-gold-dark transition-all duration-200">
                {isNew ? 'Create Contact' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const Contacts = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const searchTimer = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts', activeTab],
    queryFn: () => contactService.getContacts(activeTab === 'all' ? null : activeTab),
  });

  const createMutation = useMutation({
    mutationFn: contactService.createContact,
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
      setDrawerOpen(false);
      toast.success('Contact created');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => contactService.updateContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
      toast.success('Contact updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: contactService.deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
      toast.success('Contact deleted');
    },
  });

  const filtered = useMemo(() => {
    if (!debouncedSearch) return contacts;
    const q = debouncedSearch.toLowerCase();
    return contacts.filter(
      (c) =>
        (c.company_name || '').toLowerCase().includes(q) ||
        (c.contact_person || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        (c.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }, [contacts, debouncedSearch]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === filtered.length) {
      setSelected([]);
    } else {
      setSelected(filtered.map((c) => c.id));
    }
  };

  const handleCellSave = (contact, field, value) => {
    updateMutation.mutate({ id: contact.id, data: { [field]: value } });
    setEditingCell(null);
  };

  const handleDrawerSave = (data) => {
    if (editingContact?.id) {
      updateMutation.mutate({ id: editingContact.id, data });
    } else {
      createMutation.mutate(data);
    }
    setEditingContact(null);
  };

  const openEdit = (contact) => {
    setEditingContact(contact);
    setDrawerOpen(true);
  };

  const handleContextMenu = (e, contact) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, contact });
  };

  const bulkDelete = () => {
    selected.forEach((id) => deleteMutation.mutate(id));
    setSelected([]);
  };

  const columns = [
    { key: 'company_name', label: 'Company', width: 'w-1/5' },
    { key: 'contact_person', label: 'Contact Person', width: 'w-1/6' },
    { key: 'email', label: 'Email', width: 'w-1/5' },
    { key: 'phone', label: 'Phone', width: 'w-1/6' },
    { key: 'type', label: 'Type', width: 'w-1/12' },
    { key: 'tags', label: 'Tags', width: 'w-1/6' },
  ];

  return (
    <div className="min-h-screen animate-fadeInUp">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-700 dark:text-white mb-1">
            <Users size={28} className="inline mr-2 text-gold" strokeWidth={1.5} />
            Contacts
          </h1>
          <p className="text-sm text-slate-400 dark:text-white/60">Manage suppliers and clients</p>
        </div>
        <button
          onClick={() => { setEditingContact(null); setDrawerOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold text-white rounded-lg text-sm font-semibold hover:bg-gold-dark transition-all duration-200 shadow-gold"
        >
          <Plus size={18} />
          Add Contact
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-gold text-white shadow-gold'
                  : 'bg-white dark:bg-navy text-slate-400 dark:text-white/60 border border-border-light dark:border-white/10 hover:border-gold'
              }`}
            >
              <Icon size={16} strokeWidth={1.5} />
              {tab.label}
            </button>
          );
        })}
        <div className="relative ml-auto">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/60" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="w-64 pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-navy border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm placeholder:text-slate-300 dark:placeholder:text-white/30 focus:outline-none focus:border-gold transition-all"
          />
        </div>
      </div>

      {selected.length > 0 && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-gold/10 border border-gold/30 rounded-lg">
          <span className="text-sm text-slate-700 dark:text-white font-medium">{selected.length} selected</span>
          <button onClick={bulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-danger bg-danger/10 rounded hover:bg-danger/20 transition-all">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}

      {isLoading ? (
        <Skeleton rows={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Your trusted network begins here"
          description="Add your first supplier or client to start building your contact network."
          action={() => { setEditingContact(null); setDrawerOpen(true); }}
          actionLabel="Add Contact"
        />
      ) : (
        <div className="bg-white dark:bg-navy border border-border-light dark:border-white/10 rounded-xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-border-light dark:border-white/10 bg-ivory dark:bg-navy-light">
                  <th className="px-4 py-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={selected.length === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-border-light dark:border-white/20 text-gold focus:ring-gold"
                    />
                  </th>
                  {columns.map((col) => (
                    <th key={col.key} className={`px-4 py-3.5 text-left text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/60 font-mono ${col.width}`}>
                      {col.label}
                    </th>
                  ))}
                  <th className="px-4 py-3.5 w-16" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((contact) => (
                  <tr
                    key={contact.id}
                    className={`border-b border-border-light dark:border-white/5 transition-all duration-150 hover:shadow-gold hover:bg-gold/[0.02] cursor-pointer ${
                      selected.includes(contact.id) ? 'selected-row' : ''
                    }`}
                    onContextMenu={(e) => handleContextMenu(e, contact)}
                    onClick={() => openEdit(contact)}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(contact.id)}
                        onChange={() => toggleSelect(contact.id)}
                        className="rounded border-border-light dark:border-white/20 text-gold focus:ring-gold"
                      />
                    </td>
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                        {editingCell?.id === contact.id && editingCell?.field === col.key ? (
                          <InlineEdit
                            value={contact[col.key] || (col.key === 'tags' ? (contact.tags || []).join(', ') : '')}
                            onSave={(val) => handleCellSave(contact, col.key, col.key === 'tags' ? val.split(',').map(t => t.trim()) : val)}
                            onCancel={() => setEditingCell(null)}
                          />
                        ) : col.key === 'type' ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-mono font-semibold uppercase tracking-wider border ${typeStyles[contact.type] || ''}`}>
                            {contact.type}
                          </span>
                        ) : col.key === 'tags' ? (
                          <div className="flex gap-1 flex-wrap">
                            {(contact.tags || []).slice(0, 3).map((tag, i) => (
                              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono bg-ivory dark:bg-navy-light text-slate-400 dark:text-white/60 border border-border-light dark:border-white/10">
                                {tag}
                              </span>
                            ))}
                            {(contact.tags || []).length > 3 && (
                              <span className="text-[9px] text-slate-400 dark:text-white/60 font-mono">+{contact.tags.length - 3}</span>
                            )}
                          </div>
                        ) : (
                          <div
                            className="flex items-center gap-2 cursor-pointer group"
                            onDoubleClick={() => setEditingCell({ id: contact.id, field: col.key })}
                          >
                            <span className="text-sm text-slate-700 dark:text-white">
                              {contact[col.key] || '-'}
                            </span>
                            <Pencil size={12} className="text-slate-300 dark:text-white/20 group-hover:text-gold opacity-0 group-hover:opacity-100 transition-all" />
                          </div>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(contact)}
                        className="text-slate-400 dark:text-white/60 hover:text-gold transition-all"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {drawerOpen && (
        <ContactDrawer
          contact={editingContact}
          onClose={() => { setDrawerOpen(false); setEditingContact(null); }}
          onSave={handleDrawerSave}
          onDelete={(contact) => { setDrawerOpen(false); setEditingContact(null); deleteMutation.mutate(contact.id); }}
        />
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={[
            { label: 'Edit', icon: Pencil, action: () => { openEdit(contextMenu.contact); setContextMenu(null); } },
            { label: 'Copy Email', icon: Mail, action: () => { navigator.clipboard.writeText(contextMenu.contact.email || ''); toast.success('Email copied'); setContextMenu(null); } },
            { label: 'Delete', icon: Trash2, danger: true, action: () => { deleteMutation.mutate(contextMenu.contact.id); setContextMenu(null); } },
          ]}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default Contacts;
