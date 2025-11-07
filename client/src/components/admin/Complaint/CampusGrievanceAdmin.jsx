import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    try {
      const data = await getAllGrievances();
      setGrievances(data);
    } catch (err) {
      setError('Failed to fetch grievances');
    }
  };

  const handleApprove = async (id) => {
    setLoading(true);
    try {
      await approveGrievance(id, { adminResponse: suggestions[id] || '' });
      setSuccess('Grievance approved successfully!');
      setSuggestions({ ...suggestions, [id]: '' });
      fetchGrievances();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to approve grievance');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    setLoading(true);
    try {
      await rejectGrievance(id, { adminResponse: suggestions[id] || '' });
      setSuccess('Grievance rejected successfully!');
      setSuggestions({ ...suggestions, [id]: '' });
      fetchGrievances();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to reject grievance');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this grievance?')) {
      try {
        await deleteGrievance(id);
        setSuccess('Grievance deleted successfully!');
        fetchGrievances();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete grievance');
      }
    }
  };

  const filteredGrievances = grievances.filter((g) => {
    const matchesSearch =
      (g.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (g.complaint?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (g.grievanceType?.toLowerCase() || '').includes(searchTerm.toLowerCase());
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
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Campus Grievance Management</h1>

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
          <button
            onClick={() => setError('')}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, complaint, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="submittedToAdmin">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Grievances Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGrievances.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No grievances found
                  </td>
                </tr>
              ) : (
                filteredGrievances.map((grievance) => (
                  <tr key={grievance._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {grievance.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{grievance.grievanceType}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {grievance.complaint}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          grievance.status
                        )}`}
                      >
                        {grievance.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(grievance.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      {grievance.status === 'submittedToAdmin' && (
                        <div className="flex flex-col space-y-2">
                          <input
                            type="text"
                            placeholder="Suggestion (optional)"
                            value={suggestions[grievance._id] || ''}
                            onChange={(e) => setSuggestions({ ...suggestions, [grievance._id]: e.target.value })}
                            className="px-2 py-1 border border-gray-300 rounded text-xs"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprove(grievance._id)}
                              disabled={loading}
                              className="text-green-600 hover:text-green-900 bg-green-100 px-2 py-1 rounded disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(grievance._id)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-900 bg-red-100 px-2 py-1 rounded disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      )}
                      {grievance.status !== 'submittedToAdmin' && (
                        <span className="text-gray-500">Processed</span>
                      )}
                      <button
                        onClick={() => handleDelete(grievance._id)}
                        className="ml-2 text-gray-600 hover:text-gray-900 bg-gray-100 px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  );
};

export default CampusGrievanceAdmin;
