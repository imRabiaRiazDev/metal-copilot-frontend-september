import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Command } from 'cmdk';
import contactService from '../services/contactService';
import dealService from '../services/dealService';
import taskService from '../services/taskService';
import { Search, Users, KanbanSquare, CheckSquare, ArrowRight } from 'lucide-react';

const CommandPalette = ({ onClose }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts', 'all'],
    queryFn: () => contactService.getContacts(),
    enabled: true,
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['deals'],
    queryFn: () => dealService.getDeals(),
    enabled: true,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskService.getTasks(),
    enabled: true,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const navigateTo = useCallback((path) => {
    navigate(path);
    onClose();
  }, [navigate, onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 scrim backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-navy rounded-xl shadow-2xl border border-border-light dark:border-white/10 overflow-hidden animate-fadeInUp">
        <Command className="w-full">
          <div className="flex items-center border-b border-border-light dark:border-white/10 px-4">
            <Search size={16} className="text-slate-400 dark:text-white/60 mr-3" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search contacts, deals, tasks..."
              className="w-full py-3.5 text-sm bg-transparent text-slate-700 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/30 outline-none"
              autoFocus
            />
          </div>
          <Command.List className="max-h-64 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-slate-400 dark:text-white/60 font-mono">
              No results found
            </Command.Empty>

            {contacts.length > 0 && (
              <Command.Group heading={
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-white/60 px-2 py-1.5">Contacts</span>
              }>
                {contacts.slice(0, 5).map((c) => (
                  <Command.Item
                    key={`c-${c.id}`}
                    onSelect={() => navigateTo('/contacts')}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 dark:text-white cursor-pointer aria-selected:bg-gold/10 transition-all"
                  >
                    <Users size={16} className="text-gold" />
                    <span>{c.company_name || c.contact_person}</span>
                    <span className="ml-auto text-[10px] text-slate-400 dark:text-white/60 font-mono">{c.type}</span>
                    <ArrowRight size={14} className="text-slate-300 dark:text-white/20" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {deals.length > 0 && (
              <Command.Group heading={
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-white/60 px-2 py-1.5">Deals</span>
              }>
                {deals.slice(0, 5).map((d) => (
                  <Command.Item
                    key={`d-${d.id}`}
                    onSelect={() => navigateTo('/deals')}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 dark:text-white cursor-pointer aria-selected:bg-gold/10 transition-all"
                  >
                    <KanbanSquare size={16} className="text-gold" />
                    <span>{d.title || d.number}</span>
                    <span className="ml-auto text-[10px] text-slate-400 dark:text-white/60 font-mono">{d.stage}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {tasks.length > 0 && (
              <Command.Group heading={
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-white/60 px-2 py-1.5">Tasks</span>
              }>
                {tasks.slice(0, 5).map((t) => (
                  <Command.Item
                    key={`t-${t.id}`}
                    onSelect={() => navigateTo('/tasks')}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 dark:text-white cursor-pointer aria-selected:bg-gold/10 transition-all"
                  >
                    <CheckSquare size={16} className="text-gold" />
                    <span>{t.title}</span>
                    {t.priority && (
                      <span className="text-[10px] font-mono text-amber">{t.priority}</span>
                    )}
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            <Command.Group heading={
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-white/60 px-2 py-1.5">Quick Actions</span>
            }>
              <Command.Item onSelect={() => navigateTo('/contacts')}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 dark:text-white cursor-pointer aria-selected:bg-gold/10">
                <Users size={16} className="text-gold" /> Go to Contacts
              </Command.Item>
              <Command.Item onSelect={() => navigateTo('/deals')}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 dark:text-white cursor-pointer aria-selected:bg-gold/10">
                <KanbanSquare size={16} className="text-gold" /> Go to Deals Pipeline
              </Command.Item>
              <Command.Item onSelect={() => navigateTo('/tasks')}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 dark:text-white cursor-pointer aria-selected:bg-gold/10">
                <CheckSquare size={16} className="text-gold" /> Go to Tasks
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
};

export default CommandPalette;
