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



import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    dispatch(fetchAllGrievances());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setShowModal(false);
      setSelectedGrievance(null);
      setAdminResponse('');
      setTimeout(() => dispatch(clearSuccess()), 3000);
    }
  }, [success, dispatch]);

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
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Student Grievance Management</h1>

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          Grievance status updated successfully!
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
          <button
            onClick={() => dispatch(clearError())}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by student, email, title or complaint..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="submittedToAdmin">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Grievances Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Complaint</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Counsellor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
      </div>

      {/* Modal for Admin Response */}
      {showModal && selectedGrievance && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-start justify-center z-50 pt-20">
          <div className="bg-white w-96 p-5 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium mb-4">
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
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
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

export default ComplaintManagement;
