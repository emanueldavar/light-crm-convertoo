import PropTypes from 'prop-types';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Card } from '@/components/Card.jsx';

export function Column({
  column,
  leads,
  onEdit,
  onDelete,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'column', columnId: column.id }
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex h-full min-h-[300px] w-full min-w-[280px] flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition-shadow duration-200 dark:border-slate-700 dark:bg-slate-900/60 ${
        isOver
          ? 'shadow-lg ring-2 ring-primary/60 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-900'
          : 'shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="h-3 w-3 rounded-full border border-white shadow"
            style={{ backgroundColor: column.color }}
            aria-label="Alterar cor da coluna"
          />
          <button
            type="button"
            onClick={onEdit}
            className="text-left text-sm font-semibold text-slate-700 transition hover:text-primary dark:text-slate-100"
          >
            {column.name}
          </button>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="rounded-full bg-slate-200/60 px-2 py-1 dark:bg-slate-800/70">{leads.length}</span>
          <button
            type="button"
            onClick={onMoveLeft}
            disabled={!canMoveLeft}
            className={`rounded-full px-2 py-1 transition ${
              canMoveLeft
                ? 'hover:bg-slate-200 dark:hover:bg-slate-800'
                : 'cursor-not-allowed opacity-40'
            }`}
            aria-label="Mover coluna para a esquerda"
          >
            ←
          </button>
          <button
            type="button"
            onClick={onMoveRight}
            disabled={!canMoveRight}
            className={`rounded-full px-2 py-1 transition ${
              canMoveRight
                ? 'hover:bg-slate-200 dark:hover:bg-slate-800'
                : 'cursor-not-allowed opacity-40'
            }`}
            aria-label="Mover coluna para a direita"
          >
            →
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full px-2 py-1 text-rose-500 transition hover:bg-rose-100 dark:hover:bg-rose-500/20"
            aria-label="Remover coluna"
          >
            ×
          </button>
        </div>
      </div>
      <SortableContext items={leads.map((lead) => lead.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-1 flex-col gap-3">
          {leads.map((lead) => (
            <Card key={lead.id} lead={lead} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

Column.propTypes = {
  column: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    color: PropTypes.string
  }).isRequired,
  leads: PropTypes.arrayOf(PropTypes.object).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onMoveLeft: PropTypes.func.isRequired,
  onMoveRight: PropTypes.func.isRequired,
  canMoveLeft: PropTypes.bool.isRequired,
  canMoveRight: PropTypes.bool.isRequired
};
