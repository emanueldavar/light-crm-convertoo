import React, { useEffect, useState } from 'react';
import CommentTimeline from './CommentTimeline';
import { getLeadComments, addLeadComment } from '../api/comments';
import { getLead, updateLead } from '../api/leads';
import useToast from '../hooks/useToast';

export default function LeadModal({ leadId, isOpen, onClose, onSaved }) {
  const [lead, setLead] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;

    (async () => {
      try {
        const l = await getLead(leadId);
        if (!mounted) return;
        setLead(l);
      } catch (err) {
        console.error('Failed to fetch lead', err);
      }

      try {
        const c = await getLeadComments(leadId);
        if (!mounted) return;
        setComments(c);
      } catch (err) {
        console.error('Failed to fetch comments', err);
      }
    })();

    return () => {
      mounted = false;
      setLead(null);
      setComments([]);
      setCommentText('');
    };
  }, [isOpen, leadId]);

  if (!isOpen) return null;
  if (!lead) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded p-6 w-full max-w-lg">Carregando...</div>
      </div>
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateLead(lead.id, {
        name: lead.name,
        company: lead.company,
        value: lead.value,
        tags: lead.tags,
        notes: lead.notes,
      });
      setLead(updated);
      toast.success('Lead atualizado com sucesso');
      if (onSaved) onSaved(updated);
      onClose();
    } catch (err) {
      console.error('Failed to update lead', err);
      toast.error('Falha ao atualizar lead');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddComment() {
    const text = commentText.trim();
    if (!text) return;
    try {
      const created = await addLeadComment(lead.id, text, 'Você');
      setComments((prev) => [...prev, created]);
      setCommentText('');
      toast.success('Comentário adicionado');
    } catch (err) {
      console.error('Failed to add comment', err);
      toast.error('Falha ao adicionar comentário');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black bg-opacity-40">
      <div className="bg-white rounded shadow-lg w-full max-w-3xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Editar Lead</h2>
          <button onClick={onClose} className="text-gray-500">Fechar</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input className="mt-1 block w-full border rounded p-2" value={lead.name || ''} onChange={(e) => setLead({ ...lead, name: e.target.value })} />

            <label className="block text-sm font-medium text-gray-700 mt-3">Empresa</label>
            <input className="mt-1 block w-full border rounded p-2" value={lead.company || ''} onChange={(e) => setLead({ ...lead, company: e.target.value })} />

            <label className="block text-sm font-medium text-gray-700 mt-3">Valor</label>
            <input type="number" className="mt-1 block w-full border rounded p-2" value={lead.value ?? ''} onChange={(e) => setLead({ ...lead, value: e.target.value ? Number(e.target.value) : null })} />

            <label className="block text-sm font-medium text-gray-700 mt-3">Etiquetas (JSON)</label>
            <input className="mt-1 block w-full border rounded p-2" value={JSON.stringify(lead.tags || [])} onChange={(e) => {
              try {
                setLead({ ...lead, tags: JSON.parse(e.target.value) });
              } catch (err) {
                // ignore parse errors while typing
              }
            }} />

            <label className="block text-sm font-medium text-gray-700 mt-3">Notas</label>
            <textarea className="mt-1 block w-full border rounded p-2" rows={4} value={lead.notes || ''} onChange={(e) => setLead({ ...lead, notes: e.target.value })} />

            <div className="mt-4 flex gap-2">
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">Salvar</button>
              <button onClick={onClose} className="px-4 py-2 border rounded">Cancelar</button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Interações</h3>
            <CommentTimeline comments={comments} />

            <div className="mt-3">
              <textarea rows={3} className="w-full border rounded p-2" placeholder="Escreva um comentário..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
              <div className="mt-2 flex justify-end">
                <button onClick={handleAddComment} className="px-3 py-1 bg-green-600 text-white rounded">Adicionar comentário</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}