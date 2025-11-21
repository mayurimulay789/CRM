// import React, { useEffect, useState, useRef } from "react";
// import Swal from "sweetalert2";
// import {
//   getAllGrievances,
//   createGrievance,
//   updateGrievance,
//   deleteGrievance,
// } from "../../../store/api/campusAPI";

// const CampusGrievance = () => {
//   const [grievances, setGrievances] = useState([]);
//   const [formData, setFormData] = useState({
//     name: "",
//     subject: "",
//     complaint: "",
//   });
//   const [editingId, setEditingId] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterStatus, setFilterStatus] = useState("all");

//   // For dropdown filter like StudentManagement
//   const [showFilterMenu, setShowFilterMenu] = useState(false);
//   const filterButtonRef = useRef(null);
//   const filterMenuRef = useRef(null);

//   useEffect(() => {
//     fetchGrievances();
//   }, []);

//   const fetchGrievances = async () => {
//     const data = await getAllGrievances();
//     setGrievances(data);
//   };

//   const validateForm = () => {
//     if (!formData.name.trim()) {
//       Swal.fire("Warning", "Please enter your name.", "warning");
//       return false;
//     }
//     if (!formData.subject.trim()) {
//       Swal.fire("Warning", "Please enter the subject.", "warning");
//       return false;
//     }
//     if (!formData.complaint.trim()) {
//       Swal.fire("Warning", "Please enter your complaint.", "warning");
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;
//     try {
//       if (editingId) {
//         await updateGrievance(editingId, formData);
//         Swal.fire("Updated!", "Your grievance has been updated.", "success");
//       } else {
//         await createGrievance(formData);
//         Swal.fire("Submitted!", "Your grievance has been submitted.", "success");
//       }
//       setFormData({ name: "", subject: "", complaint: "" });
//       setEditingId(null);
//       setShowForm(false);
//       fetchGrievances();
//     } catch (error) {
//       Swal.fire("Error", "Failed to submit grievance.", "error");
//     }
//   };

//   const handleEdit = (grievance) => {
//     setFormData({
//       name: grievance.name,
//       subject: grievance.subject,
//       complaint: grievance.complaint,
//     });
//     setEditingId(grievance._id);
//     setShowForm(true);
//   };

//   const handleDelete = async (id) => {
//     const result = await Swal.fire({
//       title: "Are you sure?",
//       text: "You won't be able to recover this grievance!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//       confirmButtonText: "Yes, delete it!",
//     });

//     if (result.isConfirmed) {
//       await deleteGrievance(id);
//       fetchGrievances();
//       Swal.fire("Deleted!", "Your grievance has been deleted.", "success");
//     }
//   };

//   const filteredGrievances = grievances.filter((g) => {
//     const matchesSearch =
//       (g.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
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

//   // Close filter menu when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         filterMenuRef.current &&
//         !filterMenuRef.current.contains(event.target) &&
//         !filterButtonRef.current.contains(event.target)
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
//           Campus Grievance
//         </h1>
//         <button
//           onClick={() => setShowForm(true)}
//           className="w-full sm:w-auto px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
//         >
//           + Add Grievance
//         </button>
//       </div>

//       {/* Form Section */}
//       {showForm ? (
//         <div className="bg-white rounded-lg shadow-md p-5 sm:p-6">
//           <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700">
//             {editingId ? "Edit Campus Grievance" : "Submit Campus Grievance"}
//           </h2>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               {/* Name */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Name *
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Enter name"
//                   value={formData.name}
//                   onChange={(e) =>
//                     setFormData({ ...formData, name: e.target.value })
//                   }
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
//                   required
//                 />
//               </div>

//               {/* Subject */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Subject *
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Enter subject"
//                   value={formData.subject}
//                   onChange={(e) =>
//                     setFormData({ ...formData, subject: e.target.value })
//                   }
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
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
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
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
//                   setEditingId(null);
//                   setFormData({ name: "", subject: "", complaint: "" });
//                 }}
//                 className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto"
//               >
//                 {editingId ? "Save Changes" : "Submit"}
//               </button>
//             </div>
//           </form>
//         </div>
//       ) : (
//         /* Table Section */
//         <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
//           {/* Search & Filter Buttons (like StudentManagement) */}
//           <div className="flex items-center space-x-3 p-3 rounded-lg mb-4">
//             {/* Filter Button */}
//             <div className="absolute">
//               <button
//                 ref={filterButtonRef}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setShowFilterMenu(!showFilterMenu);
//                 }}
//                 className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
//               >
//                 <span>🔍</span>
//                 <span>Filter</span>
//                 <span>▼</span>
//               </button>

