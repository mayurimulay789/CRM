// import React, { useState, useEffect, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import axios from "axios";
// import Swal from "sweetalert2";
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
//   const userRole = useSelector((state) => state.auth.user.role);

//   const [showForm, setShowForm] = useState(false);
//   const [editingGrievance, setEditingGrievance] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterStatus, setFilterStatus] = useState("all");

//   // Filter button state
//   const [showFilterMenu, setShowFilterMenu] = useState(false);
//   const filterButtonRef = useRef(null);
//   const filterMenuRef = useRef(null);

//   const [formData, setFormData] = useState({
//     studentName: "",
//     studentEmail: "",
//     title: "",
//     complaint: "",
//   });

//   const [studentQuery, setStudentQuery] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [showDropdown, setShowDropdown] = useState(false);

//   useEffect(() => {
//     if (userRole === "Counsellor") {
//       dispatch(fetchGrievancesByRole("counsellor"));
//     }
//   }, [dispatch, userRole]);

//   useEffect(() => {
//     if (success) {
//       Swal.fire("Success!", success, "success");
//       setShowForm(false);
//       setEditingGrievance(null);
//       setFormData({ studentName: "", studentEmail: "", title: "", complaint: "" });
//       setTimeout(() => dispatch(clearSuccess()), 3000);
//     }
//     if (error) {
//       Swal.fire("Error!", error, "error");
//       dispatch(clearError());
//     }
//   }, [success, error, dispatch]);

//   // ✅ Validation with SweetAlert
//   const validateForm = () => {
//     if (!formData.studentName.trim()) {
//       Swal.fire("Warning", "Please enter student name.", "warning");
//       return false;
//     }
//     if (!formData.studentEmail.trim()) {
//       Swal.fire("Warning", "Please enter student email.", "warning");
//       return false;
//     } else if (!/\S+@\S+\.\S+/.test(formData.studentEmail)) {
//       Swal.fire("Warning", "Please enter a valid email address.", "warning");
//       return false;
//     }
//     if (!formData.complaint.trim()) {
//       Swal.fire("Warning", "Please enter complaint details.", "warning");
//       return false;
//     }
//     return true;
//   };

//   const handleStudentSearch = async (query) => {
//     setStudentQuery(query);
//     setFormData((prev) => ({ ...prev, studentName: query }));

//     if (query.length > 1) {
//       try {
//         const res = await axios.get(
//           `http://localhost:5000/api/search-approved-students?name=${query}`
//         );
//         setSearchResults(res.data.data || []);
//         setShowDropdown(true);
//       } catch (error) {
//         console.error("Error fetching students:", error);
//       }
//     } else {
//       setShowDropdown(false);
//     }
//   };

//   const handleSelectStudent = (student) => {
//     setFormData({
//       ...formData,
//       studentName: student.studentName,
//       studentEmail: student.email,
//     });
//     setStudentQuery(student.studentName);
//     setShowDropdown(false);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     if (editingGrievance) {
//       dispatch(updateGrievance({ id: editingGrievance._id, grievanceData: formData }));
//     } else {
//       dispatch(createGrievance(formData));
//     }
//   };

//   const handleEdit = (grievance) => {
//     if (grievance.status !== "submittedToAdmin") {
//       Swal.fire("Error", "Cannot edit grievance after admin action.", "error");
//       return;
//     }
//     setEditingGrievance(grievance);
//     setFormData({
//       studentName: grievance.studentName,
//       studentEmail: grievance.studentEmail,
//       title: grievance.title,
//       complaint: grievance.complaint,
//     });
//     setShowForm(true);
//   };

//   const handleDelete = (grievance) => {
//     if (grievance.status !== "submittedToAdmin") {
//       Swal.fire("Error", "Cannot delete grievance after admin action.", "error");
//       return;
//     }
//     Swal.fire({
//       title: "Are you sure?",
//       text: "This grievance will be permanently deleted!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//       confirmButtonText: "Yes, delete it!",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         dispatch(deleteGrievance(grievance._id));
//         Swal.fire("Deleted!", "Grievance deleted successfully.", "success");
//       }
//     });
//   };

