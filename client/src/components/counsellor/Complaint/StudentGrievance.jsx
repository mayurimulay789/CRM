// import React, { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   createGrievance,
//   fetchGrievancesByRole,
//   clearError,
//   clearSuccess,
//   updateGrievance,
//   deleteGrievance,
// } from "../../../store/slices/studentGrievanceSlice";

// const StudentGrievance = () => {
//   const dispatch = useDispatch();
//   const { grievances, loading, error, success } = useSelector(
//     (state) => state.studentGrievance
//   );

//   const [showForm, setShowForm] = useState(false);
//   const [editingGrievance, setEditingGrievance] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterStatus, setFilterStatus] = useState("all");
//   const [formData, setFormData] = useState({
//     studentName: "",
//     studentEmail: "",
//     complaint: "",
//   });

//   const userRole = useSelector((state) => state.auth.user.role); // "admin" or "Counsellor"

//   useEffect(() => {
//     if (userRole === "admin") {
//       dispatch(fetchGrievancesByRole("admin"));
//     } else if (userRole === "Counsellor") {
//       dispatch(fetchGrievancesByRole("counsellor"));
//     }
//   }, [dispatch, userRole]);

//   useEffect(() => {
//     if (success) {
//       setShowForm(false);
//       setEditingGrievance(null);
//       setFormData({
//         studentName: "",
//         studentEmail: "",
//         complaint: "",
//       });
//       setTimeout(() => dispatch(clearSuccess()), 3000);
//     }
//   }, [success, dispatch]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (editingGrievance) {
//       dispatch(
//         updateGrievance({ id: editingGrievance._id, grievanceData: formData })
//       );
//     } else {
//       dispatch(createGrievance(formData));
//     }
//   };

//   const handleEdit = (grievance) => {
//     if (grievance.status !== "pending") {
//       alert("Cannot edit grievance that has been processed by admin");
//       return;
//     }
//     setEditingGrievance(grievance);
//     setFormData({
//       studentName: grievance.studentName,
//       studentEmail: grievance.studentEmail,
//       complaint: grievance.complaint,
//     });
//     setShowForm(true);
//   };

//   const handleDelete = (id, status) => {
//     if (status !== "pending") {
//       alert("Cannot delete grievance that has been processed by admin");
//       return;
//     }
//     if (window.confirm("Are you sure you want to delete this grievance?")) {
//       dispatch(deleteGrievance(id));
//     }
//   };

//   const handleCancel = () => {
//     setShowForm(false);
//     setEditingGrievance(null);
//     setFormData({
//       studentName: "",
//       studentEmail: "",
//       complaint: "",
//     });
//   };

//   const filteredGrievances = grievances.filter((grievance) => {
//     const matchesSearch =
//       (grievance.studentName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
//       (grievance.studentEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase());

//     const matchesFilter = filterStatus === "all" || grievance.status === filterStatus;

//     return matchesSearch && matchesFilter;
//   });

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "pending":
//         return "bg-yellow-100 text-yellow-800";
//       case "approved":
//         return "bg-green-100 text-green-800";
//       case "rejected":
//         return "bg-red-100 text-red-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">Student Grievance</h1>
//         {userRole === "Counsellor" && !showForm && (
//           <button
//             onClick={() => setShowForm(true)}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Add Student Grievance
//           </button>
//         )}
//       </div>

//       {success && (
//         <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
//           Grievance {editingGrievance ? "updated" : "submitted"} successfully!
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

//       {showForm ? (
//         /* Grievance Form */
//         <div className="bg-white rounded-lg shadow p-6">
//           <h2 className="text-xl font-semibold mb-4">
//             {editingGrievance ? "Edit Student Grievance" : "Submit Student Grievance"}
//           </h2>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Student Name *
//                 </label>
//                 <input
//                   type="text"
//                   name="studentName"
//                   value={formData.studentName}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter student name"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Email *
//                 </label>
//                 <input
//                   type="email"
//                   name="studentEmail"
//                   value={formData.studentEmail}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter email"
//                 />
//               </div>

//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Complaint *
//                 </label>
//                 <textarea
//                   name="complaint"
//                   value={formData.complaint}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Describe the complaint"
//                   rows="4"
//                 />
//               </div>
//             </div>

//             <div className="flex justify-end space-x-3">
//               <button
//                 type="button"
//                 onClick={handleCancel}
//                 className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//               >
//                 {loading
//                   ? "Submitting..."
//                   : editingGrievance
//                   ? "Update Grievance"
//                   : "Submit Grievance"}
//               </button>
//             </div>
//           </form>
//         </div>
//       ) : (
//         /* Grievances Table */
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex flex-col md:flex-row gap-4 mb-4">
//             <input
//               type="text"
//               placeholder="Search by name or email..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
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

