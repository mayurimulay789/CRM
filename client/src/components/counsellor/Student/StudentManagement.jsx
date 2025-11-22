// import React, { useState, useEffect, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { 
//   fetchStudents, 
//   createStudent, 
//   updateStudent, 
//   deleteStudent, 
//   toggleStudentStatus,
//   clearError,
//   clearSuccess 
// } from '../../../store/slices/studentSlice';
// import StudentForm from './StudentForm';

// const StudentManagement = () => {
//   const dispatch = useDispatch();
//   const { students, loading, error, operationSuccess, currentStudent } = useSelector(state => state.students);
  
//   const [showForm, setShowForm] = useState(false);
//   const [editingStudent, setEditingStudent] = useState(null);
//   const [filterActive, setFilterActive] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showFilterMenu, setShowFilterMenu] = useState(false);
//   const [showColumnsMenu, setShowColumnsMenu] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [showImageModal, setShowImageModal] = useState(false);
//   const [selectedImage, setSelectedImage] = useState('');
//   const [imageTitle, setImageTitle] = useState('');

//   // Refs for dropdown menus
//   const filterMenuRef = useRef(null);
//   const columnsMenuRef = useRef(null);
//   const filterButtonRef = useRef(null);
//   const columnsButtonRef = useRef(null);

//   // Define all available columns
//   const allColumns = [
//     { key: 'studentId', label: 'Student ID', visible: true },
//     { key: 'name', label: 'Full Name', visible: true },
//     { key: 'email', label: 'Email', visible: true },
//     { key: 'phone', label: 'Phone', visible: true },
//     { key: 'alternateEmail', label: 'Alt Email', visible: false },
//     { key: 'alternatePhone', label: 'Alt Phone', visible: false },
//     { key: 'dateOfBirth', label: 'DOB', visible: false },
//     { key: 'gender', label: 'Gender', visible: true },
//     { key: 'age', label: 'Age', visible: true },
//     { key: 'address', label: 'Address', visible: false },
//     { key: 'city', label: 'City', visible: true },
//     { key: 'state', label: 'State', visible: false },
//     { key: 'idProofType', label: 'ID Type', visible: false },
//     { key: 'idProofNumber', label: 'ID Number', visible: false },
//     { key: 'studentPhoto', label: 'Photo', visible: false },
//     { key: 'studentSignature', label: 'Signature', visible: false },
//     { key: 'isActive', label: 'Status', visible: true },
//     { key: 'createdAt', label: 'Created', visible: false },
//     { key: 'updatedAt', label: 'Updated', visible: false },
//     { key: 'actions', label: 'Actions', visible: true }
//   ];

//   const [columns, setColumns] = useState(allColumns);

//   useEffect(() => {
//     dispatch(fetchStudents());
//   }, [dispatch]);

//   useEffect(() => {
//     if (operationSuccess) {
//       const timer = setTimeout(() => {
//         dispatch(clearSuccess());
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [operationSuccess, dispatch]);

//   useEffect(() => {
//     if (error) {
//       const timer = setTimeout(() => {
//         dispatch(clearError());
//       }, 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [error, dispatch]);