//               {/* Dropdown Filter */}
//               {showFilterMenu && (
//                 <div
//                   ref={filterMenuRef}
//                   className="absolute left-2 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
//                 >
//                   <div className="p-4">
//                     <h3 className="font-semibold text-gray-800 mb-3">
//                       Filter by Status
//                     </h3>
//                     <div className="space-y-2">
//                       {["all", "submittedToAdmin", "approved", "rejected"].map(
//                         (status) => (
//                           <label
//                             key={status}
//                             className="flex items-center space-x-2 cursor-pointer"
//                           >
//                             <input
//                               type="radio"
//                               name="status"
//                               value={status}
//                               checked={filterStatus === status}
//                               onChange={(e) =>
//                                 setFilterStatus(e.target.value)
//                               }
//                               className="text-blue-500 focus:ring-blue-500"
//                             />
//                             <span className="capitalize">
//                               {status === "all"
//                                 ? "All Status"
//                                 : status.replace(/([A-Z])/g, " $1")}
//                             </span>
//                           </label>
//                         )
//                       )}
//                     </div>

//                     <div className="mt-4 pt-3 border-t border-gray-200">
//                       <h3 className="font-semibold text-gray-800 mb-3">
//                         Search
//                       </h3>
//                       <input
//                         type="text"
//                         placeholder="Search grievances..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       />
//                     </div>

