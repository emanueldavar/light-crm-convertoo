import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Mail, Phone, Building2, CircleDollarSign } from 'lucide-react';
import useCRMStore from '../store/useCRMStore.js';
import { formatCurrency } from '../utils/format.js';

function Card({ lead, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: {
      type: 'lead',
      leadId: lead.id,
      columnId: lead.columnId
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const tagPalette = useCRMStore((state) => state.tagsPalette);

  return (
    <motion.article
      ref={setNodeRef}
      style={style}
      layout
      {...listeners}
      {...attributes}
      onClick={() => onSelect(lead.id)}
      className={clsx(
        'group relative cursor-grab rounded-2xl border border-slate-200 bg-white/90 p-4 text-left shadow-sm transition hover:shadow-md active:cursor-grabbing dark:border-slate-700 dark:bg-slate-800/90',
        isDragging && 'z-50 bg-white shadow-xl dark:bg-slate-800'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">{lead.name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{lead.company || 'Empresa não informada'}</p>
        </div>
        {lead.value && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-500/10 px-2 py-1 text-xs font-medium text-primary-600 dark:text-primary-300">
            <CircleDollarSign className="h-3 w-3" />
            {formatCurrency(lead.value)}
          </span>
        )}
      </div>
      <dl className="mt-3 grid gap-2 text-xs text-slate-500 dark:text-slate-400">
        {lead.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5" />
            <span>{lead.email}</span>
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5" />
            <span>{lead.phone}</span>
          </div>
        )}
        {lead.company && (
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5" />
            <span>{lead.company}</span>
          </div>
        )}
      </dl>
      {lead.tags?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {lead.tags.map((tagId) => {
            const tag = tagPalette.find((item) => item.id === tagId) || {
              id: tagId,
              label: tagId,
              color: '#CBD5F5'
            };
            return (
              <span
                key={tag.id}
                className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                style={{
                  backgroundColor: `${tag.color}20`,
                  color: tag.color
                }}
              >
                {tag.label}
              </span>
            );
          })}
        </div>
      ) : null}
    </motion.article>
  );
}

export default Card;
