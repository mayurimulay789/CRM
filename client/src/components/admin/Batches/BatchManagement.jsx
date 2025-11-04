import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import AddBatchForm from '../../AddBatchForm';
import KanbanBoard from './KanbanBoard';
import { getBatches } from '../../../store/slices/batchSlice';

const BatchManagement = ({ activeSection }) => {
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddBatch = () => {
    setShowAddForm(true);
  };

  const handleBack = () => {
    setShowAddForm(false);
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
      {showAddForm ? (
        <AddBatchForm onBack={handleBack} />
      ) : (
        <KanbanBoard />
      )}
    </div>
  );
};

export default BatchManagement;