//   // Fixed click outside detection
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (showFilterMenu && 
//           filterMenuRef.current && 
//           !filterMenuRef.current.contains(event.target) &&
//           filterButtonRef.current &&
//           !filterButtonRef.current.contains(event.target)) {
//         setShowFilterMenu(false);
//       }

//       if (showColumnsMenu && 
//           columnsMenuRef.current && 
//           !columnsMenuRef.current.contains(event.target) &&
//           columnsButtonRef.current &&
//           !columnsButtonRef.current.contains(event.target)) {
//         setShowColumnsMenu(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [showFilterMenu, showColumnsMenu]);

//   const handleDelete = async (studentId) => {
//     if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
//       try {
//         await dispatch(deleteStudent(studentId)).unwrap();
//         dispatch(fetchStudents());
//       } catch (error) {
//         console.error('Delete failed:', error);
//       }
//     }
//   };

//   const handleToggleStatus = async (studentId) => {
//     try {
//       await dispatch(toggleStudentStatus(studentId)).unwrap();
//       dispatch(fetchStudents());
//     } catch (error) {
//       console.error('Status toggle failed:', error);
//     }
//   };

//   const handleEdit = (student) => {
//     setEditingStudent(student);
//     setShowForm(true);
//   };

//   const handleViewDetails = (student) => {
//     setSelectedStudent(student);
//     setShowDetailsModal(true);
//   };

//   const handleCloseForm = () => {
//     setShowForm(false);
//     setEditingStudent(null);
//     dispatch(fetchStudents());
//   };

//   const handleCloseDetails = () => {
//     setShowDetailsModal(false);
//     setSelectedStudent(null);
//   };

//   const handleImageClick = (imageUrl, title) => {
//     setSelectedImage(imageUrl);
//     setImageTitle(title);
//     setShowImageModal(true);
//   };

//   const handleCloseImageModal = () => {
//     setShowImageModal(false);
//     setSelectedImage('');
//     setImageTitle('');
//   };

//   const toggleColumnVisibility = (columnKey) => {
//     setColumns(prevColumns => 
//       prevColumns.map(col => 
//         col.key === columnKey ? { ...col, visible: !col.visible } : col
//       )
//     );
//   };

//   const selectAllColumns = () => {
//     setColumns(prevColumns => 
//       prevColumns.map(col => ({ ...col, visible: true }))
//     );
//   };

//   const deselectAllColumns = () => {
//     setColumns(prevColumns => 
//       prevColumns.map(col => ({ ...col, visible: false }))
//     );
//   };

//   const filteredStudents = students.filter(student => {
//     const matchesActive = filterActive === 'all' || 
//       (filterActive === 'active' && student.isActive) || 
//       (filterActive === 'inactive' && !student.isActive);
    
//     const matchesSearch = 
//       student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       student.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       student.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       student.idProof?.number?.toLowerCase().includes(searchTerm.toLowerCase());

//     return matchesActive && matchesSearch;
//   });

//   const getStatusBadge = (isActive) => {
//     return isActive ? (
//       <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
//         Active
//       </span>
//     ) : (
//       <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
//         Inactive
//       </span>
//     );
//   };

//   const getGenderBadge = (gender) => {
//     const genderConfig = {
//       male: { color: 'bg-blue-100 text-blue-800', label: 'Male' },
//       female: { color: 'bg-pink-100 text-pink-800', label: 'Female' },
//       other: { color: 'bg-purple-100 text-purple-800', label: 'Other' }
//     };
    
//     const config = genderConfig[gender] || genderConfig.other;
//     return (
//       <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
//         {config.label}
//       </span>
//     );
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return '-';
//     return new Date(dateString).toLocaleDateString('en-IN');
//   };

//   const calculateAge = (dateOfBirth) => {
//     if (!dateOfBirth) return '-';
//     const today = new Date();
//     const birthDate = new Date(dateOfBirth);
//     let age = today.getFullYear() - birthDate.getFullYear();
//     const monthDiff = today.getMonth() - birthDate.getMonth();
//     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
//       age--;
//     }
//     return age;
//   };

//   const truncateText = (text, maxLength = 25) => {
//     if (!text) return '-';
//     if (text.length <= maxLength) return text;
//     return `${text.substring(0, maxLength)}...`;
//   };

//   const getFilePreview = (url, title = 'Image') => {
//     if (!url) return null;
    
//     if (url.toLowerCase().endsWith('.pdf')) {
//       return (
//         <div className="flex items-center space-x-2 text-blue-600">
//           <span>📄</span>
//           <span className="text-sm">PDF Document</span>
//         </div>
//       );
//     } else {
//       return (
//         <div className="flex justify-center">
//           <img 
//             src={url} 
//             alt={title}
//             className="w-12 h-12 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity duration-200"
//             onClick={() => handleImageClick(url, title)}
//             onError={(e) => {
//               e.target.style.display = 'none';
//               e.target.nextSibling.style.display = 'flex';
//             }}
//           />
//         </div>
//       );
//     }
//   };

//   if (loading && students.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-full flex flex-col">
//       {/* Header Section */}
//       <div className="flex-shrink-0 bg-white p-6 border-b border-gray-200">
//         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
//           <div className="flex justify-between items-center w-full lg:w-auto space-x-4">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-800">Student Management</h1>
//               <p className="text-gray-600">Manage students and their information</p>
//             </div>
            
//             {/* Add New Student Button */}
//             <button
//               onClick={() => setShowForm(true)}
//               className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
//             >
//               <span>+</span>
//               <span>New Student</span>
//             </button>
//           </div>
          
//           <div className="flex items-center space-x-3 p-3 rounded-lg">
//             {/* Filter Button */}
//             <div className="relative">
//               <button
//                 ref={filterButtonRef}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setShowFilterMenu(!showFilterMenu);
//                   setShowColumnsMenu(false);
//                 }}
//                 className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
//               >
//                 <span>🔍</span>
//                 <span>Filter</span>
//                 <span>▼</span>
//               </button>

//               {/* Filter Dropdown Menu */}
//               {showFilterMenu && (
//                 <div 
//                   ref={filterMenuRef}
//                   className="absolute right-0 left-2 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
//                 >
//                   <div className="p-4">
//                     <h3 className="font-semibold text-gray-800 mb-3">Filter by Status</h3>
//                     <div className="space-y-2">
//                       {['all', 'active', 'inactive'].map(status => (
//                         <label key={status} className="flex items-center space-x-2 cursor-pointer">
//                           <input
//                             type="radio"
//                             name="status"
//                             value={status}
//                             checked={filterActive === status}
//                             onChange={(e) => setFilterActive(e.target.value)}
//                             className="text-blue-500 focus:ring-blue-500"
//                           />
//                           <span className="capitalize">
//                             {status === 'all' ? 'All Status' : status}
//                           </span>
//                         </label>
//                       ))}
//                     </div>
                    
//                     <div className="mt-4 pt-3 border-t border-gray-200">
//                       <h3 className="font-semibold text-gray-800 mb-3">Search</h3>
//                       <input
//                         type="text"
//                         placeholder="Search students..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       />
//                     </div>
                    
//                     <div className="mt-4 flex justify-between">
//                       <button
//                         onClick={() => {
//                           setFilterActive('all');
//                           setSearchTerm('');
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

//             {/* Columns Button */}
//             <div className="relative">
//               <button
//                 ref={columnsButtonRef}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setShowColumnsMenu(!showColumnsMenu);
//                   setShowFilterMenu(false);
//                 }}
//                 className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
//               >
//                 <span>📊</span>
//                 <span>Columns</span>
//                 <span>▼</span>
//               </button>

//               {/* Columns Dropdown Menu */}
//               {showColumnsMenu && (
//                 <div 
//                   ref={columnsMenuRef}
//                   className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
//                 >
//                   <div className="p-4">
//                     <div className="flex justify-between items-center mb-3">
//                       <h3 className="font-semibold text-gray-800">Show/Hide Columns</h3>
//                       <div className="flex space-x-2">
//                         <button
//                           onClick={selectAllColumns}
//                           className="text-xs text-blue-500 hover:text-blue-700"
//                         >
//                           Select All
//                         </button>
//                         <button
//                           onClick={deselectAllColumns}
//                           className="text-xs text-gray-500 hover:text-gray-700"
//                         >
//                           Deselect All
//                         </button>
//                       </div>
//                     </div>
                    
//                     <div className="space-y-2 max-h-64 overflow-y-auto">
//                       {columns.map(column => (
//                         <label key={column.key} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
//                           <input
//                             type="checkbox"
//                             checked={column.visible}
//                             onChange={() => toggleColumnVisibility(column.key)}
//                             className="text-blue-500 focus:ring-blue-500 rounded"
//                           />
//                           <span className="text-sm text-gray-700">{column.label}</span>
//                         </label>
//                       ))}
//                     </div>
                    
//                     <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end">
//                       <button
//                         onClick={() => setShowColumnsMenu(false)}
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
//         </div>

//         {/* Success Message */}
//         {operationSuccess && (
//           <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mt-4 flex items-center justify-between">
//             <div className="flex items-center space-x-2">
//               <span>✅</span>
//               <span>{operationSuccess}</span>
//             </div>
//             <button onClick={() => dispatch(clearSuccess())} className="text-green-700 hover:text-green-900">
//               ×
//             </button>
//           </div>
//         )}

//         {/* Error Message */}
//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4 flex items-center justify-between">
//             <div className="flex items-center space-x-2">
//               <span>❌</span>
//               <span>{error}</span>
//             </div>
//             <button onClick={() => dispatch(clearError())} className="text-red-700 hover:text-red-900">
//               ×
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Table Container */}
//       <div className="flex-1 min-h-0 bg-gray-50 p-4">
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
//           {/* Table with horizontal scroll only */}
//           <div className="flex-1 min-h-0 overflow-auto">
//             <div className="overflow-x-auto h-full">
//               <table className="min-w-full divide-y divide-gray-200 border-collapse">
//                 <thead className="bg-gray-50 sticky top-0 z-10">
//                   <tr>
//                     {columns.map(column => 
//                       column.visible && (
//                         <th 
//                           key={column.key} 
//                           className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-gray-50"
//                         >
//                           {column.label}
//                         </th>
//                       )
//                     )}
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredStudents.length === 0 ? (
//                     <tr>
//                       <td 
//                         colSpan={columns.filter(col => col.visible).length} 
//                         className="px-6 py-12 text-center"
//                       >
//                         <div className="text-gray-500">
//                           <span className="text-4xl mb-2 block">👨‍🎓</span>
//                           <p className="text-lg font-medium">No students found</p>
//                           <p className="text-sm">Get started by creating your first student</p>
//                         </div>
//                       </td>
//                     </tr>
//                   ) : (
//                     filteredStudents.map((student, index) => (
//                       <tr 
//                         key={student._id} 
//                         className={`transition-colors duration-150 ${
//                           index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
//                         } hover:bg-blue-50`}
//                       >
//                         {columns.map(column => {
//                           if (!column.visible) return null;
                          
//                           // Common cell styling
//                           const baseCellClasses = "px-4 py-3 text-sm border-b border-gray-200";
                          
//                           switch (column.key) {
//                             case 'studentId':
//                               return (
//                                 <td key={column.key} className={`${baseCellClasses} font-mono font-semibold text-gray-900 whitespace-nowrap`}>
//                                   <button 
//                                     onClick={() => handleViewDetails(student)}
//                                     className="text-blue-600 hover:text-blue-800 hover:underline"
//                                   >
//                                     {student.studentId}
//                                   </button>
//                                 </td>
//                               );
//                             case 'name':
//                               return (
//                                 <td key={column.key} className={`${baseCellClasses} font-semibold text-gray-900 whitespace-nowrap`}>
//                                   {student.name}
//                                 </td>
//                               );
//                             case 'email':
//                               return (
//                                 <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
//                                   {truncateText(student.email, 25)}
//                                 </td>
//                               );
//                             case 'phone':
//                               return (
//                                 <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
//                                   {student.phone}
//                                 </td>
//                               );
//                             case 'alternateEmail':
//                               return (
//                                 <td key={column.key} className={`${baseCellClasses} text-gray-600 whitespace-nowrap`}>
//                                   {student.alternateEmail || '-'}
//                                 </td>
//                               );
//                             case 'alternatePhone':
//                               return (
//                                 <td key={column.key} className={`${baseCellClasses} text-gray-600 whitespace-nowrap`}>
//                                   {student.alternatePhone || '-'}
//                                 </td>
//                               );
//                             case 'dateOfBirth':
//                               return (
//                                 <td key={column.key} className={`${baseCellClasses} text-gray-600 whitespace-nowrap`}>
//                                   {formatDate(student.dateOfBirth)}
//                                 </td>
//                               );
//                             case 'gender':
//                               return (
//                                 <td key={column.key} className={`${baseCellClasses} text-center`}>
//                                   {getGenderBadge(student.gender)}
//                                 </td>
//                               );
//                             case 'age':
//                               return (
//                                 <td key={column.key} className={`${baseCellClasses} text-center text-gray-700 whitespace-nowrap`}>
//                                   {calculateAge(student.dateOfBirth)}
//                                 </td>
//                               );
//                             case 'address':
//                               return (
//                                 <td key={column.key} className={`${baseCellClasses} text-gray-600`}>
//                                   {student.address?.street ? truncateText(student.address.street, 20) : '-'}
//                                 </td>
//                               );
//                             case 'city':
//                               return (
//                                 <td key={column.key} className={`${baseCellClasses} text-gray-600 whitespace-nowrap`}>
//                                   {student.address?.city || '-'}
//                                 </td>
//                               );
//                             case 'state':
//                               return (
//                                 <td key={column.key} className={`${baseCellClasses} text-gray-600 whitespace-nowrap`}>
//                                   {student.address?.state || '-'}
//                                 </td>
//                               );
//                             case 'idProofType':
//                               return (
//                                 <td key={column.key} className={`${baseCellClasses} text-gray-600 whitespace-nowrap capitalize`}>
//                                   {student.idProof?.type ? student.idProof.type.replace('_', ' ') : '-'}
//                                 </td>
//                               );
//                             case 'idProofNumber':
//                               return (
//                                 <td key={column.key} className={`${baseCellClasses} text-gray-600 whitespace-nowrap`}>
//                                   {student.idProof?.number || '-'}
//                                 </td>
//                               );
//                             case 'studentPhoto':
//                               return (
//                                 <td key={column.key} className={`${baseCellClasses} text-center`}>
//                                   {student.studentPhoto ? (
//                                     getFilePreview(student.studentPhoto, `${student.name}'s Photo`)
//                                   ) : (
//                                     <span className="text-gray-400">-</span>
//                                   )}
//                                 </td>
//                               );
//                             case 'studentSignature':
//                               return (
//                                 <td key={column.key} className={`${baseCellClasses} text-center`}>
//                                   {student.studentSignature ? (
//                                     getFilePreview(student.studentSignature, `${student.name}'s Signature`)
//                                   ) : (
//                                     <span className="text-gray-400">-</span>
//                                   )}
//                                 </td>
//                               );
//                             case 'isActive':
//                               return (
//                                 <td key={column.key} className={`${baseCellClasses} text-center`}>
//                                   {getStatusBadge(student.isActive)}
//                                 </td>
//                               );
//                             case 'createdAt':
//                               return (
//                                 <td key={column.key} className={`${baseCellClasses} text-gray-500 whitespace-nowrap`}>
//                                   {formatDate(student.createdAt)}
//                                 </td>
//                               );
//                             case 'updatedAt':
//                               return (
//                                 <td key={column.key} className={`${baseCellClasses} text-gray-500 whitespace-nowrap`}>
//                                   {formatDate(student.updatedAt)}
//                                 </td>
//                               );
//                             case 'actions':
//                               return (
//                                 <td key={column.key} className={`${baseCellClasses} text-center whitespace-nowrap`}>
//                                   <div className="flex items-center justify-center space-x-2">
//                                     <button 
//                                       onClick={() => handleViewDetails(student)} 
//                                       className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50 transition-colors border border-green-200" 
//                                       title="View Details"
//                                     >
//                                       View
//                                     </button>
//                                     <button 
//                                       onClick={() => handleEdit(student)} 
//                                       className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50 transition-colors border border-blue-200" 
//                                       title="Edit Student"
//                                     >
//                                       Edit
//                                     </button>
//                                     <button 
//                                       onClick={() => handleToggleStatus(student._id)} 
//                                       className={`px-2 py-1 rounded transition-colors border ${
//                                         student.isActive 
//                                           ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-50 border-orange-200' 
//                                           : 'text-green-600 hover:text-green-900 hover:bg-green-50 border-green-200'
//                                       }`}
//                                       title={student.isActive ? 'Deactivate Student' : 'Activate Student'}
//                                     >
//                                       {student.isActive ? 'Deactivate' : 'Activate'}
//                                     </button>
//                                     <button 
//                                       onClick={() => handleDelete(student._id)} 
//                                       className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50 transition-colors border border-red-200" 
//                                       title="Delete Student"
//                                     >
//                                       Delete
//                                     </button>
//                                   </div>
//                                 </td>
//                               );
//                             default:
//                               return (
//                                 <td key={column.key} className={`${baseCellClasses} text-gray-700`}>
//                                   {student[column.key] || '-'}
//                                 </td>
//                               );
//                           }
//                         })}
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Table Footer */}
//           {filteredStudents.length > 0 && (
//             <div className="flex-shrink-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
//               <div className="flex justify-between items-center">
//                 <div className="text-sm text-gray-700">
//                   Showing <span className="font-semibold">{filteredStudents.length}</span> of{' '}
//                   <span className="font-semibold">{students.length}</span> students
//                 </div>
//                 <div className="text-sm text-gray-500">
//                   Total: {students.length} students
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Student Form Modal */}
//       {showForm && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6">
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-xl font-bold text-gray-800">
//                   {editingStudent ? 'Edit Student' : 'Create New Student'}
//                 </h2>
//                 <button onClick={handleCloseForm} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
//               </div>
//               <StudentForm student={editingStudent} onClose={handleCloseForm} />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Student Details Modal */}
//       {showDetailsModal && selectedStudent && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6">
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-xl font-bold text-gray-800">Student Details</h2>
//                 <button onClick={handleCloseDetails} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
//               </div>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Personal Information */}
//                 <div className="bg-blue-50 p-4 rounded-lg">
//                   <h3 className="text-lg font-semibold text-blue-800 mb-4">Personal Information</h3>
//                   <div className="space-y-3">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Student ID</label>
//                       <p className="mt-1 text-sm text-gray-900 font-mono">{selectedStudent.studentId}</p>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Full Name</label>
//                       <p className="mt-1 text-sm text-gray-900">{selectedStudent.name}</p>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Email</label>
//                       <p className="mt-1 text-sm text-gray-900">{selectedStudent.email}</p>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Phone</label>
//                       <p className="mt-1 text-sm text-gray-900">{selectedStudent.phone}</p>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
//                       <p className="mt-1 text-sm text-gray-900">
//                         {formatDate(selectedStudent.dateOfBirth)} (Age: {calculateAge(selectedStudent.dateOfBirth)})
//                       </p>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Gender</label>
//                       <p className="mt-1 text-sm text-gray-900 capitalize">{selectedStudent.gender || '-'}</p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Contact Information */}
//                 <div className="bg-green-50 p-4 rounded-lg">
//                   <h3 className="text-lg font-semibold text-green-800 mb-4">Contact Information</h3>
//                   <div className="space-y-3">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Alternate Email</label>
//                       <p className="mt-1 text-sm text-gray-900">{selectedStudent.alternateEmail || '-'}</p>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Alternate Phone</label>
//                       <p className="mt-1 text-sm text-gray-900">{selectedStudent.alternatePhone || '-'}</p>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Address</label>
//                       <p className="mt-1 text-sm text-gray-900">
//                         {selectedStudent.address?.street && <>{selectedStudent.address.street}<br/></>}
//                         {selectedStudent.address?.city && <>{selectedStudent.address.city}, </>}
//                         {selectedStudent.address?.state && <>{selectedStudent.address.state} </>}
//                         {selectedStudent.address?.zipCode && <>{selectedStudent.address.zipCode}<br/></>}
//                         {selectedStudent.address?.country || 'India'}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* ID Proof Information */}
//                 <div className="bg-purple-50 p-4 rounded-lg">
//                   <h3 className="text-lg font-semibold text-purple-800 mb-4">ID Proof Information</h3>
//                   <div className="space-y-3">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">ID Proof Type</label>
//                       <p className="mt-1 text-sm text-gray-900 capitalize">
//                         {selectedStudent.idProof?.type ? selectedStudent.idProof.type.replace('_', ' ') : '-'}
//                       </p>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">ID Proof Number</label>
//                       <p className="mt-1 text-sm text-gray-900">{selectedStudent.idProof?.number || '-'}</p>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">ID Proof Document</label>
//                       <div className="mt-1">
//                         {selectedStudent.idProof?.photo ? (
//                           <button
//                             onClick={() => handleImageClick(selectedStudent.idProof.photo, 'ID Proof Document')}
//                             className="text-blue-600 hover:text-blue-800 underline"
//                           >
//                             View Document
//                           </button>
//                         ) : (
//                           <span className="text-gray-400">-</span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Documents & Status */}
//                 <div className="bg-yellow-50 p-4 rounded-lg">
//                   <h3 className="text-lg font-semibold text-yellow-800 mb-4">Documents & Status</h3>
//                   <div className="space-y-3">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Student Photo</label>
//                       <div className="mt-1">
//                         {selectedStudent.studentPhoto ? (
//                           <img 
//                             src={selectedStudent.studentPhoto} 
//                             alt="Student Photo" 
//                             className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity duration-200"
//                             onClick={() => handleImageClick(selectedStudent.studentPhoto, `${selectedStudent.name}'s Photo`)}
//                           />
//                         ) : (
//                           <span className="text-gray-400">-</span>
//                         )}
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Student Signature</label>
//                       <div className="mt-1">
//                         {selectedStudent.studentSignature ? (
//                           <img 
//                             src={selectedStudent.studentSignature} 
//                             alt="Student Signature" 
//                             className="w-32 h-16 object-contain border cursor-pointer hover:opacity-80 transition-opacity duration-200"
//                             onClick={() => handleImageClick(selectedStudent.studentSignature, `${selectedStudent.name}'s Signature`)}
//                           />
//                         ) : (
//                           <span className="text-gray-400">-</span>
//                         )}
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Status</label>
//                       <div className="mt-1">
//                         {getStatusBadge(selectedStudent.isActive)}
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Created</label>
//                       <p className="mt-1 text-sm text-gray-900">{formatDate(selectedStudent.createdAt)}</p>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Last Updated</label>
//                       <p className="mt-1 text-sm text-gray-900">{formatDate(selectedStudent.updatedAt)}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-6 flex justify-end">
//                 <button
//                   onClick={handleCloseDetails}
//                   className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Image Preview Modal */}
//       {showImageModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-[60]">
//           <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
//             {/* Close Button - Top Right Corner */}
          