//   // ✅ Filter logic
//   const filteredGrievances = grievances.filter((g) => {
//     const matchesSearch =
//       (g.studentName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
//       (g.complaint?.toLowerCase() || "").includes(searchTerm.toLowerCase());
//     const matchesFilter = filterStatus === "all" || g.status === filterStatus;
//     return matchesSearch && matchesFilter;
//   });

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "pending":
//       case "submittedToAdmin":
//         return "bg-yellow-100 text-yellow-800";
//       case "approved":
//         return "bg-green-100 text-green-800";
//       case "rejected":
//         return "bg-red-100 text-red-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   // ✅ Close filter menu on outside click
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (
//         filterMenuRef.current &&
//         !filterMenuRef.current.contains(e.target) &&
//         !filterButtonRef.current.contains(e.target)
//       ) {
//         setShowFilterMenu(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <div className="p-4 sm:p-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
//         <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
//           Student Grievance
//         </h1>
//         {!showForm && (
//           <button
//             onClick={() => setShowForm(true)}
//             className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md w-full sm:w-auto"
//           >
//             + Add Grievance
//           </button>
//         )}
//       </div>

//       {/* Form */}
//       {showForm ? (
//         // ✅ Grievance Form
//         <div className="bg-white rounded-lg shadow-md p-5 sm:p-6">
//           <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700">
//             {editingGrievance ? "Edit Grievance" : "Submit Grievance"}
//           </h2>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               {/* Student Name Search */}
//               <div className="relative">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Student Name *
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Search student..."
//                   value={studentQuery}
//                   onChange={(e) => handleStudentSearch(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//                 {showDropdown && (
//                   <ul className="absolute bg-white border border-gray-300 rounded-lg w-full mt-1 max-h-40 overflow-y-auto z-10">
//                     {searchResults.length > 0 ? (
//                       searchResults.map((student, i) => (
//                         <li
//                           key={i}
//                           onClick={() => handleSelectStudent(student)}
//                           className="p-2 hover:bg-blue-100 cursor-pointer"
//                         >
//                           {student.studentName} - {student.email}
//                         </li>
//                       ))
//                     ) : (
//                       <li className="p-2 text-gray-500">No students found</li>
//                     )}
//                   </ul>
//                 )}
//               </div>

//               {/* Student Email */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Student Email *
//                 </label>
//                 <input
//                   type="email"
//                   placeholder="Enter email"
//                   value={formData.studentEmail}
//                   onChange={(e) =>
//                     setFormData({ ...formData, studentEmail: e.target.value })
//                   }
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg 
//              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   required
//                 />
//               </div>

//               {/* Complaint */}
//               <div className="sm:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Complaint *
//                 </label>
//                 <textarea
//                   placeholder="Describe your complaint"
//                   value={formData.complaint}
//                   onChange={(e) =>
//                     setFormData({ ...formData, complaint: e.target.value })
//                   }
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg 
//              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   rows="4"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Buttons */}
//             <div className="flex flex-col sm:flex-row justify-end gap-3">
//               <button
//                 type="button"
//                 onClick={() => {
//                   setShowForm(false);
//                   setEditingGrievance(null);
//                   setFormData({
//                     studentName: "",
//                     studentEmail: "",
                    
//                     complaint: "",
//                   });
//                 }}
//                 className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto"
//               >
//                 {editingGrievance ? "Update" : "Submit"}
//               </button>
//             </div>
//           </form>
//         </div>
//       ) : (
//         // ✅ Table Section with Filter Dropdown
//         <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center space-x-3 p-3 rounded-lg">
//               {/* Filter Button */}
//               <div className="absolute">
//                 <button
//                   ref={filterButtonRef}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setShowFilterMenu(!showFilterMenu);
//                   }}
//                   className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
//                 >
//                   <span>🔍</span>
//                   <span>Filter</span>
//                   <span>▼</span>
//                 </button>

//                 {showFilterMenu && (
//                   <div
//                     ref={filterMenuRef}
//                     className="absolute right-0 left-2 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
//                   >
//                     <div className="p-4">
//                       <h3 className="font-semibold text-gray-800 mb-3">
//                         Filter by Status
//                       </h3>
//                       <div className="space-y-2">
//                         {["all", "submittedToAdmin", "approved", "rejected"].map(
//                           (status) => (
//                             <label
//                               key={status}
//                               className="flex items-center space-x-2 cursor-pointer"
//                             >
//                               <input
//                                 type="radio"
//                                 name="status"
//                                 value={status}
//                                 checked={filterStatus === status}
//                                 onChange={(e) => setFilterStatus(e.target.value)}
//                                 className="text-blue-500 focus:ring-blue-500"
//                               />
//                               <span className="capitalize">
//                                 {status === "all" ? "All Status" : status}
//                               </span>
//                             </label>
//                           )
//                         )}
//                       </div>

//                       <div className="mt-4 pt-3 border-t border-gray-200">
//                         <h3 className="font-semibold text-gray-800 mb-3">
//                           Search
//                         </h3>
//                         <input
//                           type="text"
//                           placeholder="Search students..."
//                           value={searchTerm}
//                           onChange={(e) => setSearchTerm(e.target.value)}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         />
//                       </div>

//                       <div className="mt-4 flex justify-between">
//                         <button
//                           onClick={() => {
//                             setFilterStatus("all");
//                             setSearchTerm("");
//                           }}
//                           className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
//                         >
//                           Reset
//                         </button>
//                         <button
//                           onClick={() => setShowFilterMenu(false)}
//                           className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
//                         >
//                           Apply
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* ✅ Table */}
//           <div className="overflow-x-auto">
//             <table className="min-w-full table-auto text-sm sm:text-base">
//               <thead className="bg-gray-50">
//                 <tr>
//                   {["Student", "Complaint", "Status", "Date", "Actions"].map(
//                     (head) => (
//                       <th
//                         key={head}
//                         className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider"
//                       >
//                         {head}
//                       </th>
//                     )
//                   )}
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredGrievances.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan="5"
//                       className="px-4 py-8 text-center text-gray-500"
//                     >
//                       No grievances found
//                     </td>
//                   </tr>
//                 ) : (
//                   // filteredGrievances.map((g) => (
//                     [...filteredGrievances].reverse().map((g) => (
//                     <tr key={g._id} className="hover:bg-gray-50">
//                       <td className="px-4 py-4">
//                         <div className="font-semibold">{g.studentName}</div>
//                         <div className="text-sm text-gray-500">
//                           {g.studentEmail}
//                         </div>
//                       </td>
//                       <td className="px-4 py-4 truncate max-w-[200px]">
//                         {g.complaint}
//                         {g.adminResponse && (
//                           <div className="mt-1 text-sm text-blue-700">
//                             <strong>Admin:</strong> {g.adminResponse}
//                           </div>
//                         )}
//                       </td>
//                       <td className="px-4 py-4">
//                         <span
//                           className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
//                             g.status
//                           )}`}
//                         >
//                           {g.status}
//                         </span>
//                       </td>
//                       <td className="px-4 py-4 text-gray-500">
//                         {new Date(g.createdAt).toLocaleDateString()}
//                       </td>
//                       <td className="px-4 py-4">
//                         {g.status === "submittedToAdmin" ? (
//                           <div className="flex flex-wrap gap-2">
//                             <button
//                               onClick={() => handleEdit(g)}
//                               className="text-blue-600 hover:text-blue-900 bg-blue-100 px-2 py-1 rounded text-xs sm:text-sm"
//                             >
//                               Edit
//                             </button>
//                             <button
//                               onClick={() => handleDelete(g)}
//                               className="text-red-600 hover:text-red-900 bg-red-100 px-2 py-1 rounded text-xs sm:text-sm"
//                             >
//                               Delete
//                             </button>
//                           </div>
//                         ) : (
//                           <span className="text-gray-500 text-xs sm:text-sm">
//                             Processed
//                           </span>
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



