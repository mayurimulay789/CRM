// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   fetchAllGrievances,
//   updateGrievanceStatus,
//   clearError,
//   clearSuccess,
// } from '../../../store/slices/studentGrievanceSlice';

// const ComplaintManagement = () => {
//   const dispatch = useDispatch();
//   const { grievances, loading, error, success } = useSelector(
//     (state) => state.studentGrievance
//   );

//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [selectedGrievance, setSelectedGrievance] = useState(null);
//   const [selectedStatus, setSelectedStatus] = useState('');
//   const [showModal, setShowModal] = useState(false);
//   const [adminResponse, setAdminResponse] = useState('');

//   useEffect(() => {
//     dispatch(fetchAllGrievances());
//   }, [dispatch]);

//   useEffect(() => {
//     if (success) {
//       setShowModal(false);
//       setSelectedGrievance(null);
//       setAdminResponse('');
//       setTimeout(() => dispatch(clearSuccess()), 3000);
//     }
//   }, [success, dispatch]);

//   const filteredGrievances = grievances.filter((grievance) => {
//     const matchesSearch =
//       (grievance.studentName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
//       (grievance.studentEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
//       (grievance.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
//       (grievance.complaint?.toLowerCase() || '').includes(searchTerm.toLowerCase());

//     const matchesFilter = filterStatus === 'all' || grievance.status === filterStatus;

//     return matchesSearch && matchesFilter;
//   });

//   const handleStatusUpdate = (grievance, status) => {
//     setSelectedGrievance(grievance);
//     setSelectedStatus(status);
//     setShowModal(true);
//   };

//   const handleConfirmStatusUpdate = () => {
//     if (selectedGrievance) {
//       dispatch(
//         updateGrievanceStatus({
//           id: selectedGrievance._id,
//           status: selectedStatus,
//           adminResponse,
//         })
//       );
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'pending':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'approved':
//         return 'bg-green-100 text-green-800';
//       case 'rejected':
//         return 'bg-red-100 text-red-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold text-gray-800 mb-6">Student Grievance Management</h1>

//       {success && (
//         <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
//           Grievance status updated successfully!
//         </div>
//       )}

//       {error && (
//         <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
//           {error}
//           <button
//             onClick={() => dispatch(clearError())}
//             className="ml-2 text-red-500 hover:text-red-700"
//           >
//             ×
//           </button>
//         </div>
//       )}

//       {/* Filters and Search */}
//       <div className="bg-white rounded-lg shadow p-6 mb-6">
//         <div className="flex flex-col md:flex-row gap-4 mb-4">
//           <div className="flex-1">
//             <input
//               type="text"
//               placeholder="Search by student name, email, type, or counsellor..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//           <div>
//             <select
//               value={filterStatus}
//               onChange={(e) => setFilterStatus(e.target.value)}
//               className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="all">All Status</option>
//               <option value="pending">Pending</option>
//               <option value="approved">Approved</option>
//               <option value="rejected">Rejected</option>
//             </select>
//           </div>
//         </div>

//         {/* Grievances Table */}
//         <div className="overflow-x-auto">
//           <table className="min-w-full table-auto">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Student Details
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Type
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Description
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Counsellor
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Submitted
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredGrievances.length === 0 ? (
//                 <tr>
//                   <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
//                     No grievances found
//                   </td>
//                 </tr>
//               ) : (
//                 filteredGrievances.map((grievance) => (
//                   <tr key={grievance._id} className="hover:bg-gray-50">
//                     <td className="px-4 py-4 whitespace-nowrap">
//                       <div>
//                         <div className="text-sm font-medium text-gray-900">
//                           {grievance.studentName}
//                         </div>
//                         <div className="text-sm text-gray-500">{grievance.studentEmail}</div>
//                       </div>
//                     </td>
//                     <td className="px-4 py-4 whitespace-nowrap">
//                       <span className="text-sm text-gray-900">{grievance.title}</span>
//                     </td>
//                     <td className="px-4 py-4">
//                       <div className="text-sm text-gray-900 max-w-xs truncate">
//                         {grievance.complaint}
//                       </div>
//                     </td>
//                     <td className="px-4 py-4 whitespace-nowrap">
//                       <span className="text-sm text-gray-900">
//                         {grievance.counsellorId?.FullName || 'N/A'}
//                       </span>
//                     </td>
//                     <td className="px-4 py-4 whitespace-nowrap">
//                       <span
//                         className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
//                           grievance.status
//                         )}`}
//                       >
//                         {grievance.status}
//                       </span>
//                     </td>
//                     <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {new Date(grievance.createdAt).toLocaleDateString()}
//                     </td>
//                     <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
//                       {grievance.status === 'pending' && (
//                         <div className="flex space-x-2">
//                           <button
//                             onClick={() => handleStatusUpdate(grievance, 'approved')}
//                             className="text-green-600 hover:text-green-900 bg-green-100 px-2 py-1 rounded"
//                           >
//                             Approve
//                           </button>
//                           <button
//                             onClick={() => handleStatusUpdate(grievance, 'rejected')}
//                             className="text-red-600 hover:text-red-900 bg-red-100 px-2 py-1 rounded"
//                           >
//                             Reject
//                           </button>
//                         </div>
//                       )}
//                       {grievance.status !== 'pending' && (
//                         <span className="text-gray-500">Processed</span>
//                       )}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Modal for Admin Response */}
//       {showModal && selectedGrievance && (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
//           <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
//             <div className="mt-3">
//               <h3 className="text-lg font-medium text-gray-900 mb-4">
//                 {selectedStatus === 'approved' ? 'Approve' : 'Reject'} Grievance
//               </h3>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Admin Response (Optional)
//                 </label>
//                 <textarea
//                   value={adminResponse}
//                   onChange={(e) => setAdminResponse(e.target.value)}
//                   rows={4}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter your response..."
//                 />
//               </div>
//               <div className="flex justify-end space-x-3">
//                 <button
//                   onClick={() => setShowModal(false)}
//                   className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleConfirmStatusUpdate}
//                   disabled={loading}
//                   className={`px-4 py-2 text-white rounded-lg ${
//                     selectedStatus === 'approved'
//                       ? 'bg-green-600 hover:bg-green-700'
//                       : 'bg-red-600 hover:bg-red-700'
//                   } disabled:opacity-50`}
//                 >
//                   {loading ? 'Processing...' : selectedStatus === 'approved' ? 'Approve' : 'Reject'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ComplaintManagement;
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllGrievances,
  updateGrievanceStatus,
  clearError,
  clearSuccess,
} from '../../../store/slices/studentGrievanceSlice';

