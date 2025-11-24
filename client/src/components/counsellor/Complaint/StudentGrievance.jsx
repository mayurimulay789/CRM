// import React, { useState, useEffect, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
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

//   const [showFilterMenu, setShowFilterMenu] = useState(false);
//   const filterButtonRef = useRef(null);
//   const filterMenuRef = useRef(null);

//   const [formData, setFormData] = useState({
//     studentName: "",
//     studentEmail: "",
//     title: "",
//     complaint: "",
//   });

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
//       setTimeout(() => dispatch(clearSuccess()), 2000);
//     }
//     if (error) {
//       Swal.fire("Error!", error, "error");
//       dispatch(clearError());
//     }
//   }, [success, error, dispatch]);

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

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     if (editingGrievance) {
//       dispatch(updateGrievance({ id: editingGrievance._id, grievanceData: formData }));
//     } else {
//       dispatch(createGrievance(formData));
//     }
//   };

//   const handleEdit = (g) => {
//     if (g.status !== "submittedToAdmin") {
//       Swal.fire("Error", "Cannot edit this grievance.", "error");
//       return;
//     }
//     setEditingGrievance(g);
//     setFormData({
//       studentName: g.studentName,
//       studentEmail: g.studentEmail,
//       title: g.title,
//       complaint: g.complaint,
//     });
//     setShowForm(true);
//   };

//   const handleDelete = (g) => {
//     if (g.status !== "submittedToAdmin") {
//       Swal.fire("Error", "Cannot delete this grievance.", "error");
//       return;
//     }

//     Swal.fire({
//       title: "Are you sure?",
//       text: "This grievance will be deleted!",
//       icon: "warning",
//       showCancelButton: true,
//     }).then((result) => {
//       if (result.isConfirmed) {
//         dispatch(deleteGrievance(g._id));
//         Swal.fire("Deleted!", "The grievance was deleted.", "success");
//       }
//     });
//   };

//   const filteredGrievances = grievances.filter((g) => {
//     const matchSearch =
//       g.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       g.complaint?.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchStatus = filterStatus === "all" || g.status === filterStatus;

//     return matchSearch && matchStatus;
//   });

//   const getStatusColor = (status) => {
//     switch (status) {
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

//   // close menu if clicked outside
//   useEffect(() => {
//     const handleClick = (e) => {
//       if (
//         filterMenuRef.current &&
//         !filterMenuRef.current.contains(e.target) &&
//         !filterButtonRef.current.contains(e.target)
//       ) {
//         setShowFilterMenu(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClick);
//     return () => document.removeEventListener("mousedown", handleClick);
//   }, []);

//   return (
//     <div className="p-3 sm:p-5 lg:p-8 min-h-screen bg-gray-50">

//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
//         <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
//           Student Grievance
//         </h1>

//         {!showForm && (
//           <button
//             onClick={() => setShowForm(true)}
//             className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
//           >
//             + Add Grievance
//           </button>
//         )}
//       </div>

//       {/* FORM (FULLY RESPONSIVE) */}
//       {showForm && (
//         <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 max-w-4xl mx-auto">
//           <h2 className="text-xl font-semibold mb-4 text-gray-700">
//             {editingGrievance ? "Edit Grievance" : "Submit Grievance"}
//           </h2>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             {/* GRID */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

//               {/* Name */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Student Name *
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.studentName}
//                   onChange={(e) =>
//                     setFormData({ ...formData, studentName: e.target.value })
//                   }
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter name"
//                 />
//               </div>

//               {/* Email */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Student Email *
//                 </label>
//                 <input
//                   type="email"
//                   value={formData.studentEmail}
//                   onChange={(e) =>
//                     setFormData({ ...formData, studentEmail: e.target.value })
//                   }
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter email"
//                 />
//               </div>

//               {/* Complaint */}
//               <div className="sm:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Complaint *
//                 </label>
//                 <textarea
//                   value={formData.complaint}
//                   onChange={(e) =>
//                     setFormData({ ...formData, complaint: e.target.value })
//                   }
//                   rows="4"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
//                   placeholder="Describe your complaint..."
//                 />
//               </div>
//             </div>

//             {/* BUTTONS */}
//             <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
//               <button
//                 type="button"
//                 onClick={() => {
//                   setShowForm(false);
//                   setEditingGrievance(null);
//                   setFormData({
//                     studentName: "",
//                     studentEmail: "",
//                     title: "",
//                     complaint: "",
//                   });
//                 }}
//                 className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//               >
//                 {editingGrievance ? "Update" : "Submit"}
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* TABLE SECTION */}
//       {!showForm && (
//         <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mt-4">
//           {/* FILTER AREA */}
//           <div className="relative mb-4 flex justify-between items-center">
//             <div className="relative">
//               <button
//                 ref={filterButtonRef}
//                 onClick={() => setShowFilterMenu(!showFilterMenu)}
//                 className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
//               >
//                 🔍 Filter ▼
//               </button>

