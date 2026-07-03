import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Plus,
  X,
  Check,
  Loader2,
  Calendar,
  AlertCircle,
  Flag,
  FileSearch,
} from 'lucide-react';
import taskService from '../../services/taskService';
import EmptyState from '../../components/EmptyState';
import Skeleton from '../../components/Skeleton';
import toast from 'react-hot-toast';
import { format, isToday, isPast, parseISO } from 'date-fns';

const priorityColors = {
  low: 'bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-white/60 border-slate-300 dark:border-white/20',
  medium: 'bg-gold/10 text-gold border-gold/20',
  high: 'bg-amber/10 text-amber border-amber/20',
};

const columns = [
  { key: 'overdue', label: 'Overdue', color: 'border-amber' },
  { key: 'today', label: 'Today', color: 'border-gold' },
  { key: 'upcoming', label: 'Upcoming', color: 'border-navy dark:border-gold' },
  { key: 'noDate', label: 'No Date', color: 'border-slate-300 dark:border-white/20' },
  { key: 'completed', label: 'Completed', color: 'border-emerald' },
];

const TaskCard = ({ task, onToggle, onDelete, onClick, onRFQClick }) => {
  const isOverdue = task.due_date && isPast(parseISO(task.due_date)) && !task.completed;
  const isDueToday = task.due_date && isToday(parseISO(task.due_date)) && !task.completed;

  const columnColor = task.completed
    ? 'border-l-emerald'
    : isOverdue
    ? 'border-l-amber'
    : isDueToday
    ? 'border-l-gold'
    : 'border-l-navy dark:border-l-gold';

  // Extract RFQ number from title if present - more flexible pattern
  const rfqMatch = task.title.match(/RFQ[-\s]?([A-Z0-9-]+)/i);
  const rfqNumber = rfqMatch ? `RFQ-${rfqMatch[1]}` : null;

  // Split title into parts
  let titleBeforeRFQ = task.title;
  let titleAfterRFQ = '';
  if (rfqNumber) {
    const parts = task.title.split(new RegExp(rfqMatch[0], 'i'));
    titleBeforeRFQ = parts[0] || '';
    titleAfterRFQ = parts[1] || '';
  }

  const handleCardClick = () => {
    if (rfqNumber) {
      onRFQClick(task);
    } else {
      onClick(task);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group bg-white dark:bg-navy rounded-lg p-4 mb-3 border border-border-light dark:border-white/10 border-l-4 ${columnColor} shadow-sm transition-all duration-200 hover:shadow-gold card-hover cursor-pointer ${rfqNumber ? 'hover:border-gold' : ''}`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task);
          }}
          className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
            task.completed
              ? 'bg-emerald border-emerald text-white'
              : 'border-slate-300 dark:border-white/30 hover:border-gold'
          }`}
        >
          {task.completed && <Check size={12} strokeWidth={3} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-sm font-medium ${task.completed ? 'line-through text-slate-400 dark:text-white/60' : 'text-slate-700 dark:text-white'}`}>
              {titleBeforeRFQ}
              {rfqNumber && (
                <span className="text-gold font-mono mx-0.5">
                  {rfqNumber}
                </span>
              )}
              {titleAfterRFQ}
            </span>
            {task.priority && (
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-mono font-semibold uppercase tracking-wider border ${priorityColors[task.priority] || ''}`}>
                {task.priority}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-white/60 flex-wrap">
            {task.due_date && (
              <span className={`flex items-center gap-1 ${isOverdue ? 'text-amber font-semibold' : ''}`}>
                <Calendar size={11} />
                {format(parseISO(task.due_date), 'MMM d, yyyy')}
                {isOverdue && <AlertCircle size={11} />}
              </span>
            )}
            {task.entity_name && (
              <span>{task.entity_type === 'contact' ? 'Contact:' : 'Deal:'} {task.entity_name}</span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="text-slate-300 dark:text-white/20 hover:text-danger transition-all opacity-0 group-hover:opacity-100"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

const Tasks = () => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: tasksRaw, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskService.getTasks(),
  });
  const tasks = Array.isArray(tasksRaw) ? tasksRaw : (tasksRaw?.data ?? []);

  const createMutation = useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      setNewTaskTitle('');
      setShowAddForm(false);
      toast.success('Task added');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => taskService.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      toast.success('Task deleted');
    },
  });

  const toggleComplete = (task) => {
    const newStatus = !task.completed;
    updateMutation.mutate({ id: task.id, data: { completed: newStatus } });
    
    // If task is being completed, delete it after a short delay
    if (newStatus) {
      setTimeout(() => {
        deleteMutation.mutate(task.id);
      }, 1000);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleRFQClick = (task) => {
    // Extract RFQ number from title - more flexible pattern
    const rfqMatch = task.title.match(/RFQ[-\s]?([A-Z0-9-]+)/i);
    const rfqNumber = rfqMatch ? `RFQ-${rfqMatch[1]}` : null;
    
    console.log('Task title:', task.title);
    console.log('Extracted RFQ number:', rfqNumber);
    
    if (rfqNumber) {
      navigate(`/rfqs/${rfqNumber}`);
    } else if (task.order) {
      navigate(`/rfqs`, { state: { openRFQId: task.order.id } });
    }
  };

  const columnTasks = useMemo(() => {
    const groups = { overdue: [], today: [], upcoming: [], noDate: [], completed: [] };

    tasks.forEach((task) => {
      if (task.completed) {
        groups.completed.push(task);
        return;
      }
      if (!task.due_date) {
        groups.noDate.push(task);
      } else {
        const date = parseISO(task.due_date);
        if (isPast(date) && !isToday(date)) {
          groups.overdue.push(task);
        } else if (isToday(date)) {
          groups.today.push(task);
        } else {
          groups.upcoming.push(task);
        }
      }
    });

    return groups;
  }, [tasks]);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    createMutation.mutate({ title: newTaskTitle.trim() });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-100px)] gap-3">
        <Loader2 size={32} className="animate-spin text-gold" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/60">Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className="min-h-0 w-full animate-fadeInUp">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-700 dark:text-white mb-1">
            <CheckSquare size={28} className="inline mr-2 text-gold" strokeWidth={1.5} />
            Tasks & Reminders
          </h1>
          <p className="text-sm text-slate-400 dark:text-white/60">Stay on top of your workflow</p>
        </div>
      </div>

      {tasks.length === 0 && !showAddForm ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks yet"
          description="Create your first task to stay organized."
          action={() => setShowAddForm(true)}
          actionLabel="Add Task"
        />
      ) : (
        <div className="max-w-[calc(100vw-320px)] overflow-x-auto">
          <div className="flex gap-4 pb-4" style={{ minHeight: 'calc(100vh - 200px)', width: '1500px' }}>
          {columns.map((col) => {
            const items = columnTasks[col.key] || [];
            const isTodayCol = col.key === 'today';
            return (
              <div key={col.key} className="flex-shrink-0 w-72 min-w-[288px]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${col.color.replace('border-', 'bg-')}`} />
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-white">{col.label}</h3>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-white/60 bg-ivory dark:bg-navy-light px-1.5 py-0.5 rounded">
                      {items.length}
                    </span>
                  </div>
                  {isTodayCol && (
                    <button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-gold hover:text-gold-dark transition-all"
                    >
                      <Plus size={12} /> Add
                    </button>
                  )}
                </div>
                <div className="min-h-[200px] rounded-xl p-3 bg-ivory dark:bg-navy-light border border-border-light dark:border-white/10">
                  {items.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={toggleComplete}
                      onDelete={(id) => deleteMutation.mutate(id)}
                      onClick={() => handleTaskClick(task)}
                      onRFQClick={handleRFQClick}
                    />
                  ))}
                  {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-300 dark:text-white/20">
                      <p className="text-[11px] font-mono">No tasks</p>
                    </div>
                  )}
                  {isTodayCol && showAddForm && (
                    <form onSubmit={handleQuickAdd} className="mt-2">
                      <input
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="What needs to be done?"
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-navy border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm placeholder:text-slate-300 dark:placeholder:text-white/30 focus:outline-none focus:border-gold mb-2"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={!newTaskTitle.trim()}
                          className="flex-1 py-1.5 bg-gold text-white rounded text-xs font-medium hover:bg-gold-dark disabled:opacity-50 transition-all"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddForm(false)}
                          className="p-1.5 text-slate-400 dark:text-white/60 hover:text-slate-700 dark:hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        </div>
      )}

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedTask(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-navy shadow-xl border-l border-border-light dark:border-white/10 animate-slideInRight overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-navy border-b border-border-light dark:border-white/10 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-slate-700 dark:text-white font-mono">
                Task Details
              </h2>
              <button onClick={() => setSelectedTask(null)} className="text-slate-400 dark:text-white/60 hover:text-slate-700 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60 font-mono">Title</label>
                <p className="text-sm text-slate-700 dark:text-white">{selectedTask.title}</p>
              </div>

              {selectedTask.description && (
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60 font-mono">Description</label>
                  <p className="text-sm text-slate-700 dark:text-white">{selectedTask.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60 font-mono">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-mono font-semibold uppercase tracking-wider border ${
                    selectedTask.completed ? 'bg-emerald/10 text-emerald border-emerald/20' : 'bg-amber/10 text-amber border-amber/20'
                  }`}>
                    {selectedTask.completed ? 'Completed' : 'Pending'}
                  </span>
                </div>

                {selectedTask.priority && (
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60 font-mono">Priority</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-mono font-semibold uppercase tracking-wider border ${priorityColors[selectedTask.priority] || ''}`}>
                      {selectedTask.priority}
                    </span>
                  </div>
                )}
              </div>

              {selectedTask.due_date && (
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60 font-mono">Due Date</label>
                  <p className="text-sm text-slate-700 dark:text-white font-mono">
                    {format(parseISO(selectedTask.due_date), 'MMM d, yyyy')}
                  </p>
                </div>
              )}

              {selectedTask.order && (
                <div className="border-t border-border-light dark:border-white/10 pt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-3 text-slate-400 dark:text-white/60 font-mono">Related RFQ</p>
                  <button
                    onClick={() => {
                      // Extract RFQ number from title
                      const rfqMatch = selectedTask.title.match(/RFQ[-\s]?([A-Z0-9]+)/i);
                      const rfqNumber = rfqMatch ? `RFQ-${rfqMatch[1]}` : null;
                      
                      if (rfqNumber) {
                        navigate(`/rfqs/${rfqNumber}`);
                      } else {
                        navigate(`/rfqs`, { state: { openRFQId: selectedTask.order.id } });
                      }
                      setSelectedTask(null);
                    }}
                    className="w-full px-4 py-3 rounded-lg bg-gold/10 border border-gold/20 text-gold hover:bg-gold/20 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <FileSearch size={16} />
                    Open RFQ
                  </button>
                </div>
              )}

              {selectedTask.entity_name && (
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60 font-mono">
                    {selectedTask.entity_type === 'contact' ? 'Related Contact' : 'Related Deal'}
                  </label>
                  <p className="text-sm text-slate-700 dark:text-white">{selectedTask.entity_name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
