import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckSquare,
  Plus,
  X,
  Check,
  Loader2,
  Calendar,
  AlertCircle,
  Flag,
} from 'lucide-react';
import taskService from '../../services/taskService';
import EmptyState from '../../components/EmptyState';
import Skeleton from '../../components/Skeleton';
import toast from 'react-hot-toast';
import { format, isToday, isPast, isFuture, parseISO, differenceInDays } from 'date-fns';

const priorityColors = {
  low: 'bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-white/60 border-slate-300 dark:border-white/20',
  medium: 'bg-gold/10 text-gold border-gold/20',
  high: 'bg-amber/10 text-amber border-amber/20',
};

const TaskCard = ({ task, onToggle, onDelete }) => {
  const isOverdue = task.due_date && isPast(parseISO(task.due_date)) && !task.completed;
  const isDueToday = task.due_date && isToday(parseISO(task.due_date)) && !task.completed;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border transition-all duration-200 ${
        task.completed
          ? 'bg-ivory dark:bg-navy-light border-border-light dark:border-white/10 opacity-60'
          : isOverdue
          ? 'bg-amber/5 border-amber/20'
          : 'bg-white dark:bg-navy border-border-light dark:border-white/10 shadow-sm'
      } hover:shadow-gold card-hover`}
    >
      <button
        onClick={() => onToggle(task)}
        className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
          task.completed
            ? 'bg-emerald border-emerald text-white'
            : 'border-slate-300 dark:border-white/30 hover:border-gold'
        }`}
      >
        {task.completed && <Check size={12} strokeWidth={3} />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-medium ${task.completed ? 'line-through text-slate-400 dark:text-white/60' : 'text-slate-700 dark:text-white'}`}>
            {task.title}
          </span>
          {task.priority && (
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-mono font-semibold uppercase tracking-wider border ${priorityColors[task.priority] || ''}`}>
              {task.priority}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-white/60">
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
        onClick={() => onDelete(task.id)}
        className="text-slate-300 dark:text-white/20 hover:text-danger transition-all opacity-0 group-hover:opacity-100"
      >
        <X size={14} />
      </button>
    </div>
  );
};

const Tasks = () => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskService.getTasks(),
  });

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
    updateMutation.mutate({ id: task.id, data: { completed: !task.completed } });
  };

  const grouped = useMemo(() => {
    const groups = { overdue: [], today: [], upcoming: [], noDate: [] };

    tasks.forEach((task) => {
      if (task.completed) return;
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

  const completedTasks = tasks.filter((t) => t.completed);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    createMutation.mutate({ title: newTaskTitle.trim() });
  };

  const addInlineTask = (group) => {
    createMutation.mutate({ title: newTaskTitle, stage: group });
    setNewTaskTitle('');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-100px)] gap-3">
        <Loader2 size={32} className="animate-spin text-gold" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/60">Loading tasks...</span>
      </div>
    );
  }

  const renderGroup = (label, items, groupKey, showAdd = false) => (
    <div className="mb-8" key={groupKey}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-white">{label}</h2>
          <span className="text-[10px] font-mono text-slate-400 dark:text-white/60 bg-ivory dark:bg-navy-light px-1.5 py-0.5 rounded">
            {items.length}
          </span>
        </div>
        {showAdd && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 text-xs text-gold hover:text-gold-dark transition-all"
          >
            <Plus size={14} /> Add
          </button>
        )}
      </div>
      <div className="space-y-2">
        {items.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggle={toggleComplete}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        ))}
        {items.length === 0 && (
          <p className="text-xs text-slate-300 dark:text-white/20 font-mono text-center py-6">
            No tasks in this group
          </p>
        )}
      </div>
      {showAdd && showAddForm && (
        <form onSubmit={handleQuickAdd} className="mt-3 flex items-center gap-2">
          <input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-navy border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm placeholder:text-slate-300 dark:placeholder:text-white/30 focus:outline-none focus:border-gold"
            autoFocus
          />
          <button
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="px-4 py-2 bg-gold text-white rounded-lg text-sm font-medium hover:bg-gold-dark disabled:opacity-50 transition-all"
          >
            Add
          </button>
          <button type="button" onClick={() => setShowAddForm(false)} className="p-2 text-slate-400 dark:text-white/60 hover:text-slate-700 dark:hover:text-white">
            <X size={18} />
          </button>
        </form>
      )}
    </div>
  );

  return (
    <div className="min-h-screen animate-fadeInUp">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-700 dark:text-white mb-1">
            <CheckSquare size={28} className="inline mr-2 text-gold" strokeWidth={1.5} />
            Tasks & Reminders
          </h1>
          <p className="text-sm text-slate-400 dark:text-white/60">Stay on top of your workflow</p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks yet"
          description="Create your first task to stay organized."
          action={() => setShowAddForm(true)}
          actionLabel="Add Task"
        />
      ) : (
        <div className="max-w-3xl">
          {renderGroup('Overdue', grouped.overdue, 'overdue')}
          {renderGroup('Today', grouped.today, 'today', true)}
          {renderGroup('Upcoming', grouped.upcoming, 'upcoming')}
          {renderGroup('No Date', grouped.noDate, 'noDate')}

          {completedTasks.length > 0 && (
            <div className="mt-10 pt-8 border-t border-border-light dark:border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-slate-400 dark:text-white/60">Completed</h2>
                <span className="text-[10px] font-mono text-slate-400 dark:text-white/60 bg-ivory dark:bg-navy-light px-1.5 py-0.5 rounded">
                  {completedTasks.length}
                </span>
              </div>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={toggleComplete}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Tasks;
