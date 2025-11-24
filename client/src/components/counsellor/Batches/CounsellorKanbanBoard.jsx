import React from 'react';
import KanbanBoard from '../../admin/Batches/KanbanBoard';

/**
 * CounsellorKanbanBoard component wraps the admin KanbanBoard for consistent batch management UI
 * on counsellor side. It currently just reuses the KanbanBoard component without modification.
 * Future role-based behavior can be added if needed.
 */
const CounsellorKanbanBoard = () => {
  return <KanbanBoard />;
};

export default CounsellorKanbanBoard;