//               {showFilterMenu && (
//                 <div
//                   ref={filterMenuRef}
//                   className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50"
//                 >
//                   {/* Status */}
//                   <h3 className="font-semibold text-gray-800 mb-2">
//                     Filter by Status
//                   </h3>
//                   <div className="space-y-2">
//                     {["all", "submittedToAdmin", "approved", "rejected"].map(
//                       (s) => (
//                         <label key={s} className="flex items-center gap-2">
//                           <input
//                             type="radio"
//                             name="status"
//                             checked={filterStatus === s}
//                             value={s}
//                             onChange={(e) =>
//                               setFilterStatus(e.target.value)
//                             }
//                           />
//                           <span className="capitalize">
//                             {s === "all"
//                               ? "All"
//                               : s.replace(/([A-Z])/g, " $1")}
//                           </span>
//                         </label>
//                       )
//                     )}
//                   </div>

//                   {/* Search */}
//                   <h3 className="font-semibold text-gray-800 mt-4 mb-2">
//                     Search
//                   </h3>
//                   <input
//                     type="text"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                     placeholder="Search grievances..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                   />

//                   {/* Buttons */}
//                   <div className="flex justify-between mt-4 border-t pt-3">
//                     <button
//                       onClick={() => {
//                         setFilterStatus("all");
//                         setSearchTerm("");
//                       }}
//                       className="text-gray-500 text-sm"
//                     >
//                       Reset
//                     </button>
//                     <button
//                       onClick={() => setShowFilterMenu(false)}
//                       className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm"
//                     >
//                       Apply
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* RESPONSIVE TABLE */}
//           <div className="overflow-x-auto border border-gray-100 rounded-lg">
//             <table className="min-w-[700px] w-full text-sm">
//               <thead className="bg-gray-50">
//                 <tr>
//                   {["Student", "Complaint", "Status", "Date", "Actions"].map(
//                     (h) => (
//                       <th
//                         key={h}
//                         className="px-4 py-3 text-left text-gray-600 font-medium text-xs uppercase tracking-wide"
//                       >
//                         {h}
//                       </th>
//                     )
//                   )}
//                 </tr>
//               </thead>

//               <tbody className="divide-y">
//                 {filteredGrievances.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan="5"
//                       className="text-center py-6 text-gray-500"
//                     >
//                       No grievances found.
//                     </td>
//                   </tr>
//                 ) : (
//                   [...filteredGrievances].reverse().map((g) => (
//                     <tr key={g._id} className="hover:bg-gray-50">
//                       <td className="px-4 py-3">
//                         <div className="font-semibold">{g.studentName}</div>
//                         <div className="text-gray-500 text-xs sm:text-sm">
//                           {g.studentEmail}
//                         </div>
//                       </td>

//                       <td className="px-4 py-3 max-w-[280px] break-words">
//                         {g.complaint}
//                         {g.adminResponse && (
//                           <p className="mt-1 text-blue-700 text-xs sm:text-sm">
//                             <strong>Admin:</strong> {g.adminResponse}
//                           </p>
//                         )}
//                       </td>

//                       <td className="px-4 py-3">
//                         <span
//                           className={`px-2 py-1 text-xs rounded-full font-semibold ${getStatusColor(
//                             g.status
//                           )}`}
//                         >
//                           {g.status}
//                         </span>
//                       </td>

//                       <td className="px-4 py-3 text-gray-500 text-xs sm:text-sm">
//                         {new Date(g.createdAt).toLocaleDateString()}
//                       </td>

//                       <td className="px-4 py-3">
//                         {g.status === "submittedToAdmin" ? (
//                           <div className="flex flex-wrap gap-2">
//                             <button
//                               onClick={() => handleEdit(g)}
//                               className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
//                             >
//                               Edit
//                             </button>

