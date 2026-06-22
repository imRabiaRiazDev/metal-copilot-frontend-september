import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  KanbanSquare,
  Plus,
  X,
  FileText,
  FileSignature,
  ShoppingCart,
  Loader2,
  Filter,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import dealService from '../../services/dealService';
import EmptyState from '../../components/EmptyState';
import Skeleton from '../../components/Skeleton';
import ContextMenu from '../../components/ContextMenu';
import toast from 'react-hot-toast';

const stages = [
  { key: 'inquiry', label: 'Inquiry', color: 'border-gold' },
  { key: 'quotation', label: 'Quotation', color: 'border-navy dark:border-gold' },
  { key: 'negotiation', label: 'Negotiation', color: 'border-amber' },
  { key: 'order', label: 'Order', color: 'border-emerald' },
  { key: 'fulfilled', label: 'Fulfilled', color: 'border-emerald' },
  { key: 'archived', label: 'Archived', color: 'border-slate-300 dark:border-white/20' },
];

const typeColors = {
  rfq: { border: 'border-l-gold', badge: 'bg-gold/10 text-gold border-gold/20' },
  quotation: { border: 'border-l-navy dark:border-l-gold', badge: 'bg-navy/10 text-navy dark:text-gold border-navy/20 dark:border-gold/20' },
  purchase_order: { border: 'border-l-emerald', badge: 'bg-emerald/10 text-emerald border-emerald/20' },
};

const typeLabels = {
  rfq: 'RFQ',
  quotation: 'Quotation',
  purchase_order: 'PO',
};

