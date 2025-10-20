import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, Phone, Building2, StickyNote, CircleDollarSign, Tag } from 'lucide-react';
import useCRMStore from '../store/useCRMStore.js';
import { api } from '../lib/api.js';

function LeadModal({ open, lead, onClose }) {
  const columns = useCRMStore((state) => state.columns);
  const tagsPalette = useCRMStore((state) => state.tagsPalette);
  const upsertLead = useCRMStore((state) => state.upsertLead);
  const removeLead = useCRMStore((state) => state.removeLead);

  const [formState, setFormState] = useState(lead);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormState(lead);
  }, [lead]);

  const columnOptions = useMemo(() => columns.sort((a, b) => a.order - b.order), [columns]);

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleTag = (tagId) => {
    setFormState((prev) => {
      const tags = new Set(prev.tags || []);
      if (tags.has(tagId)) {
        tags.delete(tagId);
      } else {
        tags.add(tagId);
      }
      return { ...prev, tags: Array.from(tags) };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { lead: updatedLead } = await api.updateLead(lead.id, formState);
      upsertLead(updatedLead);
      toast.success('Lead atualizado com sucesso!');
      onClose();
    } catch (error) {
      console.error(error); // eslint-disable-line no-console
      toast.error('Erro ao atualizar lead');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmation = window.confirm('Deseja remover este lead do funil?');
    if (!confirmation) return;
    try {
      await api.deleteLead(lead.id);
      removeLead(lead.id);
      toast.success('Lead removido');
      onClose();
    } catch (error) {
      console.error(error); // eslint-disable-line no-console
      toast.error('Não foi possível remover o lead');
    }
  };

  return (
    <AnimatePresence>
      {open && lead ? (
        <Dialog as={motion.div} open={open} onClose={onClose} className="relative z-50">
          <motion.div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <div className="fixed inset-0 overflow-y-auto px-4 py-10 sm:px-6">
            <div className="mx-auto max-w-2xl">
              <Dialog.Panel
                as={motion.div}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="rounded-3xl border border-slate-200/60 bg-white/95 p-6 shadow-2xl dark:border-slate-800/80 dark:bg-slate-900/90"
              >
                <Dialog.Title className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  {lead.name}
                </Dialog.Title>
                <p className="text-sm text-slate-500 dark:text-slate-400">{lead.id}</p>

                <div className="mt-6 grid gap-4">
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    Nome do lead
                    <input
                      type="text"
                      value={formState?.name || ''}
                      onChange={(event) => handleChange('name', event.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                      Email
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          value={formState?.email || ''}
                          onChange={(event) => handleChange('email', event.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                      </div>
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                      Telefone
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="tel"
                          value={formState?.phone || ''}
                          onChange={(event) => handleChange('phone', event.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                      </div>
                    </label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                      Empresa
                      <div className="relative">
                        <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={formState?.company || ''}
                          onChange={(event) => handleChange('company', event.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                      </div>
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                      Valor potencial
                      <div className="relative">
                        <CircleDollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="number"
                          value={formState?.value || ''}
                          onChange={(event) => handleChange('value', event.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                      </div>
                    </label>
                  </div>
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    Notas
                    <div className="relative">
                      <StickyNote className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <textarea
                        rows={4}
                        value={formState?.notes || ''}
                        onChange={(event) => handleChange('notes', event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    Etapa do funil
                    <select
                      value={formState?.columnId || ''}
                      onChange={(event) => handleChange('columnId', event.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      {columnOptions.map((column) => (
                        <option key={column.id} value={column.id}>
                          {column.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Etiquetas</span>
                    <div className="flex flex-wrap gap-2">
                      {tagsPalette.map((tag) => {
                        const isActive = formState?.tags?.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleToggleTag(tag.id)}
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition ${isActive ? 'border-transparent text-white shadow-sm' : 'border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-300'}`}
                            style={{
                              backgroundColor: isActive ? tag.color : `${tag.color}20`,
                              color: isActive ? '#fff' : tag.color
                            }}
                          >
                            <Tag className="h-3.5 w-3.5" />
                            {tag.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-500/10 dark:border-red-500/40 dark:text-red-300"
                  >
                    Remover lead
                  </button>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="inline-flex items-center justify-center rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 disabled:opacity-60"
                    >
                      Salvar alterações
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      ) : null}
    </AnimatePresence>
  );
}

export default LeadModal;