//             <button
//               onClick={handleCloseImageModal}
//               className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all duration-200 z-10 backdrop-blur-sm"
//               style={{ backdropFilter: 'blur(10px)' }}
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>

//             {/* Image Container */}
//             <div className="relative w-full h-full flex items-center justify-center">
//               {selectedImage.toLowerCase().endsWith('.pdf') ? (
//                 <div className="bg-white p-8 rounded-lg max-w-2xl w-full">
//                   <div className="text-center">
//                     <div className="text-6xl mb-4">📄</div>
//                     <h3 className="text-xl font-semibold text-gray-800 mb-2">PDF Document</h3>
//                     <p className="text-gray-600 mb-4">This is a PDF file that cannot be previewed in the image viewer.</p>
//                     <a
//                       href={selectedImage}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
//                     >
//                       <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                       </svg>
//                       Download PDF
//                     </a>
//                   </div>
//                 </div>
//               ) : (
//                 <img
//                   src={selectedImage}
//                   alt={imageTitle}
//                   className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
//                   onClick={handleCloseImageModal} // Close when clicking on image
//                 />
//               )}
//             </div>

//             {/* Download Button for Images */}
//             {!selectedImage.toLowerCase().endsWith('.pdf') && (
//               <a
//                 href={selectedImage}
//                 download
//                 className="absolute bottom-4 right-4  bg-gray-700 text-white rounded-lg px-4 py-2 transition-all duration-200 flex items-center space-x-2"
//                 style={{ backdropFilter: 'blur(10px)' }}
//                 onClick={(e) => e.stopPropagation()} // Prevent closing when clicking download
//               >
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//                 <span>Download</span>
//               </a>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default StudentManagement;