//                     <div className="mt-4 flex justify-between">
//                       <button
//                         onClick={() => {
//                           setFilterStatus("all");
//                           setSearchTerm("");
//                         }}
//                         className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
//                       >
//                         Reset
//                       </button>
//                       <button
//                         onClick={() => setShowFilterMenu(false)}
//                         className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
//                       >
//                         Apply
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Table */}
//           <div className="overflow-x-auto">
//             <table className="min-w-full table-auto text-sm sm:text-base">
//               <thead className="bg-gray-50">
//                 <tr>
//                   {[
//                     "Name",
//                     "Subject",
//                     "Complaint",
//                     "Status",
//                     "Submitted",
//                     "Actions",
//                   ].map((head) => (
//                     <th
//                       key={head}
//                       className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider"
//                     >
//                       {head}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredGrievances.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan="6"
//                       className="px-4 py-8 text-center text-gray-500"
//                     >
//                       No grievances found
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredGrievances.map((g) => (
//                     <tr key={g._id} className="hover:bg-gray-50">
//                       <td className="px-4 py-4">{g.name}</td>
//                       <td className="px-4 py-4 truncate max-w-[150px]">
//                         {g.subject}
//                       </td>
//                       <td className="px-4 py-4 truncate max-w-[200px]">
//                         {g.complaint}
//                         {g.adminResponse && (
//                           <div className="mt-1 text-sm text-blue-700">
//                             <strong>Admin Response:</strong> {g.adminResponse}
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
//                               onClick={() => handleDelete(g._id)}
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

// export default CampusGrievance;



import React, { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import {
  getAllGrievances,
  createGrievance,
  updateGrievance,
  deleteGrievance,
} from "../../../store/api/campusAPI";

const CampusGrievance = () => {
  const [grievances, setGrievances] = useState([]);
  const [formData, setFormData] = useState({ name: "", subject: "", complaint: "" });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterButtonRef = useRef(null);
  const filterMenuRef = useRef(null);

  useEffect(() => {
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    const data = await getAllGrievances();
    setGrievances(data);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return Swal.fire("Warning", "Please enter your name.", "warning"), false;
    if (!formData.subject.trim()) return Swal.fire("Warning", "Please enter the subject.", "warning"), false;
    if (!formData.complaint.trim()) return Swal.fire("Warning", "Please enter your complaint.", "warning"), false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingId) {
        await updateGrievance(editingId, formData);
        Swal.fire("Updated!", "Your grievance has been updated.", "success");
      } else {
        await createGrievance(formData);
        Swal.fire("Submitted!", "Your grievance has been submitted.", "success");
      }
      setFormData({ name: "", subject: "", complaint: "" });
      setEditingId(null);
      setShowForm(false);
      fetchGrievances();
    } catch {
      Swal.fire("Error", "Failed to submit grievance.", "error");
    }
  };

  const handleEdit = (g) => {
    setFormData({ name: g.name, subject: g.subject, complaint: g.complaint });
    setEditingId(g._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to recover this grievance!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      await deleteGrievance(id);
      fetchGrievances();
      Swal.fire("Deleted!", "Your grievance has been deleted.", "success");
    }
  };

  const filteredGrievances = grievances.filter((g) => {
    const matchesSearch =
      (g.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
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

  // Close filter dropdown if clicked outside
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="p-3 sm:p-5 lg:p-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Campus Grievance
        </h1>

        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all"
        >
          + Add Grievance
        </button>
      </div>

      {/* ---------- FORM ---------- */}
      {showForm ? (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center sm:text-left">
            {editingId ? "Edit Campus Grievance" : "Submit Campus Grievance"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  placeholder="Enter subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Complaint *</label>
                <textarea
                  placeholder="Describe your complaint"
                  value={formData.complaint}
                  onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
                  rows="4"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ name: "", subject: "", complaint: "" });
                }}
                className="px-4 py-2 border text-gray-600 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingId ? "Save Changes" : "Submit"}
              </button>
            </div>

          </form>
        </div>
      ) : (

        /* ---------- TABLE SECTION ---------- */
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mt-6">

          {/* Filter + Search */}
          <div className="relative mb-4 flex flex-wrap justify-between items-center gap-3">

            <div className="relative">
              <button
                ref={filterButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFilterMenu(!showFilterMenu);
                }}
                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 shadow-sm"
              >
                🔍 Filter ▼
              </button>

              {showFilterMenu && (
                <div
                  ref={filterMenuRef}
                  className="absolute left-0 mt-2 w-64 bg-white border rounded-lg shadow-xl z-50"
                >
                  <div className="p-4 space-y-4">
                    {/* Status Filter */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Filter by Status</h3>
                      <div className="space-y-2">
                        {["all", "submittedToAdmin", "approved", "rejected"].map((status) => (
                          <label key={status} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="status"
                              value={status}
                              checked={filterStatus === status}
                              onChange={(e) => setFilterStatus(e.target.value)}
                            />
                            <span className="capitalize">
                              {status === "all" ? "All Status" : status.replace(/([A-Z])/g, " $1")}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Search */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Search</h3>
                      <input
                        type="text"
                        placeholder="Search grievances..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-between pt-2 border-t">
                      <button
                        onClick={() => {
                          setFilterStatus("all");
                          setSearchTerm("");
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Reset
                      </button>

                      <button
                        onClick={() => setShowFilterMenu(false)}
                        className="text-sm px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Apply
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ---------- TABLE ---------- */}
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="min-w-full table-auto text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Name", "Subject", "Complaint", "Status", "Submitted", "Actions"].map(
                    (head) => (
                      <th
                        key={head}
                        className="px-4 py-3 text-left font-medium text-gray-600 uppercase text-xs sm:text-sm"
                      >
                        {head}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredGrievances.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                      No grievances found
                    </td>
                  </tr>
                ) : (
                  filteredGrievances.map((g) => (
                    <tr key={g._id} className="hover:bg-gray-50">

                      <td className="px-4 py-3">{g.name}</td>

                      <td className="px-4 py-3 truncate max-w-[150px]">{g.subject}</td>

                      <td className="px-4 py-3 truncate max-w-[250px]">
                        {g.complaint}
                        {g.adminResponse && (
                          <div className="mt-1 text-xs text-blue-700">
                            <strong>Admin Response:</strong> {g.adminResponse}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
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
                              className="text-blue-600 bg-blue-100 px-2 py-1 rounded text-xs hover:bg-blue-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(g._id)}
                              className="text-red-600 bg-red-100 px-2 py-1 rounded text-xs hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">Processed</span>
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

export default CampusGrievance;