const DealCard = ({ deal, index }) => {
  const tc = typeColors[deal.type] || typeColors.rfq;

  return (
    <Draggable draggableId={String(deal.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white dark:bg-navy rounded-lg p-4 mb-3 border border-border-light dark:border-white/10 border-l-4 ${tc.border} shadow-sm transition-all duration-200 ${
            snapshot.isDragging ? 'kanban-card-dragging shadow-gold' : 'hover:shadow-gold card-hover'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono font-semibold uppercase tracking-wider border ${tc.badge}`}>
              {typeLabels[deal.type] || 'RFQ'}
            </span>
            <span className="text-[10px] font-mono text-slate-400 dark:text-white/60">{deal.number}</span>
          </div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-white mb-2 truncate">{deal.title}</h4>
          <div className="space-y-1 text-[11px] text-slate-400 dark:text-white/60">
            {deal.company && <p>{deal.company}</p>}
            {deal.value && <p className="font-mono font-medium text-slate-700 dark:text-white">${Number(deal.value).toLocaleString()}</p>}
            <div className="flex items-center justify-between">
              {deal.expected_date && (
                <span className="flex items-center gap-1">
                  <Calendar size={10} />
                  {new Date(deal.expected_date).toLocaleDateString()}
                </span>
              )}
              {deal.contact_person && <span>{deal.contact_person}</span>}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

const DealDrawer = ({ deal, onClose, onSave }) => {
  const isNew = !deal?.id;
  const [form, setForm] = useState({
    title: '',
    type: 'rfq',
    stage: 'inquiry',
    value: '',
    probability: '',
    expected_date: '',
    company: '',
    contact_person: '',
    notes: '',
    ...deal,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-navy shadow-xl border-l border-border-light dark:border-white/10 animate-slideInRight overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-navy border-b border-border-light dark:border-white/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-white">
            {isNew ? 'New Deal' : `Deal ${deal.number}`}
          </h2>
          <button onClick={onClose} className="text-slate-400 dark:text-white/60 hover:text-slate-700 dark:hover:text-white">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60">Title</label>
            <input name="title" value={form.title} onChange={handleChange} required
              className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60">Type</label>
              <select name="type" value={form.type} onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold">
                <option value="rfq">RFQ</option>
                <option value="quotation">Quotation</option>
                <option value="purchase_order">Purchase Order</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60">Stage</label>
              <select name="stage" value={form.stage} onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold">
                {stages.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60">Value ($)</label>
              <input name="value" type="number" value={form.value} onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60">Probability (%)</label>
              <input name="probability" type="number" value={form.probability} onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60">Expected Date</label>
            <input name="expected_date" type="date" value={form.expected_date} onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60">Company</label>
            <input name="company" value={form.company} onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60">Contact Person</label>
            <input name="contact_person" value={form.contact_person} onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={4}
              className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit"
              className="flex-1 py-2.5 px-4 bg-gold text-white font-semibold rounded-lg text-sm hover:bg-gold-dark transition-all duration-200">
              {isNew ? 'Create Deal' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose}
              className="py-2.5 px-4 rounded-lg border border-border-light dark:border-white/20 text-slate-400 dark:text-white/60 hover:text-slate-700 dark:hover:text-white text-sm transition-all duration-200">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Deals = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const queryClient = useQueryClient();

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: () => dealService.getDeals(),
  });

  const createMutation = useMutation({
    mutationFn: dealService.createDeal,
    onSuccess: () => {
      queryClient.invalidateQueries(['deals']);
      setDrawerOpen(false);
      toast.success('Deal created');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => dealService.updateDeal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['deals']);
      toast.success('Deal updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: dealService.deleteDeal,
    onSuccess: () => {
      queryClient.invalidateQueries(['deals']);
      toast.success('Deal deleted');
    },
  });

  const getStageDeals = (stage) => deals.filter((d) => d.stage === stage);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const dealId = parseInt(draggableId);
    const newStage = destination.droppableId;
    const deal = deals.find((d) => d.id === dealId);

    if (deal && deal.stage !== newStage) {
      updateMutation.mutate(
        { id: dealId, data: { stage: newStage } },
        {
          onSuccess: () => {
            toast(
              (t) => (
                <span>
                  {deal.number || `Deal #${dealId}`} moved to {stages.find((s) => s.key === newStage)?.label}
                  <button
                    onClick={() => {
                      updateMutation.mutate({ id: dealId, data: { stage: deal.stage } });
                      toast.dismiss(t.id);
                    }}
                    className="ml-3 text-gold font-semibold underline"
                  >
                    Undo
                  </button>
                </span>
              ),
              { duration: 5000 }
            );
          },
        }
      );
    }
  };

  const handleDrawerSave = (data) => {
    if (editingDeal?.id) {
      updateMutation.mutate({ id: editingDeal.id, data });
    } else {
      createMutation.mutate(data);
    }
    setEditingDeal(null);
  };

  const openEdit = (deal) => {
    setEditingDeal(deal);
    setDrawerOpen(true);
  };

  const handleContextMenu = (e, deal) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, deal });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-100px)] gap-3">
        <Loader2 size={32} className="animate-spin text-gold" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/60">Loading pipeline...</span>
      </div>
    );
  }

  return (
    <div className="min-h-0 w-full animate-fadeInUp">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-700 dark:text-white mb-1">
            <KanbanSquare size={28} className="inline mr-2 text-gold" strokeWidth={1.5} />
            Deals Pipeline
          </h1>
          <p className="text-sm text-slate-400 dark:text-white/60">Track RFQs, quotations, and purchase orders</p>
        </div>
        <button
          onClick={() => { setEditingDeal(null); setDrawerOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold text-white rounded-lg text-sm font-semibold hover:bg-gold-dark transition-all duration-200 shadow-gold"
        >
          <Plus size={18} />
          New Deal
        </button>
      </div>

      {deals.length === 0 ? (
        <EmptyState
          icon={KanbanSquare}
          title="Start your pipeline"
          description="Create your first deal to begin tracking RFQs, quotations, and orders."
          action={() => { setEditingDeal(null); setDrawerOpen(true); }}
          actionLabel="Create Deal"
        />
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 pb-4 overflow-x-auto" style={{ minHeight: 'calc(100vh - 200px)' }}>
            {stages.map((stage) => {
              const stageDeals = getStageDeals(stage.key);
              return (
                <div key={stage.key} className="flex-shrink-0 w-72">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${stage.color.replace('border-', 'bg-')}`} />
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-white">{stage.label}</h3>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-white/60 bg-ivory dark:bg-navy-light px-1.5 py-0.5 rounded">
                        {stageDeals.length}
                      </span>
                    </div>
                  </div>
                  <Droppable droppableId={stage.key}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[200px] rounded-xl p-3 transition-all duration-200 ${
                          snapshot.isDraggingOver
                            ? 'bg-gold/5 border-2 border-dashed border-gold/30'
                            : 'bg-ivory dark:bg-navy-light border border-border-light dark:border-white/10'
                        }`}
                      >
                        {stageDeals.map((deal, index) => (
                          <div key={deal.id} onClick={() => openEdit(deal)} onContextMenu={(e) => handleContextMenu(e, deal)}>
                            <DealCard deal={deal} index={index} />
                          </div>
                        ))}
                        {provided.placeholder}
                        {stageDeals.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex flex-col items-center justify-center py-8 text-slate-300 dark:text-white/20">
                            <p className="text-[11px] font-mono">Drop deals here</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {drawerOpen && (
        <DealDrawer
          deal={editingDeal}
          onClose={() => { setDrawerOpen(false); setEditingDeal(null); }}
          onSave={handleDrawerSave}
        />
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={[
            { label: 'Edit', icon: FileText, action: () => { openEdit(contextMenu.deal); setContextMenu(null); } },
            { label: 'Delete', icon: X, danger: true, action: () => { deleteMutation.mutate(contextMenu.deal.id); setContextMenu(null); } },
          ]}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default Deals;
