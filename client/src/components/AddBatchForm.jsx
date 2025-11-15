import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { createBatch, updateBatch, clearError, clearSuccess, setError } from '../store/slices/batchSlice';
import { getTrainers } from '../store/slices/trainerSlice';
import { fetchCourses } from '../store/slices/courseSlice';

const AddBatchForm = ({ onBack, isEdit = false, batchData = null, onEditSubmit = null }) => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.batch);
  const { trainers, loading: trainersLoading } = useSelector((state) => state.trainer);
  const { courses, loading: coursesLoading } = useSelector((state) => state.courses);

  const [trainerSearch, setTrainerSearch] = useState('');
  const [showTrainerDropdown, setShowTrainerDropdown] = useState(false);

  // Fetch trainers and courses on component mount
  useEffect(() => {
    dispatch(getTrainers({ status: 'Active' }));
    dispatch(fetchCourses());
  }, [dispatch]);

  // Filter trainers based on search
  const filteredTrainers = trainers.filter(trainer =>
    trainer.name.toLowerCase().includes(trainerSearch.toLowerCase()) ||
    trainer.email.toLowerCase().includes(trainerSearch.toLowerCase())
  );

  const handleTrainerSelect = (trainer) => {
    setFormData({
      ...formData,
      trainer: trainer.name,
    });
    setTrainerSearch(trainer.name);
    setShowTrainerDropdown(false);
  };

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
    batchType: 'weekday',
    mode: '',
    country: '',
    mergingStatus: '',
    mergingTill: '',
    batchExtenApproval: '',
    approvalStatus: '',
  });

  const [formErrors, setFormErrors] = useState({});

  // Set form data for edit mode
  useEffect(() => {
    if (isEdit && batchData) {
      setFormData({
        name: batchData.name || '',
        description: batchData.description || '',
        startDate: batchData.startDate ? new Date(batchData.startDate).toISOString().split('T')[0] : '',
        endDate: batchData.endDate ? new Date(batchData.endDate).toISOString().split('T')[0] : '',
        status: batchData.status || 'Upcoming',
        branch: batchData.branch || '',
        trainer: batchData.trainer || '',
        classRoom: batchData.classRoom || '',
        code: batchData.code || '',
        completionDate: batchData.completionDate ? new Date(batchData.completionDate).toISOString().split('T')[0] : '',
        timing: batchData.timing || '',
        course: batchData.course || '',
        studentsActive: batchData.studentsActive || 0,
        batchType: batchData.batchType || 'weekday',
        mode: batchData.mode || '',
        country: batchData.country || '',
        mergingStatus: batchData.mergingStatus || '',
        mergingTill: batchData.mergingTill ? new Date(batchData.mergingTill).toISOString().split('T')[0] : '',
        batchExtenApproval: batchData.batchExtenApproval || '',
        approvalStatus: batchData.approvalStatus || '',
      });
      setTrainerSearch(batchData.trainer || '');
    }
  }, [isEdit, batchData]);

  useEffect(() => {
    const errors = validateForm();
    setFormErrors(errors);
  }, [formData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Batch name is required.';
    } else if (!/^[A-Za-z\s]+$/.test(formData.name)) {
      errors.name = 'Batch name must contain only letters and spaces.';
    }

    if (!formData.startDate) {
      errors.startDate = 'Start date is required.';
    } else if (new Date(formData.startDate) < new Date()) {
      errors.startDate = 'Start date must be in the future.';
    }

    if (!formData.endDate) {
      errors.endDate = 'End date is required.';
    } else if (formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      errors.endDate = 'End date must be after start date.';
    }

    if (!formData.trainer.trim()) {
      errors.trainer = 'Trainer is required.';
    }

    if (!formData.timing) {
      errors.timing = 'Timing is required.';
    }

    if (!formData.course.trim()) {
      errors.course = 'Course is required.';
    }

    if (!formData.batchType.trim()) {
      errors.batchType = 'Batch type is required.';
    }

    if (!formData.mode) {
      errors.mode = 'Mode is required.';
    }

    if (!formData.country) {
      errors.country = 'Country is required.';
    }

    if (formData.studentsActive < 0) {
      errors.studentsActive = 'Students active cannot be negative.';
    }

    if (formData.classRoom < 0) {
      errors.classRoom = 'Class room number cannot be negative.';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(clearSuccess());

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      // Display validation errors
      const errorMessage = Object.values(validationErrors).join(' ');
      dispatch(setError(errorMessage));
      return;
    }

    try {
      if (isEdit && batchData) {
        await dispatch(updateBatch({ id: batchData._id, batchData: formData })).unwrap();
        toast.success(`${formData.name} successfully updated!`);
        if (onEditSubmit) onEditSubmit();
      } else {
        await dispatch(createBatch(formData)).unwrap();
        toast.success(`${formData.name} successfully created!`);
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
          batchType: 'weekday',
          mode: '',
          country: '',
          mergingStatus: '',
          mergingTill: '',
          batchExtenApproval: '',
          approvalStatus: '',
        });
      }
      if (onBack) onBack();
    } catch (error) {
      console.error('Failed to save batch:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{isEdit ? 'Edit Batch' : 'Add New Batch'}</h1>
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
              pattern="[A-Za-z\s]+"
              title="Only letters and spaces are allowed"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
          <div className="mb-4 relative">
            <label htmlFor="trainer" className="block text-sm font-medium text-gray-700">
              Trainer
            </label>
            <div className="relative">
              <input
                type="text"
                id="trainer"
                name="trainer"
                value={trainerSearch}
                onChange={(e) => {
                  setTrainerSearch(e.target.value);
                  setShowTrainerDropdown(true);
                }}
                onFocus={() => setShowTrainerDropdown(true)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Search and select trainer..."
              />
              {showTrainerDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto" onMouseLeave={() => setShowTrainerDropdown(false)}>
                  {trainersLoading ? (
                    <div className="px-3 py-2 text-gray-500">Loading trainers...</div>
                  ) : filteredTrainers.length > 0 ? (
                    filteredTrainers.map((trainer) => (
                      <div
                        key={trainer._id}
                        onClick={() => handleTrainerSelect(trainer)}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {trainer.name} ({trainer.email})
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500">No trainers found</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="classRoom" className="block text-sm font-medium text-gray-700">
              Class Room
            </label>
            <input
              type="number"
              id="classRoom"
              name="classRoom"
              value={formData.classRoom}
              onChange={handleChange}
              min="0"
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
            <select
              id="timing"
              name="timing"
              value={formData.timing}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Timing</option>
              <option value="10 AM TO 12PM">10 AM TO 12PM</option>
              <option value="12PM TO 2 PM">12PM TO 2 PM</option>
              <option value="3PM TO 5PM">3PM TO 5PM</option>
              <option value="5PM TO 7PM">5PM TO 7PM</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="course" className="block text-sm font-medium text-gray-700">
              Course
            </label>
            <select
              id="course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Course</option>
              {coursesLoading ? (
                <option disabled>Loading courses...</option>
              ) : (
                courses.map((course) => (
                  <option key={course._id} value={course.name}>
                    {course.name}
                  </option>
                ))
              )}
            </select>
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
              {/* <option value="Hybrid">Hybrid</option> */}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Country</option>
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="mergingStatus" className="block text-sm font-medium text-gray-700">
              Merging Status
            </label>
            <select
              id="mergingStatus"
              name="mergingStatus"
              value={formData.mergingStatus}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Status</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
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
              {loading ? (isEdit ? 'Updating Batch...' : 'Adding Batch...') : (isEdit ? 'Update Batch' : 'Add Batch')}
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
