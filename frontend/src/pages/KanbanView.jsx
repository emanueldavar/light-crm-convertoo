import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Column from '../components/Column.jsx';
import Card from '../components/Card.jsx';
import useCRMStore from '../store/useCRMStore.js';
import { api } from '../lib/api.js';

function KanbanView({ columns, leads, onSelectLead }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const reorderColumns = useCRMStore((state) => state.reorderColumns);
  const moveLead = useCRMStore((state) => state.moveLead);
  const upsertLead = useCRMStore((state) => state.upsertLead);

  const [activeLead, setActiveLead] = useState(null);

  const columnMap = useMemo(() => {
    const grouped = new Map();
    columns.forEach((column) => {
      const columnLeads = Object.values(leads)
        .filter((lead) => lead.columnId === column.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      grouped.set(column.id, columnLeads);
    });
    return grouped;
  }, [columns, leads]);

  const handleDragStart = (event) => {
    const { active } = event;
    if (active?.data?.current?.type === 'lead') {
      setActiveLead(leads[active.id]);
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over || active?.data?.current?.type !== 'lead') return;
    const overColumnId = over.data?.current?.columnId || over.id;
    if (!overColumnId) return;
    moveLead(active.id, overColumnId);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveLead(null);

    if (!over) return;

    const activeType = active.data?.current?.type;

    if (activeType === 'column') {
      const activeIndex = columns.findIndex((column) => column.id === active.id);
      const overIndex = columns.findIndex((column) => column.id === over.id);
      if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) return;
      const reordered = arrayMove(columns.map((column) => column.id), activeIndex, overIndex);
      reorderColumns(reordered);
      try {
        await api.updateColumn(active.id, {
          orderMap: reordered.map((id, index) => ({ id, order: index }))
        });
      } catch (error) {
        console.error(error); // eslint-disable-line no-console
        toast.error('Não foi possível salvar a nova ordem das colunas');
      }
      return;
    }

    if (activeType === 'lead') {
      const overColumnId = over.data?.current?.columnId || over.id;
      if (!overColumnId) return;
      try {
        const { lead } = await api.updateLead(active.id, { columnId: overColumnId });
        upsertLead(lead);
      } catch (error) {
        console.error(error); // eslint-disable-line no-console
        toast.error('Erro ao mover lead');
      }
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd} onDragOver={handleDragOver} onDragStart={handleDragStart}>
      <SortableContext items={columns.map((column) => column.id)} strategy={horizontalListSortingStrategy}>
        <div className="flex gap-6 overflow-x-auto pb-6">
          {columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              leads={columnMap.get(column.id) || []}
              onSelectLead={onSelectLead}
            />
          ))}
        </div>
      </SortableContext>
      {createPortal(
        <DragOverlay dropAnimation={null}>
          {activeLead ? <Card lead={activeLead} onSelect={() => {}} /> : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}

export default KanbanView;