const ComplaintManagement = () => {
  const dispatch = useDispatch();
  const { grievances, loading, error, success } = useSelector(
    (state) => state.studentGrievance
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterButtonRef = useRef(null);
  const filterMenuRef = useRef(null);
  const modalRef = useRef(null);

  // Fetch grievances
  useEffect(() => {
    dispatch(fetchAllGrievances());
  }, [dispatch]);

  // Clear alerts after success
  useEffect(() => {
    if (success) {
      setShowModal(false);
      setSelectedGrievance(null);
      setAdminResponse('');
      setTimeout(() => dispatch(clearSuccess()), 3000);
    }
  }, [success, dispatch]);

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

  const filteredGrievances = grievances.filter((g) => {
    const matchesSearch =
      (g.studentName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (g.studentEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (g.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (g.complaint?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || g.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleStatusUpdate = (grievance, status) => {
    setSelectedGrievance(grievance);
    setSelectedStatus(status);
    setAdminResponse(grievance.adminResponse || '');
    setShowModal(true);
  };

  const handleConfirmStatusUpdate = () => {
    if (selectedGrievance) {
      dispatch(
        updateGrievanceStatus({
          id: selectedGrievance._id,
          status: selectedStatus,
          adminResponse,
        })
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
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
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
        Student Grievance Management
      </h1>

      {/* Alerts */}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm sm:text-base">
          Grievance status updated successfully!
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm sm:text-base flex justify-between">
          {error}
          <button
            onClick={() => dispatch(clearError())}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Search & Filter Button */}
      <div className="flex items-center mb-6 relative">
        <button
          ref={filterButtonRef}
          onClick={(e) => {
            e.stopPropagation();
            setShowFilterMenu(!showFilterMenu);
          }}
          className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          <span>🔍</span>
          <span>Filter</span>
          <span>▼</span>
        </button>

        {showFilterMenu && (
          <div
            ref={filterMenuRef}
            className="absolute left-0 mt-12 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
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

      {/* Table (Desktop) */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow p-4">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              {['Student', 'Complaint', 'Counsellor', 'Status', 'Submitted', 'Actions'].map(
                (head) => (
                  <th
                    key={head}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium">{g.studentName}</div>
                    <div className="text-sm text-gray-500">{g.studentEmail}</div>
                  </td>
                  <td className="px-4 py-4">{g.complaint}</td>
                  <td className="px-4 py-4">{g.counsellorId?.FullName || 'N/A'}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        g.status
                      )}`}
                    >
                      {g.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {new Date(g.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    {g.status === 'submittedToAdmin' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusUpdate(g, 'approved')}
                          className="text-green-600 bg-green-100 px-2 py-1 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(g, 'rejected')}
                          className="text-red-600 bg-red-100 px-2 py-1 rounded"
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

      {/* Mobile Card View */}
      <div className="space-y-4 md:hidden">
        {filteredGrievances.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No grievances found</p>
        ) : (
          filteredGrievances.map((g) => (
            <div
              key={g._id}
              className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-gray-800">{g.studentName}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusColor(
                    g.status
                  )}`}
                >
                  {g.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{g.complaint}</p>
              <p className="text-xs text-gray-500 mb-2">
                Counsellor: {g.counsellorId?.FullName || 'N/A'}
              </p>
              <p className="text-xs text-gray-400 mb-3">
                Submitted: {new Date(g.createdAt).toLocaleDateString()}
              </p>
              {g.status === 'submittedToAdmin' ? (
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleStatusUpdate(g, 'approved')}
                    className="text-green-600 bg-green-100 px-3 py-1 rounded text-xs"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(g, 'rejected')}
                    className="text-red-600 bg-red-100 px-3 py-1 rounded text-xs"
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <p className="text-right text-gray-500 text-xs">Processed</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && selectedGrievance && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div
            ref={modalRef}
            className="bg-white w-full max-w-sm sm:max-w-md p-5 rounded-lg shadow-lg"
          >
            <h3 className="text-lg font-medium mb-4">
              {selectedStatus === 'approved' ? 'Approve' : 'Reject'} Grievance
            </h3>
            <textarea
              rows={4}
              placeholder="Optional admin response"
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusUpdate}
                disabled={loading}
                className={`px-4 py-2 text-white rounded-lg text-sm ${
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

export default ComplaintManagement;
