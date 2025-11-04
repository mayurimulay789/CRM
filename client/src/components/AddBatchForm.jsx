import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBatch, clearError, clearSuccess } from '../store/slices/batchSlice';

const AddBatchForm = ({ onBack }) => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.batch);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'Upcoming',
    branch: '',
    trainer: '',
    classRoom: '',
    code: '',
    completionDate: '',
    timing: '',
    course: '',
    studentsActive: 0,
    batchType: '',
    mode: '',
    country: '',
    mergingStatus: '',
    mergingTill: '',
    batchDays: '',
    batchExtenApproval: '',
    approvalStatus: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(clearSuccess());

    try {
      await dispatch(createBatch(formData)).unwrap();
      // Reset form after successful submission
      setFormData({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'Upcoming',
        branch: '',
        trainer: '',
        classRoom: '',
        code: '',
        completionDate: '',
        timing: '',
        course: '',
        studentsActive: 0,
        batchType: '',
        mode: '',
        country: '',
        mergingStatus: '',
        mergingTill: '',
        batchDays: '',
        batchExtenApproval: '',
        approvalStatus: '',
      });
      if (onBack) onBack();
    } catch (error) {
      console.error('Failed to create batch:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Add New Batch</h1>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Back
            </button>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Upcoming">Upcoming</option>
              <option value="Running">Running</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
              Branch
            </label>
            <input
              type="text"
              id="branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="trainer" className="block text-sm font-medium text-gray-700">
              Trainer
            </label>
            <input
              type="text"
              id="trainer"
              name="trainer"
              value={formData.trainer}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="classRoom" className="block text-sm font-medium text-gray-700">
              Class Room
            </label>
            <input
              type="text"
              id="classRoom"
              name="classRoom"
              value={formData.classRoom}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Code
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="completionDate" className="block text-sm font-medium text-gray-700">
              Completion Date
            </label>
            <input
              type="date"
              id="completionDate"
              name="completionDate"
              value={formData.completionDate}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="timing" className="block text-sm font-medium text-gray-700">
              Timing
            </label>
            <input
              type="text"
              id="timing"
              name="timing"
              value={formData.timing}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="course" className="block text-sm font-medium text-gray-700">
              Course
            </label>
            <input
              type="text"
              id="course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="studentsActive" className="block text-sm font-medium text-gray-700">
              Students Active
            </label>
            <input
              type="number"
              id="studentsActive"
              name="studentsActive"
              value={formData.studentsActive}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="batchType" className="block text-sm font-medium text-gray-700">
              Batch Type
            </label>
            <input
              type="text"
              id="batchType"
              name="batchType"
              value={formData.batchType}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="mode" className="block text-sm font-medium text-gray-700">
              Mode
            </label>
            <select
              id="mode"
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Mode</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="mergingStatus" className="block text-sm font-medium text-gray-700">
              Merging Status
            </label>
            <input
              type="text"
              id="mergingStatus"
              name="mergingStatus"
              value={formData.mergingStatus}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="mergingTill" className="block text-sm font-medium text-gray-700">
              Merging Till
            </label>
            <input
              type="date"
              id="mergingTill"
              name="mergingTill"
              value={formData.mergingTill}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="batchDays" className="block text-sm font-medium text-gray-700">
              Batch Days
            </label>
            <input
              type="text"
              id="batchDays"
              name="batchDays"
              value={formData.batchDays}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="batchExtenApproval" className="block text-sm font-medium text-gray-700">
              Batch Extension Approval
            </label>
            <input
              type="text"
              id="batchExtenApproval"
              name="batchExtenApproval"
              value={formData.batchExtenApproval}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="approvalStatus" className="block text-sm font-medium text-gray-700">
              Approval Status
            </label>
            <select
              id="approvalStatus"
              name="approvalStatus"
              value={formData.approvalStatus}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          {error && (
            <div className="md:col-span-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          <div className="md:col-span-2 flex gap-4 pt-6 justify-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              {loading ? 'Adding Batch...' : 'Add Batch'}
            </button>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default AddBatchForm;
