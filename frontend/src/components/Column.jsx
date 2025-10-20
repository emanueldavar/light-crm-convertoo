import { useDroppable } from '@dnd-kit/core';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Pencil, Palette, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import Card from './Card.jsx';
import useCRMStore from '../store/useCRMStore.js';
import { api } from '../lib/api.js';
import toast from 'react-hot-toast';

function Column({ column, leads, onSelectLead }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      columnId: column.id
    }
  });

  const { attributes, listeners, setNodeRef: setSortableRef, transform, transition } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      columnId: column.id
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const updateColumn = useCRMStore((state) => state.updateColumn);
  const removeColumn = useCRMStore((state) => state.removeColumn);

  const handleRename = async () => {
    const name = prompt('Novo nome da etapa', column.name);
    if (!name || name === column.name) return;
    try {
      await api.updateColumn(column.id, { name });
      updateColumn({ ...column, name });
      toast.success('Coluna atualizada');
    } catch (error) {
      console.error(error); // eslint-disable-line no-console
      toast.error('Não foi possível renomear a coluna');
    }
  };

  const handleChangeColor = async () => {
    const color = prompt('Defina uma cor em hexadecimal', column.color);
    if (!color || color === column.color) return;
    try {
      await api.updateColumn(column.id, { color });
      updateColumn({ ...column, color });
      toast.success('Cor atualizada');
    } catch (error) {
      console.error(error); // eslint-disable-line no-console
      toast.error('Erro ao atualizar cor');
    }
  };

  const handleDelete = async () => {
    const confirmation = window.confirm(
      'Tem certeza que deseja excluir esta coluna? Os leads também serão removidos.'
    );
    if (!confirmation) return;
    try {
      await api.deleteColumn(column.id);
      toast.success('Coluna removida');
      removeColumn(column.id);
    } catch (error) {
      console.error(error); // eslint-disable-line no-console
      toast.error('Erro ao excluir coluna');
    }
  };

  return (
    <div
      ref={setSortableRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex w-[320px] flex-shrink-0 flex-col"
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            {column.name}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">{leads.length} leads</p>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <button
            type="button"
            onClick={handleRename}
            className="rounded-full p-1 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleChangeColor}
            className="rounded-full p-1 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <Palette className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-full p-1 transition hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <MoreHorizontal className="h-4 w-4" />
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={clsx(
          'flex-1 space-y-3 rounded-3xl border border-dashed border-slate-200/80 bg-white/80 p-3 transition dark:border-slate-700/80 dark:bg-slate-900/50',
          isOver && 'border-primary-300 bg-primary-50/80 dark:border-primary-400/60 dark:bg-primary-500/10'
        )}
      >
        <SortableContext items={leads.map((lead) => lead.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <Card key={lead.id} lead={lead} onSelect={onSelectLead} />
          ))}
        </SortableContext>
        {!leads.length && (
          <p className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 text-center text-xs text-slate-400 dark:border-slate-700/80 dark:bg-slate-900/40">
            Arraste leads para esta etapa
          </p>
        )}
      </div>
    </div>
  );
}

export default Column;
