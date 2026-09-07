import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X,
  Clock,
  MessageSquare,
  Send,
} from 'lucide-react';
import activityService from '../services/activityService';
import { format } from 'date-fns';

const ActivityTimeline = ({ entityType, entityId }) => {
  const [noteText, setNoteText] = useState('');
  const queryClient = useQueryClient();

  const { data: activities = [] } = useQuery({
    queryKey: ['activity', entityType, entityId],
    queryFn: () => activityService.getActivity(entityType, entityId),
    enabled: !!entityId,
  });

  const noteMutation = useMutation({
    mutationFn: () => activityService.addNote(entityType, entityId, noteText),
    onSuccess: () => {
      queryClient.invalidateQueries(['activity', entityType, entityId]);
      setNoteText('');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-2.5">
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add a note..."
          rows={3}
          className="flex-1 px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm placeholder:text-slate-300 dark:placeholder:text-white/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/25 resize-none"
        />
        <button
          onClick={() => noteMutation.mutate()}
          disabled={!noteText.trim() || noteMutation.isPending}
          aria-label="Send note"
          className="self-end p-2.5 bg-gold text-navy rounded-lg hover:bg-gold-dark disabled:opacity-50 transition-all active:scale-95"
        >
          <Send size={16} />
        </button>
      </div>

      <div className="relative">
        <div className="absolute left-[7px] top-0 bottom-0 w-px bg-gold/25" />
        <div className="space-y-6">
          {activities.map((activity) => (
            <div key={activity.id} className="relative pl-8">
              <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-gold bg-white dark:bg-navy flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-gold" />
              </div>
              <div className="text-sm">
                <p className="text-slate-700 dark:text-white font-medium leading-snug">{activity.text}</p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 dark:text-white/60">
                  <Clock size={11} />
                  {activity.created_at && format(new Date(activity.created_at), 'dd/MM/yyyy HH:mm')}
                  {activity.user && <><span>·</span><span>{activity.user}</span></>}
                </div>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-xs text-slate-300 dark:text-white/20 font-mono text-center py-4">
              No activity recorded yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const DetailDrawer = ({ title, entityType, entityId, onClose, children }) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 scrim backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-navy shadow-elevated border-l border-border-light dark:border-white/10 animate-slideInRight overflow-y-auto">
        <div className="sticky top-0 bg-white/90 dark:bg-navy/90 backdrop-blur-md border-b border-border-light dark:border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 dark:text-white/60 hover:text-slate-700 dark:hover:text-white rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
          {entityType && entityId && (
            <div className="mt-8 pt-6 border-t border-border-light dark:border-white/10">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-white flex items-center gap-2 mb-4">
                <MessageSquare size={16} className="text-gold" />
                Activity & Notes
              </h3>
              <ActivityTimeline entityType={entityType} entityId={entityId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailDrawer;