import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchStudents, 
  createStudent, 
  updateStudent, 
  deleteStudent, 
  toggleStudentStatus,
  clearError,
  clearSuccess 
} from '../../../store/slices/studentSlice';
import StudentForm from './StudentForm';

const StudentManagement = () => {
  const dispatch = useDispatch();
  const { students, loading, error, operationSuccess, currentStudent } = useSelector(state => state.students);
  
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [filterActive, setFilterActive] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [imageTitle, setImageTitle] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(7);

  // Refs for dropdown menus
  const filterMenuRef = useRef(null);
  const columnsMenuRef = useRef(null);
  const filterButtonRef = useRef(null);
  const columnsButtonRef = useRef(null);

  // Define all available columns
  const allColumns = [
    { key: 'studentId', label: 'Student ID', visible: true },
    { key: 'name', label: 'Full Name', visible: true },
    { key: 'email', label: 'Email', visible: true },
    { key: 'phone', label: 'Phone', visible: true },
    { key: 'alternateEmail', label: 'Alt Email', visible: false },
    { key: 'alternatePhone', label: 'Alt Phone', visible: false },
    { key: 'dateOfBirth', label: 'DOB', visible: false },
    { key: 'gender', label: 'Gender', visible: true },
    { key: 'age', label: 'Age', visible: true },
    { key: 'address', label: 'Address', visible: false },
    { key: 'city', label: 'City', visible: true },
    { key: 'state', label: 'State', visible: false },
    { key: 'idProofType', label: 'ID Type', visible: false },
    { key: 'idProofNumber', label: 'ID Number', visible: false },
    { key: 'studentPhoto', label: 'Photo', visible: false },
    { key: 'studentSignature', label: 'Signature', visible: false },
    { key: 'isActive', label: 'Status', visible: true },
    { key: 'createdAt', label: 'Created', visible: false },
    { key: 'updatedAt', label: 'Updated', visible: false },
    { key: 'actions', label: 'Actions', visible: true }
  ];

  const [columns, setColumns] = useState(allColumns);

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  useEffect(() => {
    if (operationSuccess) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [operationSuccess, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterActive, searchTerm]);

  // Fixed click outside detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterMenu && 
          filterMenuRef.current && 
          !filterMenuRef.current.contains(event.target) &&
          filterButtonRef.current &&
          !filterButtonRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }

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

  const handleDelete = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      try {
        await dispatch(deleteStudent(studentId)).unwrap();
        dispatch(fetchStudents());
        // Reset to first page if current page becomes empty
        if (filteredStudents.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleToggleStatus = async (studentId) => {
    try {
      await dispatch(toggleStudentStatus(studentId)).unwrap();
      dispatch(fetchStudents());
    } catch (error) {
      console.error('Status toggle failed:', error);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingStudent(null);
    dispatch(fetchStudents());
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedStudent(null);
  };

  const handleImageClick = (imageUrl, title) => {
    setSelectedImage(imageUrl);
    setImageTitle(title);
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage('');
    setImageTitle('');
  };

  const toggleColumnVisibility = (columnKey) => {
    setColumns(prevColumns => 
      prevColumns.map(col => 
        col.key === columnKey ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const selectAllColumns = () => {
    setColumns(prevColumns => 
      prevColumns.map(col => ({ ...col, visible: true }))
    );
  };

  const deselectAllColumns = () => {
    setColumns(prevColumns => 
      prevColumns.map(col => ({ ...col, visible: false }))
    );
  };

  // Filter students based on active filters and search
  const filteredStudents = students.filter(student => {
    const matchesActive = filterActive === 'all' || 
      (filterActive === 'active' && student.isActive) || 
      (filterActive === 'inactive' && !student.isActive);
    
    const matchesSearch = 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.idProof?.number?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesActive && matchesSearch;
  });

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredStudents.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredStudents.length / recordsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

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

  const getGenderBadge = (gender) => {
    const genderConfig = {
      male: { color: 'bg-blue-100 text-blue-800', label: 'Male' },
      female: { color: 'bg-pink-100 text-pink-800', label: 'Female' },
      other: { color: 'bg-purple-100 text-purple-800', label: 'Other' }
    };
    
    const config = genderConfig[gender] || genderConfig.other;
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '-';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const truncateText = (text, maxLength = 25) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  const getFilePreview = (url, title = 'Image') => {
    if (!url) return null;
    
    if (url.toLowerCase().endsWith('.pdf')) {
      return (
        <div className="flex items-center space-x-2 text-blue-600">
          <span>📄</span>
          <span className="text-sm">PDF Document</span>
        </div>
      );
    } else {
      return (
        <div className="flex justify-center">
          <img 
            src={url} 
            alt={title}
            className="w-12 h-12 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity duration-200"
            onClick={() => handleImageClick(url, title)}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        </div>
      );
    }
  };

  if (loading && students.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header Section */}
      <div className="flex-shrink-0 bg-white p-4 lg:p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full lg:w-auto space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Student Management</h1>
              <p className="text-gray-600 text-sm lg:text-base">Manage students and their information</p>
            </div>
            
            {/* Add New Student Button */}
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 w-full sm:w-auto justify-center"
            >
              <span>+</span>
              <span>New Student</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2 lg:space-x-3 w-full lg:w-auto justify-between lg:justify-end">
            {/* Search Input - Mobile Only */}
            <div className="lg:hidden flex-1">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button
                ref={filterButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFilterMenu(!showFilterMenu);
                  setShowColumnsMenu(false);
                }}
                className="flex items-center space-x-1 lg:space-x-2 bg-white border border-gray-300 text-gray-700 px-3 lg:px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
              >
                <span>🔍</span>
                <span className="hidden sm:inline">Filter</span>
                <span>▼</span>
              </button>

              {/* Filter Dropdown Menu */}
              {showFilterMenu && (
                <div 
                  ref={filterMenuRef}
                  className="absolute right-0 mt-2 w-64 lg:w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
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
                          <span className="capitalize text-sm">
                            {status === 'all' ? 'All Status' : status}
                          </span>
                        </label>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-800 mb-3">Search</h3>
                      <input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                className="flex items-center space-x-1 lg:space-x-2 bg-white border border-gray-300 text-gray-700 px-3 lg:px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
              >
                <span>📊</span>
                <span className="hidden sm:inline">Columns</span>
                <span>▼</span>
              </button>

              {/* Columns Dropdown Menu */}
              {showColumnsMenu && (
                <div 
                  ref={columnsMenuRef}
                  className="absolute right-0 mt-2 w-72 lg:w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-800 text-sm lg:text-base">Show/Hide Columns</h3>
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
              <span className="text-sm">{operationSuccess}</span>
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
              <span className="text-sm">{error}</span>
            </div>
            <button onClick={() => dispatch(clearError())} className="text-red-700 hover:text-red-900">
              ×
            </button>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="flex-1 min-h-0 bg-gray-50 p-2 lg:p-4">
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
                          className="px-2 lg:px-4 py-5 lg:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-gray-50"
                        >
                          {column.label}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentRecords.length === 0 ? (
                    <tr>
                      <td 
                        colSpan={columns.filter(col => col.visible).length} 
                        className="px-4 lg:px-6 py-8 lg:py-12 text-center"
                      >
                        <div className="text-gray-500">
                          <span className="text-3xl lg:text-4xl mb-2 block">👨‍🎓</span>
                          <p className="text-base lg:text-lg font-medium">No students found</p>
                          <p className="text-xs lg:text-sm">Get started by creating your first student</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentRecords.map((student, index) => (
                      <tr 
                        key={student._id} 
                        className={`transition-colors duration-150 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        } hover:bg-blue-50`}
                      >
                        {columns.map(column => {
                          if (!column.visible) return null;
                          
                          // Common cell styling
                          const baseCellClasses = "px-2 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm border-b border-gray-200";
                          
                          switch (column.key) {
                            case 'studentId':
                              return (
                                <td key={column.key} className={`${baseCellClasses} font-mono font-semibold text-gray-900 whitespace-nowrap`}>
                                  <button 
                                    onClick={() => handleViewDetails(student)}
                                    className="text-blue-600 hover:text-blue-800 hover:underline text-xs lg:text-sm"
                                  >
                                    {student.studentId}
                                  </button>
                                </td>
                              );
                            case 'name':
                              return (
                                <td key={column.key} className={`${baseCellClasses} font-semibold text-gray-900 whitespace-nowrap`}>
                                  {student.name}
                                </td>
                              );
                            case 'email':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                                  {truncateText(student.email, 20)}
                                </td>
                              );
                            case 'phone':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                                  {student.phone}
                                </td>
                              );
                            case 'alternateEmail':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-600 whitespace-nowrap`}>
                                  {student.alternateEmail || '-'}
                                </td>
                              );
                            case 'alternatePhone':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-600 whitespace-nowrap`}>
                                  {student.alternatePhone || '-'}
                                </td>
                              );
                            case 'dateOfBirth':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-600 whitespace-nowrap`}>
                                  {formatDate(student.dateOfBirth)}
                                </td>
                              );
                            case 'gender':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-center`}>
                                  {getGenderBadge(student.gender)}
                                </td>
                              );
                            case 'age':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-center text-gray-700 whitespace-nowrap`}>
                                  {calculateAge(student.dateOfBirth)}
                                </td>
                              );
                            case 'address':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-600`}>
                                  {student.address?.street ? truncateText(student.address.street, 15) : '-'}
                                </td>
                              );
                            case 'city':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-600 whitespace-nowrap`}>
                                  {student.address?.city || '-'}
                                </td>
                              );
                            case 'state':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-600 whitespace-nowrap`}>
                                  {student.address?.state || '-'}
                                </td>
                              );
                            case 'idProofType':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-600 whitespace-nowrap capitalize`}>
                                  {student.idProof?.type ? student.idProof.type.replace('_', ' ') : '-'}
                                </td>
                              );
                            case 'idProofNumber':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-600 whitespace-nowrap`}>
                                  {student.idProof?.number || '-'}
                                </td>
                              );
                            case 'studentPhoto':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-center`}>
                                  {student.studentPhoto ? (
                                    getFilePreview(student.studentPhoto, `${student.name}'s Photo`)
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              );
                            case 'studentSignature':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-center`}>
                                  {student.studentSignature ? (
                                    getFilePreview(student.studentSignature, `${student.name}'s Signature`)
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              );
                            case 'isActive':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-center`}>
                                  {getStatusBadge(student.isActive)}
                                </td>
                              );
                            case 'createdAt':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-500 whitespace-nowrap`}>
                                  {formatDate(student.createdAt)}
                                </td>
                              );
                            case 'updatedAt':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-500 whitespace-nowrap`}>
                                  {formatDate(student.updatedAt)}
                                </td>
                              );
                            case 'actions':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-center whitespace-nowrap`}>
                                  <div className="flex flex-row lg:flex-row items-center justify-center space-x-1 lg:space-y-0 lg:space-x-1">
                                    <button 
                                      onClick={() => handleViewDetails(student)} 
                                      className="text-green-600 hover:text-green-900 px-1 lg:px-2 py-1 rounded hover:bg-green-50 transition-colors border border-green-200 text-xs w-full lg:w-auto" 
                                      title="View Details"
                                    >
                                      View
                                    </button>
                                    <button 
                                      onClick={() => handleEdit(student)} 
                                      className="text-blue-600 hover:text-blue-900 px-1 lg:px-2 py-1 rounded hover:bg-blue-50 transition-colors border border-blue-200 text-xs w-full lg:w-auto" 
                                      title="Edit Student"
                                    >
                                      Edit
                                    </button>
                                    <button 
                                      onClick={() => handleToggleStatus(student._id)} 
                                      className={`px-1 lg:px-2 py-1 rounded transition-colors border text-xs w-full lg:w-auto ${
                                        student.isActive 
                                          ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-50 border-orange-200' 
                                          : 'text-green-600 hover:text-green-900 hover:bg-green-50 border-green-200'
                                      }`}
                                      title={student.isActive ? 'Deactivate Student' : 'Activate Student'}
                                    >
                                      {student.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button 
                                      onClick={() => handleDelete(student._id)} 
                                      className="text-red-600 hover:text-red-900 px-1 lg:px-2 py-1 rounded hover:bg-red-50 transition-colors border border-red-200 text-xs w-full lg:w-auto" 
                                      title="Delete Student"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              );
                            default:
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700`}>
                                  {student[column.key] || '-'}
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

          {/* Table Footer with Pagination */}
          {filteredStudents.length > 0 && (
            <div className="flex-shrink-0 bg-gray-50 px-4 lg:px-6 py-3 lg:py-4 border-t border-gray-200">
              <div className="flex flex-col lg:flex-row justify-between items-center space-y-3 lg:space-y-0">
                {/* Records Info */}
                <div className="text-xs lg:text-sm text-gray-700">
                  Showing <span className="font-semibold">{currentRecords.length}</span> of{' '}
                  <span className="font-semibold">{filteredStudents.length}</span> students 
                  (Page <span className="font-semibold">{currentPage}</span> of{' '}
                  <span className="font-semibold">{totalPages}</span>)
                </div>
                
                {/* Pagination Controls */}
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 lg:px-4 lg:py-2 rounded-lg border text-xs lg:text-sm font-medium transition-colors duration-200 ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {getPageNumbers().map(number => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-2 lg:px-3 py-1 lg:py-2 rounded-lg border text-xs lg:text-sm font-medium transition-colors duration-200 ${
                          currentPage === number
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 lg:px-4 lg:py-2 rounded-lg border text-xs lg:text-sm font-medium transition-colors duration-200 ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    Next
                  </button>
                </div>

                {/* Total Records */}
                <div className="text-xs lg:text-sm text-gray-500">
                  Total: {students.length} students
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 lg:p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 lg:p-6">
              <div className="flex justify-between items-center mb-4 lg:mb-6">
                <h2 className="text-lg lg:text-xl font-bold text-gray-800">
                  {editingStudent ? 'Edit Student' : 'Create New Student'}
                </h2>
                <button onClick={handleCloseForm} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>
              <StudentForm student={editingStudent} onClose={handleCloseForm} />
            </div>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {showDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 lg:p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 lg:p-6">
              <div className="flex justify-between items-center mb-4 lg:mb-6">
                <h2 className="text-lg lg:text-xl font-bold text-gray-800">Student Details</h2>
                <button onClick={handleCloseDetails} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                {/* Personal Information */}
                <div className="bg-blue-50 p-3 lg:p-4 rounded-lg">
                  <h3 className="text-base lg:text-lg font-semibold text-blue-800 mb-3 lg:mb-4">Personal Information</h3>
                  <div className="space-y-2 lg:space-y-3">
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700">Student ID</label>
                      <p className="mt-1 text-xs lg:text-sm text-gray-900 font-mono">{selectedStudent.studentId}</p>
                    </div>
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700">Full Name</label>
                      <p className="mt-1 text-xs lg:text-sm text-gray-900">{selectedStudent.name}</p>
                    </div>
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-xs lg:text-sm text-gray-900">{selectedStudent.email}</p>
                    </div>
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-xs lg:text-sm text-gray-900">{selectedStudent.phone}</p>
                    </div>
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700">Date of Birth</label>
                      <p className="mt-1 text-xs lg:text-sm text-gray-900">
                        {formatDate(selectedStudent.dateOfBirth)} (Age: {calculateAge(selectedStudent.dateOfBirth)})
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700">Gender</label>
                      <p className="mt-1 text-xs lg:text-sm text-gray-900 capitalize">{selectedStudent.gender || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-green-50 p-3 lg:p-4 rounded-lg">
                  <h3 className="text-base lg:text-lg font-semibold text-green-800 mb-3 lg:mb-4">Contact Information</h3>
                  <div className="space-y-2 lg:space-y-3">
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700">Alternate Email</label>
                      <p className="mt-1 text-xs lg:text-sm text-gray-900">{selectedStudent.alternateEmail || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700">Alternate Phone</label>
                      <p className="mt-1 text-xs lg:text-sm text-gray-900">{selectedStudent.alternatePhone || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700">Address</label>
                      <p className="mt-1 text-xs lg:text-sm text-gray-900">
                        {selectedStudent.address?.street && <>{selectedStudent.address.street}<br/></>}
                        {selectedStudent.address?.city && <>{selectedStudent.address.city}, </>}
                        {selectedStudent.address?.state && <>{selectedStudent.address.state} </>}
                        {selectedStudent.address?.zipCode && <>{selectedStudent.address.zipCode}<br/></>}
                        {selectedStudent.address?.country || 'India'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ID Proof Information */}
                <div className="bg-purple-50 p-3 lg:p-4 rounded-lg">
                  <h3 className="text-base lg:text-lg font-semibold text-purple-800 mb-3 lg:mb-4">ID Proof Information</h3>
                  <div className="space-y-2 lg:space-y-3">
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700">ID Proof Type</label>
                      <p className="mt-1 text-xs lg:text-sm text-gray-900 capitalize">
                        {selectedStudent.idProof?.type ? selectedStudent.idProof.type.replace('_', ' ') : '-'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700">ID Proof Number</label>
                      <p className="mt-1 text-xs lg:text-sm text-gray-900">{selectedStudent.idProof?.number || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700">ID Proof Document</label>
                      <div className="mt-1">
                        {selectedStudent.idProof?.photo ? (
                          <button
                            onClick={() => handleImageClick(selectedStudent.idProof.photo, 'ID Proof Document')}
                            className="text-blue-600 hover:text-blue-800 underline text-xs lg:text-sm"
                          >
                            View Document
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs lg:text-sm">-</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents & Status */}
                <div className="bg-yellow-50 p-3 lg:p-4 rounded-lg">
                  <h3 className="text-base lg:text-lg font-semibold text-yellow-800 mb-3 lg:mb-4">Documents & Status</h3>
                  <div className="space-y-2 lg:space-y-3">
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700">Student Photo</label>
                      <div className="mt-1">
                        {selectedStudent.studentPhoto ? (
                          <img 
                            src={selectedStudent.studentPhoto} 
                            alt="Student Photo" 
                            className="w-16 h-16 lg:w-20 lg:h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity duration-200"
                            onClick={() => handleImageClick(selectedStudent.studentPhoto, `${selectedStudent.name}'s Photo`)}
                          />
                        ) : (
                          <span className="text-gray-400 text-xs lg:text-sm">-</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700">Student Signature</label>
                      <div className="mt-1">
                        {selectedStudent.studentSignature ? (
                          <img 
                            src={selectedStudent.studentSignature} 
                            alt="Student Signature" 
                            className="w-24 h-12 lg:w-32 lg:h-16 object-contain border cursor-pointer hover:opacity-80 transition-opacity duration-200"
                            onClick={() => handleImageClick(selectedStudent.studentSignature, `${selectedStudent.name}'s Signature`)}
                          />
                        ) : (
                          <span className="text-gray-400 text-xs lg:text-sm">-</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700">Status</label>
                      <div className="mt-1">
                        {getStatusBadge(selectedStudent.isActive)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700">Created</label>
                      <p className="mt-1 text-xs lg:text-sm text-gray-900">{formatDate(selectedStudent.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700">Last Updated</label>
                      <p className="mt-1 text-xs lg:text-sm text-gray-900">{formatDate(selectedStudent.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 lg:mt-6 flex justify-end">
                <button
                  onClick={handleCloseDetails}
                  className="px-3 lg:px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200 text-sm lg:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-2 lg:p-4 z-[60]">
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            {/* Close Button - Top Right Corner */}
            <button
              onClick={handleCloseImageModal}
              className="absolute top-2 lg:top-4 right-2 lg:right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-1 lg:p-2 transition-all duration-200 z-10 backdrop-blur-sm"
              style={{ backdropFilter: 'blur(10px)' }}
            >
              <svg className="w-4 h-4 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image Container */}
            <div className="relative w-full h-full flex items-center justify-center">
              {selectedImage.toLowerCase().endsWith('.pdf') ? (
                <div className="bg-white p-4 lg:p-8 rounded-lg max-w-2xl w-full">
                  <div className="text-center">
                    <div className="text-4xl lg:text-6xl mb-3 lg:mb-4">📄</div>
                    <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-2">PDF Document</h3>
                    <p className="text-gray-600 text-sm lg:text-base mb-3 lg:mb-4">This is a PDF file that cannot be previewed in the image viewer.</p>
                    <a
                      href={selectedImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 lg:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm lg:text-base"
                    >
                      <svg className="w-3 h-3 lg:w-4 lg:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF
                    </a>
                  </div>
                </div>
              ) : (
                <img
                  src={selectedImage}
                  alt={imageTitle}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  onClick={handleCloseImageModal} // Close when clicking on image
                />
              )}
            </div>

            {/* Download Button for Images */}
            {!selectedImage.toLowerCase().endsWith('.pdf') && (
              <a
                href={selectedImage}
                download
                className="absolute bottom-2 lg:bottom-4 right-2 lg:right-4 bg-gray-700 text-white rounded-lg px-3 lg:px-4 py-1 lg:py-2 transition-all duration-200 flex items-center space-x-1 lg:space-x-2 text-xs lg:text-sm"
                style={{ backdropFilter: 'blur(10px)' }}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking download
              >
                <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;