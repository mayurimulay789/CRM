import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AddBatchForm from '../../AddBatchForm';
import KanbanBoard from './KanbanBoard';
import { getBatches, deleteBatch } from '../../../store/slices/batchSlice';

const BatchManagement = ({ activeSection }) => {
  const dispatch = useDispatch();
  const { batches, loading } = useSelector((state) => state.batch);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);

  useEffect(() => {
    // Fetch once on mount to avoid re-request loops when the board is empty
    dispatch(getBatches());
  }, [dispatch]);

  const handleAddBatch = () => {
    setShowAddForm(true);
  };

  const handleEditBatch = (batch) => {
    setEditingBatch(batch);
    setShowEditForm(true);
  };

  const handleDeleteBatch = async (batch) => {
    const ok = window.confirm(`Delete batch "${batch.name}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await dispatch(deleteBatch(batch._id)).unwrap();
      // refresh lists
      dispatch(getBatches());
    } catch (err) {
      console.error('Delete batch failed', err);
    }
  };

  const handleBack = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setEditingBatch(null);
  };

  const handleEditSubmit = () => {
    setShowEditForm(false);
    setEditingBatch(null);
    // Optionally refetch batches if needed
    dispatch(getBatches());
  };

  const renderContent = () => {
    if (showAddForm) {
      return <AddBatchForm onBack={handleBack} />;
    }
    if (showEditForm && editingBatch) {
      return <AddBatchForm onBack={handleBack} isEdit={true} batchData={editingBatch} onEditSubmit={handleEditSubmit} />;
    }

    return <KanbanBoard onEditBatch={handleEditBatch} onDeleteBatch={handleDeleteBatch} />;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 px-6 pt-6">
        <h1 className="text-2xl font-bold text-gray-800">Batch Management</h1>
        {!showAddForm && (
          <button
            onClick={handleAddBatch}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            Add Batch
          </button>
        )}
        {showAddForm && (
          <button
            onClick={handleBack}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            Back to Batch Management
          </button>
        )}
      </div>
      {renderContent()}
    </div>
  );
};

export default BatchManagement;