/* 100% RESPONSIVE VERSION */

import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
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
  const userRole = useSelector((state) => state.auth.user.role);

  const [showForm, setShowForm] = useState(false);
  const [editingGrievance, setEditingGrievance] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterButtonRef = useRef(null);
  const filterMenuRef = useRef(null);

  const [formData, setFormData] = useState({
    studentName: "",
    studentEmail: "",
    title: "",
    complaint: "",
  });

  useEffect(() => {
    if (userRole === "Counsellor") {
      dispatch(fetchGrievancesByRole("counsellor"));
    }
  }, [dispatch, userRole]);

  useEffect(() => {
    if (success) {
      Swal.fire("Success!", success, "success");
      setShowForm(false);
      setEditingGrievance(null);
      setFormData({ studentName: "", studentEmail: "", title: "", complaint: "" });
      setTimeout(() => dispatch(clearSuccess()), 2000);
    }
    if (error) {
      Swal.fire("Error!", error, "error");
      dispatch(clearError());
    }
  }, [success, error, dispatch]);

  const validateForm = () => {
    if (!formData.studentName.trim()) {
      Swal.fire("Warning", "Please enter student name.", "warning");
      return false;
    }
    if (!formData.studentEmail.trim()) {
      Swal.fire("Warning", "Please enter student email.", "warning");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(formData.studentEmail)) {
      Swal.fire("Warning", "Please enter a valid email address.", "warning");
      return false;
    }
    if (!formData.complaint.trim()) {
      Swal.fire("Warning", "Please enter complaint details.", "warning");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingGrievance) {
      dispatch(updateGrievance({ id: editingGrievance._id, grievanceData: formData }));
    } else {
      dispatch(createGrievance(formData));
    }
  };

  const handleEdit = (g) => {
    if (g.status !== "submittedToAdmin") {
      Swal.fire("Error", "Cannot edit this grievance.", "error");
      return;
    }
    setEditingGrievance(g);
    setFormData({
      studentName: g.studentName,
      studentEmail: g.studentEmail,
      title: g.title,
      complaint: g.complaint,
    });
    setShowForm(true);
  };

  const handleDelete = (g) => {
    if (g.status !== "submittedToAdmin") {
      Swal.fire("Error", "Cannot delete this grievance.", "error");
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "This grievance will be deleted!",
      icon: "warning",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteGrievance(g._id));
        Swal.fire("Deleted!", "The grievance was deleted.", "success");
      }
    });
  };

  const filteredGrievances = grievances.filter((g) => {
    const matchSearch =
      g.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.complaint?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = filterStatus === "all" || g.status === filterStatus;

    return matchSearch && matchStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
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

  // close menu if clicked outside
  useEffect(() => {
    const handleClick = (e) => {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(e.target) &&
        !filterButtonRef.current.contains(e.target)
      ) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="p-3 sm:p-5 lg:p-8 min-h-screen bg-gray-50">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Student Grievance
        </h1>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
          >
            + Add Grievance
          </button>
        )}
      </div>

      {/* FORM (FULLY RESPONSIVE) */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            {editingGrievance ? "Edit Grievance" : "Submit Grievance"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) =>
                    setFormData({ ...formData, studentName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Email *
                </label>
                <input
                  type="email"
                  value={formData.studentEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, studentEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email"
                />
              </div>

              {/* Complaint */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complaint *
                </label>
                <textarea
                  value={formData.complaint}
                  onChange={(e) =>
                    setFormData({ ...formData, complaint: e.target.value })
                  }
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your complaint..."
                />
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingGrievance(null);
                  setFormData({
                    studentName: "",
                    studentEmail: "",
                    title: "",
                    complaint: "",
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingGrievance ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE SECTION */}
      {!showForm && (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mt-4">
          {/* FILTER AREA */}
          <div className="relative mb-4 flex justify-between items-center">
            <div className="relative">
              <button
                ref={filterButtonRef}
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                🔍 Filter ▼
              </button>

              {showFilterMenu && (
                <div
                  ref={filterMenuRef}
                  className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50"
                >
                  {/* Status */}
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Filter by Status
                  </h3>
                  <div className="space-y-2">
                    {["all", "submittedToAdmin", "approved", "rejected"].map(
                      (s) => (
                        <label key={s} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="status"
                            checked={filterStatus === s}
                            value={s}
                            onChange={(e) =>
                              setFilterStatus(e.target.value)
                            }
                          />
                          <span className="capitalize">
                            {s === "all"
                              ? "All"
                              : s.replace(/([A-Z])/g, " $1")}
                          </span>
                        </label>
                      )
                    )}
                  </div>

                  {/* Search */}
                  <h3 className="font-semibold text-gray-800 mt-4 mb-2">
                    Search
                  </h3>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Search grievances..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  {/* Buttons */}
                  <div className="flex justify-between mt-4 border-t pt-3">
                    <button
                      onClick={() => {
                        setFilterStatus("all");
                        setSearchTerm("");
                      }}
                      className="text-gray-500 text-sm"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setShowFilterMenu(false)}
                      className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RESPONSIVE TABLE */}
          <div className="overflow-x-auto border border-gray-100 rounded-lg">
            <table className="min-w-[700px] w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Student", "Complaint", "Status", "Date", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-gray-600 font-medium text-xs uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredGrievances.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-6 text-gray-500"
                    >
                      No grievances found.
                    </td>
                  </tr>
                ) : (
                  [...filteredGrievances].reverse().map((g) => (
                    <tr key={g._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-semibold">{g.studentName}</div>
                        <div className="text-gray-500 text-xs sm:text-sm">
                          {g.studentEmail}
                        </div>
                      </td>

                      <td className="px-4 py-3 max-w-[280px] break-words">
                        {g.complaint}
                        {g.adminResponse && (
                          <p className="mt-1 text-blue-700 text-xs sm:text-sm">
                            <strong>Admin:</strong> {g.adminResponse}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-semibold ${getStatusColor(
                            g.status
                          )}`}
                        >
                          {g.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-gray-500 text-xs sm:text-sm">
                        {new Date(g.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3">
                        {g.status === "submittedToAdmin" ? (
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleEdit(g)}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(g)}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded"
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">
                            Processed
                          </span>
                        )}
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
