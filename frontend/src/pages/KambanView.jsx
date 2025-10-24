import { useMemo } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import PropTypes from 'prop-types';
import { Column } from '@/components/Column.jsx';

export function KambanView({ columns, leads, onDragEnd, onEditColumn, onDeleteColumn, onMoveColumn }) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    })
  );

  const leadsByColumn = useMemo(() => {
    const map = new Map();
    columns.forEach((column) => {
      map.set(
        column.id,
        leads
          .filter((lead) => lead.columnId === column.id)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      );
    });
    return map;
  }, [columns, leads]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;
    const activeColumnId = activeData?.columnId;
    let destinationColumnId = activeColumnId;

    if (overData?.type === 'column') {
      destinationColumnId = overData.columnId;
    } else if (overData?.type === 'lead') {
      destinationColumnId = overData.columnId;
    }

    if (!activeColumnId || !destinationColumnId) return;

    const activeColumnLeads = leadsByColumn.get(activeColumnId) ?? [];
    const destinationColumnLeads = leadsByColumn.get(destinationColumnId) ?? [];

    if (destinationColumnId === activeColumnId) {
      const oldIndex = activeColumnLeads.findIndex((lead) => lead.id === active.id);
      const newIndexCandidate = overData?.type === 'lead'
        ? activeColumnLeads.findIndex((lead) => lead.id === over.id)
        : activeColumnLeads.length - 1;
      const newIndex = newIndexCandidate >= 0 ? newIndexCandidate : activeColumnLeads.length - 1;
      const ordered = arrayMove(activeColumnLeads, oldIndex, newIndex).map((lead) => lead.id);
      onDragEnd(active.id, destinationColumnId, ordered);
    } else {
      const destinationIds = destinationColumnLeads.map((lead) => lead.id);
      if (overData?.type === 'lead') {
        const index = destinationIds.indexOf(over.id);
        if (index >= 0) {
          destinationIds.splice(index, 0, active.id);
        } else {
          destinationIds.push(active.id);
        }
      } else {
        destinationIds.push(active.id);
      }
      onDragEnd(active.id, destinationColumnId, destinationIds);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-6">
        {columns.map((column, index) => (
          <Column
            key={column.id}
            column={column}
            leads={leadsByColumn.get(column.id) ?? []}
            onEdit={() => onEditColumn(column)}
            onDelete={() => onDeleteColumn(column)}
            canMoveLeft={index > 0}
            canMoveRight={index < columns.length - 1}
            onMoveLeft={() => index > 0 && onMoveColumn(column, index - 1)}
            onMoveRight={() => index < columns.length - 1 && onMoveColumn(column, index + 1)}
          />
        ))}
      </div>
    </DndContext>
  );
}

KambanView.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  leads: PropTypes.arrayOf(PropTypes.object).isRequired,
  onDragEnd: PropTypes.func.isRequired,
  onEditColumn: PropTypes.func.isRequired,
  onDeleteColumn: PropTypes.func.isRequired,
  onMoveColumn: PropTypes.func.isRequired
};
