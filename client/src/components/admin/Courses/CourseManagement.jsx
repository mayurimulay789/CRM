import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCourses, 
  createCourse, 
  updateCourse, 
  deleteCourse, 
  toggleCourseStatus,
  clearError,
  clearSuccess 
} from '../../../store/slices/courseSlice';
import CourseForm from './CourseForm';

const CourseManagement = () => {
  const dispatch = useDispatch();
  const { courses, loading, error, operationSuccess, currentCourse } = useSelector(state => state.courses);
  
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [filterActive, setFilterActive] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);

  // Refs for dropdown menus
  const filterMenuRef = useRef(null);
  const columnsMenuRef = useRef(null);
  const filterButtonRef = useRef(null);
  const columnsButtonRef = useRef(null);

  // Define all available columns
  const allColumns = [
    { key: 'name', label: 'Course Name', visible: true },
    { key: 'fee', label: 'Course Fee', visible: true },
    { key: 'duration', label: 'Duration', visible: true },
    { key: 'description', label: 'Description', visible: false },
    { key: 'isActive', label: 'Status', visible: true },
    { key: 'createdAt', label: 'Created At', visible: false },
    { key: 'updatedAt', label: 'Updated At', visible: false },
    { key: 'actions', label: 'Actions', visible: true }
  ];

  const [columns, setColumns] = useState(allColumns);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

 useEffect(() => {
  if (operationSuccess && !showForm) {
    const timer = setTimeout(() => {
      dispatch(clearSuccess());
    }, 3000);
    return () => clearTimeout(timer);
  }
}, [operationSuccess, dispatch, showForm]);

  // Fixed click outside detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside filter menu and filter button
      if (showFilterMenu && 
          filterMenuRef.current && 
          !filterMenuRef.current.contains(event.target) &&
          filterButtonRef.current &&
          !filterButtonRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }

      // Check if click is outside columns menu and columns button
      if (showColumnsMenu && 
          columnsMenuRef.current && 
          !columnsMenuRef.current.contains(event.target) &&
          columnsButtonRef.current &&
          !columnsButtonRef.current.contains(event.target)) {
        setShowColumnsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterMenu, showColumnsMenu]);

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      await dispatch(deleteCourse(courseId));
      dispatch(fetchCourses());
    }
  };

  const handleToggleStatus = async (courseId) => {
    await dispatch(toggleCourseStatus(courseId));
    dispatch(fetchCourses());
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCourse(null);
    dispatch(fetchCourses());
  };

  const toggleColumnVisibility = (columnKey) => {
    console.log('Toggling column:', columnKey); // Debug log
    setColumns(prevColumns => 
      prevColumns.map(col => 
        col.key === columnKey ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const selectAllColumns = () => {
    console.log('Selecting all columns'); // Debug log
    setColumns(prevColumns => 
      prevColumns.map(col => ({ ...col, visible: true }))
    );
  };

  const deselectAllColumns = () => {
    console.log('Deselecting all columns'); // Debug log
    setColumns(prevColumns => 
      prevColumns.map(col => ({ ...col, visible: false }))
    );
  };

  // Debug: Log current columns state
  useEffect(() => {
    console.log('Current columns state:', columns);
  }, [columns]);

  const filteredCourses = courses.filter(course => {
    const matchesActive = filterActive === 'all' || 
      (filterActive === 'active' && course.isActive) || 
      (filterActive === 'inactive' && !course.isActive);
    
    const matchesSearch = 
      course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.duration?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesActive && matchesSearch;
  });

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
        Active
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
        Inactive
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return `₹${amount.toLocaleString()}`;
  };

  const truncateDescription = (description, maxLength = 50) => {
    if (!description) return '-';
    if (description.length <= maxLength) return description;
    return `${description.substring(0, maxLength)}...`;
  };

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header Section */}
      <div className="flex-shrink-0 bg-white p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div className="flex justify-between items-center w-full lg:w-auto space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Course Management</h1>
              <p className="text-gray-600">Manage courses and their details</p>
            </div>
            
            {/* Add New Course Button */}
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <span>+</span>
              <span>New Course</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-3 p-3 rounded-lg">
            {/* Filter Button */}
            <div className="relative">
              <button
                ref={filterButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFilterMenu(!showFilterMenu);
                  setShowColumnsMenu(false);
                }}
                className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <span>🔍</span>
                <span>Filter</span>
                <span>▼</span>
              </button>

              {/* Filter Dropdown Menu */}
              {showFilterMenu && (
                <div 
                  ref={filterMenuRef}
                  className="absolute right-0 left-2 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
                >
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Filter by Status</h3>
                    <div className="space-y-2">
                      {['all', 'active', 'inactive'].map(status => (
                        <label key={status} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="status"
                            value={status}
                            checked={filterActive === status}
                            onChange={(e) => setFilterActive(e.target.value)}
                            className="text-blue-500 focus:ring-blue-500"
                          />
                          <span className="capitalize">
                            {status === 'all' ? 'All Status' : status}
                          </span>
                        </label>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-800 mb-3">Search</h3>
                      <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="mt-4 flex justify-between">
                      <button
                        onClick={() => {
                          setFilterActive('all');
                          setSearchTerm('');
                        }}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => setShowFilterMenu(false)}
                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Columns Button */}
            <div className="relative">
              <button
                ref={columnsButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColumnsMenu(!showColumnsMenu);
                  setShowFilterMenu(false);
                }}
                className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <span>📊</span>
                <span>Columns</span>
                <span>▼</span>
              </button>

              {/* Columns Dropdown Menu */}
              {showColumnsMenu && (
                <div 
                  ref={columnsMenuRef}
                  className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-800">Show/Hide Columns</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={selectAllColumns}
                          className="text-xs text-blue-500 hover:text-blue-700"
                        >
                          Select All
                        </button>
                        <button
                          onClick={deselectAllColumns}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {columns.map(column => (
                        <label key={column.key} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={column.visible}
                            onChange={() => toggleColumnVisibility(column.key)}
                            className="text-blue-500 focus:ring-blue-500 rounded"
                          />
                          <span className="text-sm text-gray-700">{column.label}</span>
                        </label>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end">
                      <button
                        onClick={() => setShowColumnsMenu(false)}
                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Success Message */}
        {operationSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>✅</span>
              <span>{operationSuccess}</span>
            </div>
            <button onClick={() => dispatch(clearSuccess())} className="text-green-700 hover:text-green-900">
              ×
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>❌</span>
              <span>{error}</span>
            </div>
            <button onClick={() => dispatch(clearError())} className="text-red-700 hover:text-red-900">
              ×
            </button>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="flex-1 min-h-0 bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
          {/* Table with horizontal scroll only */}
          <div className="flex-1 min-h-0 overflow-auto">
            <div className="overflow-x-auto h-full">
              <table className="min-w-full divide-y divide-gray-200 border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    {columns.map(column => 
                      column.visible && (
                        <th 
                          key={column.key} 
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-gray-50"
                        >
                          {column.label}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCourses.length === 0 ? (
                    <tr>
                      <td 
                        colSpan={columns.filter(col => col.visible).length} 
                        className="px-6 py-12 text-center"
                      >
                        <div className="text-gray-500">
                          <span className="text-4xl mb-2 block">📚</span>
                          <p className="text-lg font-medium">No courses found</p>
                          <p className="text-sm">Get started by creating your first course</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCourses.map((course, index) => (
                      <tr 
                        key={course._id} 
                        className={`transition-colors duration-150 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        } hover:bg-blue-50`}
                      >
                        {columns.map(column => {
                          if (!column.visible) return null;
                          
                          // Common cell styling
                          const baseCellClasses = "px-4 py-3 text-sm border-b border-gray-200";
                          
                          switch (column.key) {
                            case 'name':
                              return (
                                <td key={column.key} className={`${baseCellClasses} font-semibold text-gray-900 whitespace-nowrap`}>
                                  {course.name}
                                </td>
                              );
                            case 'fee':
                              return (
                                <td key={column.key} className={`${baseCellClasses} font-semibold text-green-600 whitespace-nowrap`}>
                                  {formatCurrency(course.fee)}
                                </td>
                              );
                            case 'duration':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                                  {course.duration || '-'}
                                </td>
                              );
                            case 'description':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-600`}>
                                  {truncateDescription(course.description)}
                                </td>
                              );
                            case 'isActive':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-center`}>
                                  {getStatusBadge(course.isActive)}
                                </td>
                              );
                            
                            case 'createdAt':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-500 whitespace-nowrap`}>
                                  {formatDate(course.createdAt)}
                                </td>
                              );
                            case 'updatedAt':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-500 whitespace-nowrap`}>
                                  {formatDate(course.updatedAt)}
                                </td>
                              );
                            case 'actions':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-center whitespace-nowrap`}>
                                  <div className="flex items-center justify-center space-x-2">
                                    <button 
                                      onClick={() => handleEdit(course)} 
                                      className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50 transition-colors border border-blue-200" 
                                      title="Edit Course"
                                    >
                                      Edit
                                    </button>
                                    <button 
                                      onClick={() => handleToggleStatus(course._id)} 
                                      className={`px-2 py-1 rounded transition-colors border ${
                                        course.isActive 
                                          ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-50 border-orange-200' 
                                          : 'text-green-600 hover:text-green-900 hover:bg-green-50 border-green-200'
                                      }`}
                                      title={course.isActive ? 'Deactivate Course' : 'Activate Course'}
                                    >
                                      {course.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button 
                                      onClick={() => handleDelete(course._id)} 
                                      className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50 transition-colors border border-red-200" 
                                      title="Delete Course"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              );
                            default:
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700`}>
                                  {course[column.key] || '-'}
                                </td>
                              );
                          }
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Footer */}
          {filteredCourses.length > 0 && (
            <div className="flex-shrink-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-semibold">{filteredCourses.length}</span> of{' '}
                  <span className="font-semibold">{courses.length}</span> courses
                </div>
                <div className="text-sm text-gray-500">
                  Total: {courses.length} courses
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Course Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingCourse ? 'Edit Course' : 'Create New Course'}
                </h2>
                <button onClick={handleCloseForm} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>
              <CourseForm course={editingCourse} onClose={handleCloseForm} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;