//                             <button
//                               onClick={() => handleDelete(g)}
//                               className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded"
//                             >
//                               Delete
//                             </button>
//                           </div>
//                         ) : (
//                           <span className="text-gray-500 text-xs">
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

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
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteGrievance(g._id));
      }
    });
  };

  // Filter grievances
  const filteredGrievances = grievances.filter((g) => {
    const matchSearch =
      g.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.complaint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = filterStatus === "all" || g.status === filterStatus;

    return matchSearch && matchStatus;
  });

  // Pagination calculations
  const totalItems = filteredGrievances.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGrievances = [...filteredGrievances].reverse().slice(startIndex, endIndex);

  const getStatusColor = (status) => {
    switch (status) {
      case "submittedToAdmin":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatStatusText = (status) => {
    // Handle different status formats properly
    const statusMap = {
      "submittedToAdmin": "Submitted to Admin",
      "approved": "Approved",
      "rejected": "Rejected",
      "all": "All Status"
    };
    
    return statusMap[status] || status.replace(/([A-Z])/g, " $1").trim();
  };

  // Pagination controls
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;

    const buttons = [];
    const maxVisiblePages = window.innerWidth < 640 ? 3 : 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    buttons.push(
      <button
        key="prev"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200 min-w-[40px]"
        aria-label="Previous page"
      >
        <span className="sr-only">Previous</span>
        <span aria-hidden="true">←</span>
      </button>
    );

    // First page
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => goToPage(1)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 min-w-[40px] hidden xs:block"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="px-2 py-2 text-gray-500 hidden sm:block">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-2 text-sm border rounded-lg transition-all duration-200 min-w-[40px] ${
            currentPage === i
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis2" className="px-2 py-2 text-gray-500 hidden sm:block">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => goToPage(totalPages)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 min-w-[40px] hidden xs:block"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    buttons.push(
      <button
        key="next"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200 min-w-[40px]"
        aria-label="Next page"
      >
        <span className="sr-only">Next</span>
        <span aria-hidden="true">→</span>
      </button>
    );

    return buttons;
  };

  // Close menu if clicked outside
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

  // Close filter menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="p-3 sm:p-4 lg:p-6 min-h-screen bg-gray-50">
      {/* Header - Updated with smaller right-aligned button */}
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center mb-6 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Student Grievance
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage and track student complaints
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all duration-200 font-medium flex items-center justify-center gap-2 text-sm ml-auto"
          >
            <span className="text-base">+</span>
            <span>Add Grievance</span>
          </button>
        )}
      </div>

      {/* FORM SECTION */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 max-w-4xl mx-auto mb-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                {editingGrievance ? "Edit Grievance" : "Submit New Grievance"}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {editingGrievance ? "Update the grievance details" : "Fill in the student complaint details"}
              </p>
            </div>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingGrievance(null);
                setFormData({
                  studentName: "",
                  studentEmail: "",
                  complaint: "",
                });
              }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Close form"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Name */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Name *
                </label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) =>
                    setFormData({ ...formData, studentName: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter student name"
                />
              </div>

              {/* Email */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Email *
                </label>
                <input
                  type="email"
                  value={formData.studentEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, studentEmail: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter student email"
                />
              </div>

              {/* Complaint */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complaint Details *
                </label>
                <textarea
                  value={formData.complaint}
                  onChange={(e) =>
                    setFormData({ ...formData, complaint: e.target.value })
                  }
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-vertical"
                  placeholder="Describe the complaint in detail..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Please provide clear and detailed information about the grievance
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingGrievance(null);
                  setFormData({
                    studentName: "",
                    studentEmail: "",
                    complaint: "",
                  });
                }}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : editingGrievance ? (
                  "Update Grievance"
                ) : (
                  "Submit Grievance"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MAIN CONTENT SECTION */}
      {!showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
          {/* CONTROLS BAR */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            {/* Left Controls - Filter and Search */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Filter Button */}
              <div className="relative">
                <button
                  ref={filterButtonRef}
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium min-w-[120px]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                  </svg>
                  <span>Filter</span>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${showFilterMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Filter Dropdown */}
                {showFilterMenu && (
                  <div
                    ref={filterMenuRef}
                    className="absolute left-0 right-0 sm:right-auto sm:w-96 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 z-50"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-800 text-lg">Filters</h3>
                      <button
                        onClick={() => setShowFilterMenu(false)}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Status Filter */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-700 mb-3">Status</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {["all", "submittedToAdmin", "approved", "rejected"].map(
                          (s) => (
                            <label key={s} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                              <input
                                type="radio"
                                name="status"
                                checked={filterStatus === s}
                                value={s}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span className="capitalize text-sm font-medium">
                                {formatStatusText(s)}
                              </span>
                            </label>
                          )
                        )}
                      </div>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-700 mb-3">Search</h4>
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="Search by name, email, or complaint..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setFilterStatus("all");
                          setSearchTerm("");
                        }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors duration-200"
                      >
                        Reset All
                      </button>
                      <button
                        onClick={() => setShowFilterMenu(false)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors duration-200"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Active Filters Display */}
              <div className="flex items-center gap-2 flex-wrap">
                {filterStatus !== "all" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    Status: {formatStatusText(filterStatus)}
                    <button
                      onClick={() => setFilterStatus("all")}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Search: "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm("")}
                      className="hover:text-green-900"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>

            {/* Right Controls - Items Per Page */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 font-medium whitespace-nowrap">
                  Show:
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          </div>

          {/* STATS SUMMARY */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-800">{totalItems}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-800">
                {filteredGrievances.filter(g => g.status === 'submittedToAdmin').length}
              </div>
              <div className="text-sm text-yellow-700">Pending</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-800">
                {filteredGrievances.filter(g => g.status === 'approved').length}
              </div>
              <div className="text-sm text-green-700">Approved</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <div className="text-2xl font-bold text-red-800">
                {filteredGrievances.filter(g => g.status === 'rejected').length}
              </div>
              <div className="text-sm text-red-700">Rejected</div>
            </div>
          </div>

          {/* MOBILE CARD VIEW - Enhanced */}
          <div className="block lg:hidden space-y-3">
            {currentGrievances.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium text-gray-600 mb-2">No grievances found</p>
                <p className="text-sm text-gray-500 mb-4">Try adjusting your filters or search terms</p>
                <button
                  onClick={() => {
                    setFilterStatus("all");
                    setSearchTerm("");
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors duration-200"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              currentGrievances.map((g) => (
                <div key={g._id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-base truncate">{g.studentName}</h3>
                      <p className="text-gray-500 text-sm truncate">{g.studentEmail}</p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-semibold border ${getStatusColor(g.status)} whitespace-nowrap ml-2`}
                    >
                      {formatStatusText(g.status)}
                    </span>
                  </div>

                  {/* Complaint */}
                  <div className="mb-4">
                    <p className="text-gray-700 text-sm line-clamp-3 leading-relaxed">{g.complaint}</p>
                    {g.adminResponse && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-blue-800 text-xs font-medium mb-1">Admin Response:</p>
                        <p className="text-blue-700 text-sm leading-relaxed">{g.adminResponse}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="text-gray-500 text-xs">
                      {new Date(g.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    {g.status === "submittedToAdmin" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(g)}
                          className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(g)}
                          className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs font-medium">Processed</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DESKTOP TABLE VIEW - Enhanced */}
          <div className="hidden lg:block overflow-x-auto border border-gray-200 rounded-2xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Student", "Complaint", "Status", "Date", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-left text-gray-600 font-semibold text-xs uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {currentGrievances.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-12 text-gray-500"
                    >
                      <div className="flex flex-col items-center">
                        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-600 mb-2">No grievances found</p>
                        <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
                        <button
                          onClick={() => {
                            setFilterStatus("all");
                            setSearchTerm("");
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors duration-200"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentGrievances.map((g) => (
                    <tr key={g._id} className="hover:bg-gray-50 transition-colors duration-150 group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">{g.studentName}</div>
                        <div className="text-gray-500 text-xs mt-1">
                          {g.studentEmail}
                        </div>
                      </td>

                      <td className="px-6 py-4 max-w-md">
                        <p className="text-gray-700 break-words leading-relaxed">
                          {g.complaint}
                        </p>
                        {g.adminResponse && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                            <p className="text-blue-800 text-xs font-medium mb-1">Admin Response:</p>
                            <p className="text-blue-700 text-sm leading-relaxed">{g.adminResponse}</p>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-2 text-xs rounded-full font-semibold border ${getStatusColor(
                            g.status
                          )}`}
                        >
                          {formatStatusText(g.status)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {new Date(g.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>

                      <td className="px-6 py-4">
                        {g.status === "submittedToAdmin" ? (
                          <div className="flex gap-2 transition-opacity duration-200">
                            <button
                              onClick={() => handleEdit(g)}
                              className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(g)}
                              className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs font-medium">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION - Enhanced */}
          {totalItems > 0 && (
            <div className="flex flex-col xs:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-200">
              {/* Items info */}
              <div className="text-sm text-gray-600 font-medium">
                Showing <span className="text-gray-800">{startIndex + 1}-{Math.min(endIndex, totalItems)}</span> of{" "}
                <span className="text-gray-800">{totalItems}</span> entries
              </div>

              {/* Pagination buttons */}
              <div className="flex flex-wrap justify-center gap-2">
                {renderPaginationButtons()}
              </div>

              {/* Page info */}
              <div className="text-sm text-gray-600 font-medium hidden xs:block">
                Page <span className="text-gray-800">{currentPage}</span> of{" "}
                <span className="text-gray-800">{totalPages}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentGrievance;