import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import AddTrainerForm from './AddTrainerForm';
import TrainerList from './TrainerList';
import { getTrainers } from '../../../store/slices/trainerSlice';

const TrainerManagement = ({ activeSection }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!showAddForm) {
      dispatch(getTrainers());
    }
  }, [dispatch, showAddForm]);

  const handleAddTrainer = () => {
    setShowAddForm(true);
  };

  const handleBack = () => {
    setShowAddForm(false);
    setEditingTrainer(null);
  };

  const handleEditTrainer = (trainer) => {
    setEditingTrainer(trainer);
    setShowAddForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 px-6 pt-6">
        <h1 className="text-2xl font-bold text-gray-800">Trainer Management</h1>
        {!showAddForm && (
          <button
            onClick={handleAddTrainer}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            Add Trainer
          </button>
        )}
        {showAddForm && (
          <button
            onClick={handleBack}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            Back to Trainer Management
          </button>
        )}
      </div>
      {showAddForm ? (
        <AddTrainerForm onBack={handleBack} editingTrainer={editingTrainer} />
      ) : (
        <div className="px-6">
          <TrainerList onEdit={handleEditTrainer} />
        </div>
      )}
    </div>
  );
};

export default TrainerManagement;
