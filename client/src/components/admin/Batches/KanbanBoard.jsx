import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import {
  useDroppable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { getBatches, updateBatch } from '../../../store/slices/batchSlice';

// ---------- Helper: determine correct status by date ----------
const getStatusByDate = (batch) => {
  if (!batch.startDate || !batch.endDate) return batch.status; // fallback if dates missing

  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalise to start of day

  const start = new Date(batch.startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(batch.endDate);
  end.setHours(0, 0, 0, 0);

  if (today < start) return 'Upcoming';
  if (today >= start && today <= end) return 'Running';
  if (today > end) return 'Closed';
  return batch.status;
};

// ---------- Column Component ----------
const KanbanColumn = ({ id, title, items, onEditBatch, onDeleteBatch }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  const getColumnColor = (id) => {
    switch (id) {
      case 'upcoming':
        return 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200';
      case 'running':
        return 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200';
      case 'closed':
        return 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  const getHeaderColor = (id) => {
    switch (id) {
      case 'upcoming':
        return 'text-yellow-800';
      case 'running':
        return 'text-green-800';
      case 'closed':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`p-4 rounded-xl min-h-[400px] border-2 transition-all duration-300 ${
        isOver
          ? 'bg-blue-100 border-blue-400 shadow-lg scale-105'
          : `${getColumnColor(id)} border-dashed`
      }`}
    >
      <h3 className={`text-lg font-bold mb-4 text-center ${getHeaderColor(id)}`}>{title}</h3>
      <SortableContext items={items.map(item => item._id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {items.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-10 bg-white/60 border border-dashed border-gray-300 rounded-md">
              No batches here yet
            </div>
          )}
          {items.map((batch) => (
            <BatchCard key={batch._id} batch={batch} onEditBatch={onEditBatch} onDeleteBatch={onDeleteBatch} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

// ---------- Batch Card Component ----------
const BatchCard = ({ batch, onEditBatch, onDeleteBatch }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: batch._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Upcoming':
        return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white';
      case 'Running':
        return 'bg-gradient-to-r from-green-400 to-emerald-400 text-white';
      case 'Closed':
        return 'bg-gradient-to-r from-blue-400 to-indigo-400 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white p-4 rounded-lg shadow-md border border-gray-200 cursor-grab active:cursor-grabbing relative hover:shadow-lg transition-all duration-200 ${
        isDragging ? 'opacity-50 rotate-2 scale-105' : ''
      }`}
    >
      <div className="absolute bottom-3 right-3 flex gap-2">
        {batch.status !== 'Closed' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditBatch(batch);
            }}
            className="text-gray-500 hover:text-gray-700 text-lg"
            title="Edit Batch"
          >
            📝
          </button>
        )}
        {/* Delete: allowed for Closed always; for Upcoming only if no students; never for Running */}
        {((batch.status === 'Closed') || (batch.status === 'Upcoming' && Number(batch.enrolledCount ?? batch.studentsActive ?? 0) === 0)) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteBatch(batch);
            }}
            className="text-red-500 hover:text-red-700 text-lg"
            title="Delete Batch"
          >
            🗑️
          </button>
        )}
      </div>
      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(batch.status)}`}>
        {batch.status}
      </div>
      <h4 className="font-semibold text-gray-900 pr-20 text-md">{batch.name}</h4>
      <div className="mt-3 space-y-1">
        <p className="text-xs text-gray-600">
          📅 Start: {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : 'No start date'}
        </p>
        <p className="text-xs text-gray-600">
          📅 End: {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : 'No end date'}
        </p>
        <p className="text-xs text-gray-600">
          👥 Students: {batch.enrolledCount ?? batch.studentsActive ?? 0}
        </p>
      </div>
    </div>
  );
};

// ---------- Main Kanban Board ----------
const KanbanBoard = ({ onEditBatch, onDeleteBatch }) => {
  const dispatch = useDispatch();
  const { batches, loading, error } = useSelector((state) => state.batch);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ---------- Automatic status update based on dates ----------
  const updateStatusesByDate = useCallback(() => {
    batches.forEach(batch => {
      const correctStatus = getStatusByDate(batch);
      if (batch.status !== correctStatus) {
        dispatch(updateBatch({ id: batch._id, batchData: { status: correctStatus } }));
      }
    });
  }, [batches, dispatch]);

  // Run on mount and whenever batches change
  useEffect(() => {
    updateStatusesByDate();
  }, [updateStatusesByDate]);

  // Optional: periodic check (e.g., every hour) to catch date changes while app is open
  useEffect(() => {
    const interval = setInterval(updateStatusesByDate, 60 * 60 * 1000); // 1 hour
    return () => clearInterval(interval);
  }, [updateStatusesByDate]);

  // ---------- Sort batches by start date within each column ----------
  const columns = useMemo(() => {
    // First, sort all batches by start date (ascending)
    const sortedAll = [...batches].sort((a, b) => {
      if (!a.startDate) return 1;
      if (!b.startDate) return -1;
      return new Date(a.startDate) - new Date(b.startDate);
    });

    return {
      upcoming: sortedAll.filter(batch => batch.status === 'Upcoming'),
      running: sortedAll.filter(batch => batch.status === 'Running'),
      closed: sortedAll.filter(batch => batch.status === 'Closed'),
    };
  }, [batches]);

  // ---------- Drag & Drop Handlers ----------
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    // Find the batch being dragged
    const activeBatch = batches.find(batch => batch._id === activeId);
    if (!activeBatch) {
      setActiveId(null);
      return;
    }

    // Determine source column
    let sourceColumn = null;
    const columnKeys = Object.keys(columns);
    for (const key of columnKeys) {
      if (columns[key].some(batch => batch._id === activeId)) {
        sourceColumn = key;
        break;
      }
    }

    // Determine destination column
    let destColumn = null;
    const columnIds = ['upcoming', 'running', 'closed'];
    if (columnIds.includes(overId)) {
      destColumn = overId;
    } else {
      for (const key of columnKeys) {
        if (columns[key].some(batch => batch._id === overId)) {
          destColumn = key;
          break;
        }
      }
    }

    if (!sourceColumn || !destColumn || sourceColumn === destColumn) {
      setActiveId(null);
      return;
    }

    // 1. Basic status flow rule
    const allowedMoves = {
      upcoming: ['running'],      // Upcoming → Running only
      running: ['closed'],        // Running → Closed only
      closed: [],                 // Closed cannot move
    };

    if (!allowedMoves[sourceColumn]?.includes(destColumn)) {
      setActiveId(null);
      return;
    }

    // 2. Date‑based validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = activeBatch.startDate ? new Date(activeBatch.startDate) : null;
    const end = activeBatch.endDate ? new Date(activeBatch.endDate) : null;

    if (destColumn === 'running' && start && today < start) {
      alert('Cannot move to Running – start date has not arrived yet.');
      setActiveId(null);
      return;
    }

    if (destColumn === 'closed' && end && today <= end) {
      alert('Cannot move to Closed – end date has not passed yet.');
      setActiveId(null);
      return;
    }

    // 3. Update batch status
    const statusMap = {
      upcoming: 'Upcoming',
      running: 'Running',
      closed: 'Closed',
    };
    const newStatus = statusMap[destColumn];
    if (activeBatch.status !== newStatus) {
      dispatch(updateBatch({ id: activeId, batchData: { status: newStatus } }));
    }

    setActiveId(null);
  };

  const activeBatch = activeId ? batches.find(batch => batch._id === activeId) : null;

  if (error) {
    return <div className="text-center text-red-600 p-4">Error loading batches: {error}</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen p-8 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <KanbanColumn
            id="upcoming"
            title="📅 Upcoming"
            items={columns.upcoming}
            onEditBatch={onEditBatch}
            onDeleteBatch={onDeleteBatch}
          />
          <KanbanColumn
            id="running"
            title="🚀 Running"
            items={columns.running}
            onEditBatch={onEditBatch}
            onDeleteBatch={onDeleteBatch}
          />
          <KanbanColumn
            id="closed"
            title="✅ Closed"
            items={columns.closed}
            onEditBatch={onEditBatch}
            onDeleteBatch={onDeleteBatch}
          />
        </div>
      </div>
      <DragOverlay>
        {activeBatch ? <BatchCard batch={activeBatch} onDeleteBatch={onDeleteBatch} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;