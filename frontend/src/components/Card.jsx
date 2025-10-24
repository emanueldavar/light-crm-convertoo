import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLeadsStore } from '@/store/useLeadsStore.js';

export function Card({ lead }) {
  const openLead = useLeadsStore((state) => state.openLead);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: { type: 'lead', columnId: lead.columnId }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1
  };

  const cardClasses = `rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow duration-200 dark:border-slate-700 dark:bg-slate-800 ${
    isDragging
      ? 'shadow-2xl ring-2 ring-primary/40 ring-offset-2 ring-offset-white dark:ring-offset-slate-900'
      : 'hover:shadow-lg'
  }`;

  return (
    <motion.div
      ref={setNodeRef}
      layout
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      style={style}
      className={cardClasses}
      {...attributes}
      {...listeners}
      onClick={() => openLead(lead)}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-slate-900 dark:text-white">{lead.name}</h3>
        {lead.value ? (
          <span className="text-sm font-medium text-primary">R$ {lead.value.toLocaleString('pt-BR')}</span>
        ) : null}
      </div>
      {lead.company ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{lead.company}</p> : null}
      <p className="mt-2 max-h-12 overflow-hidden text-ellipsis text-xs text-slate-400 dark:text-slate-400">
        {lead.notes}
      </p>
      {lead.tags?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {lead.tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full px-2 py-1 text-xs font-medium"
              style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}

Card.propTypes = {
  lead: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    columnId: PropTypes.string.isRequired,
    company: PropTypes.string,
    value: PropTypes.number,
    notes: PropTypes.string,
    tags: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired
      })
    )
  }).isRequired
};