//           <div className="overflow-x-auto">
//             <table className="min-w-full table-auto">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Student Details
//                   </th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Submitted
//                   </th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredGrievances.length === 0 ? (
//                   <tr>
//                     <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
//                       No grievances found
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredGrievances.map((grievance) => (
//                     <tr key={grievance._id} className="hover:bg-gray-50">
//                       <td className="px-4 py-4 whitespace-nowrap">
//                         <div>
//                           <div className="text-sm font-medium text-gray-900">
//                             {grievance.studentName}
//                           </div>
//                           <div className="text-sm text-gray-500">{grievance.studentEmail}</div>
//                           <div className="text-sm text-gray-600">{grievance.complaint}</div>
//                         </div>
//                       </td>
//                       <td className="px-4 py-4 whitespace-nowrap">
//                         <span
//                           className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
//                             grievance.status
//                           )}`}
//                         >
//                           {grievance.status}
//                         </span>
//                       </td>
//                       <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {new Date(grievance.createdAt).toLocaleDateString()}
//                       </td>
//                       <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
//                         {grievance.status === "pending" && userRole === "Counsellor" ? (
//                           <div className="flex space-x-2">
//                             <button
//                               onClick={() => handleEdit(grievance)}
//                               className="text-blue-600 hover:text-blue-900 bg-blue-100 px-2 py-1 rounded"
//                             >
//                               Edit
//                             </button>
//                             <button
//                               onClick={() => handleDelete(grievance._id, grievance.status)}
//                               className="text-red-600 hover:text-red-900 bg-red-100 px-2 py-1 rounded"
//                             >
//                               Delete
//                             </button>
//                           </div>
//                         ) : (
//                           <span className="text-gray-500">Processed</span>
//                         )}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default StudentGrievance;





import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createGrievance,
  fetchGrievancesByRole,
  clearError,
  clearSuccess,
  updateGrievance,
  deleteGrievance,
} from "../../../store/slices/studentGrievanceSlice";

const StudentGrievance = () => {
  const dispatch = useDispatch();
  const { grievances, loading, error, success } = useSelector(
    (state) => state.studentGrievance
  );

  const [showForm, setShowForm] = useState(false);
  const [editingGrievance, setEditingGrievance] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [formData, setFormData] = useState({
    studentName: "",
    studentEmail: "",
    title: "",
    complaint: "",
  });

  const userRole = useSelector((state) => state.auth.user.role);

  useEffect(() => {
    if (userRole === "Counsellor") {
      dispatch(fetchGrievancesByRole("counsellor"));
    }
  }, [dispatch, userRole]);

  useEffect(() => {
    if (success) {
      setShowForm(false);
      setEditingGrievance(null);
      setFormData({ studentName: "", studentEmail: "", title: "", complaint: "" });
      setTimeout(() => dispatch(clearSuccess()), 3000);
    }
  }, [success, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingGrievance) {
      dispatch(updateGrievance({ id: editingGrievance._id, grievanceData: formData }));
    } else {
      dispatch(createGrievance(formData));
    }
  };

  const handleEdit = (grievance) => {
    if (grievance.status !== "submittedToAdmin") {
      alert("Cannot edit grievance after admin action");
      return;
    }
    setEditingGrievance(grievance);
    setFormData({
      studentName: grievance.studentName,
      studentEmail: grievance.studentEmail,
      title: grievance.title,
      complaint: grievance.complaint,
    });
    setShowForm(true);
  };

  const handleDelete = (grievance) => {
    if (grievance.status !== "submittedToAdmin") {
      alert("Cannot delete grievance after admin action");
      return;
    }
    if (window.confirm("Are you sure you want to delete this grievance?")) {
      dispatch(deleteGrievance(grievance._id));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingGrievance(null);
    setFormData({ studentName: "", studentEmail: "", title: "", complaint: "" });
  };

  const filteredGrievances = grievances.filter((g) => {
    const matchesSearch =
      (g.studentName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (g.studentEmail?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (g.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (g.complaint?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || g.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
      case "submittedToAdmin":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Student Grievance</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Student Grievance
          </button>
        )}
      </div>

      {success && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">{success}</div>}
      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      {showForm ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">{editingGrievance ? "Edit" : "Submit"} Grievance</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="studentName"
                placeholder="Student Name"
                value={formData.studentName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="email"
                name="studentEmail"
                placeholder="Student Email"
                value={formData.studentEmail}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg"
              />
              {/* <input
                type="text"
                name="title"
                placeholder="Title / Type"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg md:col-span-2"
              /> */}
              <textarea
                name="complaint"
                placeholder="Complaint"
                value={formData.complaint}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border rounded-lg md:col-span-2"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={handleCancel} className="px-4 py-2 border rounded-lg">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                {editingGrievance ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by name, email, title, complaint..."
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

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Counsellor</th> */}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Complaint</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGrievances.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No grievances found</td>
                  </tr>
                ) : (
                  filteredGrievances.map((g) => (
                    <tr key={g._id}>
                      <td className="px-4 py-4">{g.studentName}<br /><span className="text-gray-500 text-sm">{g.studentEmail}</span></td>
                      {/* <td className="px-4 py-4">{g.title}</td> */}
                      {/* <td className="px-4 py-4 max-w-xs truncate">{g.complaint}</td> */}
                      <td className="px-4 py-4 max-w-xs">
  <div className="truncate">{g.complaint}</div>
  {g.adminResponse && (
    <div className="mt-1 text-sm text-blue-700">
      <strong>Admin Response:</strong> {g.adminResponse}
    </div>
  )}
</td>

                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(g.status)}`}>
                          {g.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">{new Date(g.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-4">
                        {g.status === "submittedToAdmin" && (
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(g)} className="text-blue-600 bg-blue-100 px-2 py-1 rounded">Edit</button>
                            <button onClick={() => handleDelete(g)} className="text-red-600 bg-red-100 px-2 py-1 rounded">Delete</button>
                          </div>
                        )}
                        {g.status !== "submittedToAdmin" && <span className="text-gray-500">Processed</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentGrievance;
