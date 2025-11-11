import React, { useState, useEffect, useRef } from 'react';
import {
  getAllGrievances,
  approveGrievance,
  rejectGrievance,
} from '../../../store/api/campusAPI';

const CampusGrievanceAdmin = () => {
  const [grievances, setGrievances] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filterButtonRef = useRef(null);
  const filterMenuRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    fetchGrievances();
  }, []);

  useEffect(() => {
    if (success) {
      setShowModal(false);
      setSelectedGrievance(null);
      setAdminResponse('');
      setTimeout(() => setSuccess(''), 3000);
    }
  }, [success]);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(e.target) &&
        !filterButtonRef.current.contains(e.target)
      ) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowModal(false);
      }
    };
    if (showModal) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModal]);

  const fetchGrievances = async () => {
    try {
      const data = await getAllGrievances();
      setGrievances(data);
    } catch {
      setError('Failed to fetch grievances');
    }
  };

  const handleStatusUpdate = (grievance, status) => {
    setSelectedGrievance(grievance);
    setSelectedStatus(status);
    setAdminResponse(grievance.adminResponse || '');
    setShowModal(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!selectedGrievance) return;
    setLoading(true);
    try {
      if (selectedStatus === 'approved') {
        await approveGrievance(selectedGrievance._id, { adminResponse });
        setSuccess('Grievance approved successfully!');
      } else if (selectedStatus === 'rejected') {
        await rejectGrievance(selectedGrievance._id, { adminResponse });
        setSuccess('Grievance rejected successfully!');
      }
      fetchGrievances();
    } catch {
      setError(`Failed to ${selectedStatus} grievance`);
    } finally {
      setLoading(false);
    }
  };

  const filteredGrievances = grievances.filter((g) => {
    const matchesSearch =
      (g.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (g.complaint?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (g.subject?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || g.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'submittedToAdmin':
        return 'bg-gray-100 text-gray-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 text-center md:text-left">
        Campus Grievance Management
      </h1>

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
            ×
          </button>
        </div>
      )}

      {/* Filter button */}
      <div className="mb-6 relative flex items-center">
        <button
          ref={filterButtonRef}
          onClick={(e) => {
            e.stopPropagation();
            setShowFilterMenu(!showFilterMenu);
          }}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
        >
          <span>🔍</span>
          <span>Filter</span>
          <span>▼</span>
        </button>

        {showFilterMenu && (
          <div
            ref={filterMenuRef}
            className="absolute left-0 mt-12 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          >
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Filter by Status</h3>
              <div className="space-y-2">
                {['all', 'submittedToAdmin', 'approved', 'rejected'].map((status) => (
                  <label key={status} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={filterStatus === status}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="text-blue-500 focus:ring-blue-500"
                    />
                    <span className="capitalize">
                      {status === 'all' ? 'All Status' : status.replace(/([A-Z])/g, ' $1')}
                    </span>
                  </label>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3">Search</h3>
                <input
                  type="text"
                  placeholder="Search grievances..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => {
                    setFilterStatus('all');
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

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow p-4">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              {['Submitter', 'Subject', 'Description', 'Status', 'Submitted', 'Actions'].map(
                (head) => (
                  <th
                    key={head}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {head}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredGrievances.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No grievances found
                </td>
              </tr>
            ) : (
              filteredGrievances.map((g) => (
                <tr key={g._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">{g.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-600 truncate">{g.subject}</td>
                  <td className="px-4 py-4 text-sm text-gray-600 truncate">{g.complaint}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        g.status
                      )}`}
                    >
                      {g.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {new Date(g.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium">
                    {g.status === 'submittedToAdmin' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusUpdate(g, 'approved')}
                          className="text-green-600 hover:text-green-900 bg-green-100 px-2 py-1 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(g, 'rejected')}
                          className="text-red-600 hover:text-red-900 bg-red-100 px-2 py-1 rounded"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500">Processed</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredGrievances.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No grievances found</p>
        ) : (
          filteredGrievances.map((g) => (
            <div key={g._id} className="border rounded-lg p-4 shadow-sm">
              <p className="font-semibold text-gray-800">{g.name}</p>
              <p className="text-sm text-gray-600 mt-1">{g.subject}</p>
              <p className="text-sm text-gray-600 mt-1 truncate">{g.complaint}</p>
              <p className="mt-2 text-xs text-gray-500">
                Submitted: {new Date(g.createdAt).toLocaleDateString()}
              </p>
              <span
                className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${getStatusColor(
                  g.status
                )}`}
              >
                {g.status}
              </span>
              <div className="mt-3">
                {g.status === 'submittedToAdmin' ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusUpdate(g, 'approved')}
                      className="text-green-600 hover:text-green-900 bg-green-100 px-3 py-1 rounded text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(g, 'rejected')}
                      className="text-red-600 hover:text-red-900 bg-red-100 px-3 py-1 rounded text-sm"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm">Processed</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && selectedGrievance && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="bg-white w-full max-w-md p-5 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium mb-4 text-center">
              {selectedStatus === 'approved' ? 'Approve' : 'Reject'} Grievance
            </h3>
            <textarea
              rows={4}
              placeholder="Optional admin response"
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusUpdate}
                disabled={loading}
                className={`px-4 py-2 text-white rounded-lg ${
                  selectedStatus === 'approved'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {loading
                  ? 'Processing...'
                  : selectedStatus === 'approved'
                  ? 'Approve'
                  : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampusGrievanceAdmin;
