import React, { useEffect, useState, useRef } from "react";
import {
  fetchOnlineDemos,
  addOnlineDemo,
  updateOnlineDemo,
  deleteOnlineDemo,
  setSearchQuery,
} from "../../../store/slices/onlineDemoSlice";
import { getTrainers } from "../../../store/slices/trainerSlice";
import { fetchCourses } from "../../../store/slices/courseSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  FiSearch,
  FiRefreshCw,
  FiDownload,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiArrowLeft,
  FiX,
  FiFilter,
  FiColumns,
  FiEye,
  FiMenu,
} from "react-icons/fi";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { useNavigate } from "react-router-dom";

const OnlineDemo = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { rows, searchQuery } = useSelector((state) => state.onlineDemo);
  const { user } = useSelector((state) => state.auth);
  const { trainers } = useSelector((state) => state.trainer);
  const { courses } = useSelector((state) => state.courses);

  // Role checks
  const isAdmin = user?.role === 'Admin';
  const isCounsellor = user?.role === 'Counsellor';

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    course: "",
    date: "",
    time: "",
    mode: "",
    medium: "",
    trainer: "",
  });

  const [errors, setErrors] = useState({});
  const [filterErrors, setFilterErrors] = useState({});

  const [filterData, setFilterData] = useState({
    branch: "",
    trainer: "",
    mode: "",
    dateFrom: "",
    dateTo: "",
  });

  // Month names for formatting
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Time slots for dropdown selection
  const timeSlots = [
    "10:00 AM - 12:00 PM",
    "12:00 PM - 2:00 PM",
    "3:00 PM - 5:00 PM",
    "5:00 PM - 7:00 PM"
  ];

  const defaultColumns = ["Course", "Date", "Timing", "Mode", "Medium", "Trainer"];
  const [visibleColumns, setVisibleColumns] = useState(defaultColumns);
  const [columnSearch, setColumnSearch] = useState("");

  useEffect(() => {
    dispatch(fetchOnlineDemos());
    dispatch(getTrainers());
    dispatch(fetchCourses());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsColumnsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get unique values for dropdowns
  const uniqueBranches = [...new Set(rows.map(r => r.branch).filter(Boolean))];
  const uniqueTrainers = [...new Set(rows.map(r => r.trainer).filter(Boolean))];
  const uniqueModes = [...new Set(rows.map(r => r.mode).filter(Boolean))];

  // Filter active trainers for dropdown
  const activeTrainers = trainers.filter(trainer => trainer.status === 'Active');
  
  // Filter active courses for dropdown
  const activeCourses = courses.filter(course => course.isActive);

  // Format date to dd MMM yyyy (e.g., "9 Oct 2025")
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const day = date.getDate();
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      
      return `${day} ${month} ${year}`;
    } catch (error) {
      return dateString;
    }
  };

  const filteredRows = rows.filter((r) => {
    const matchesSearch =
      r.course?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.trainer?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBranch = !filterData.branch || r.branch === filterData.branch;
    const matchesTrainer = !filterData.trainer || r.trainer === filterData.trainer;
    const matchesMode = !filterData.mode || r.mode === filterData.mode;
    const matchesDateFrom = !filterData.dateFrom || new Date(r.date) >= new Date(filterData.dateFrom);
    const matchesDateTo = !filterData.dateTo || new Date(r.date) <= new Date(filterData.dateTo);

    return matchesSearch && matchesBranch && matchesTrainer && matchesMode && matchesDateFrom && matchesDateTo;
  });

  // Enhanced validation rules
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.course.trim()) {
      newErrors.course = "Course name is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    } else {
      try {
        const selectedDate = new Date(formData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (isNaN(selectedDate.getTime())) {
          newErrors.date = "Invalid date format";
        } else if (selectedDate < today) {
          newErrors.date = "Date cannot be in the past";
        }
      } catch (error) {
        newErrors.date = "Invalid date format";
      }
    }

    if (!formData.time) {
      newErrors.time = "Timing is required";
    }

    if (!formData.mode) {
      newErrors.mode = "Please select mode";
    }

    if (!formData.medium.trim()) {
      newErrors.medium = "Medium is required";
    } else if (formData.medium.trim().length < 2) {
      newErrors.medium = "Medium must be at least 2 characters";
    }

    if (!formData.trainer.trim()) {
      newErrors.trainer = "Please select a trainer";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (!validateForm()) {
      return;
    }

    try {
      // Convert date to proper format before sending to backend
      const submissionData = {
        ...formData,
        date: formData.date ? new Date(formData.date).toISOString() : ""
      };

      if (editingRow) {
        await dispatch(updateOnlineDemo({ id: editingRow._id, data: submissionData }));
      } else {
        await dispatch(addOnlineDemo(submissionData));
      }

      setIsFormOpen(false);
      setEditingRow(null);
      setFormSubmitted(false);
      setFormData({
        course: "",
        date: "",
        time: "",
        mode: "",
        medium: "",
        trainer: "",
      });
      setErrors({});
      dispatch(fetchOnlineDemos());
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this demo?")) {
      await dispatch(deleteOnlineDemo(id));
      dispatch(fetchOnlineDemos());
    }
  };

  // PDF Export with formatted dates
  const handleExport = () => {
    const doc = new jsPDF();
    doc.text("Online Demo Data", 14, 12);
    const tableData = filteredRows.map((r, i) => [
      i + 1,
      r.course,
      r.date ? formatDisplayDate(r.date) : "",
      r.time,
      r.mode,
      r.medium,
      r.trainer,
    ]);
    autoTable(doc, {
      head: [["S.No", ...defaultColumns]],
      body: tableData,
      startY: 20,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
    });
    doc.save("OnlineDemoData.pdf");
  };

  const toggleColumn = (column) => {
    setVisibleColumns((prev) =>
      prev.includes(column)
        ? prev.filter((c) => c !== column)
        : [...prev, column]
    );
  };

  const filteredColumns = defaultColumns.filter((col) =>
    col.toLowerCase().includes(columnSearch.toLowerCase())
  );

  // Handle input change with validation
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (formSubmitted && errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  // Handle date input change
  const handleDateChange = (value) => {
    setFormData(prev => ({
      ...prev,
      date: value
    }));

    if (formSubmitted && errors.date) {
      setErrors(prev => ({
        ...prev,
        date: ""
      }));
    }
  };

  // Filter functions
  const handleFilterApply = () => {
    if (filterData.dateFrom && filterData.dateTo && new Date(filterData.dateFrom) > new Date(filterData.dateTo)) {
      setFilterErrors({ dateRange: "From date cannot be after To date" });
      return;
    }
    setFilterErrors({});
    setIsFilterOpen(false);
  };

  const handleFilterReset = () => {
    setFilterData({
      branch: "",
      trainer: "",
      mode: "",
      dateFrom: "",
      dateTo: "",
    });
    setFilterErrors({});
    setIsFilterOpen(false);
  };

  // Check if field should show error
  const shouldShowError = (fieldName) => {
    return formSubmitted && errors[fieldName];
  };

  // Open create form
  const openCreateForm = () => {
    setEditingRow(null);
    setFormSubmitted(false);
    setFormData({
      course: "",
      date: "",
      time: "",
      mode: "",
      medium: "",
      trainer: "",
    });
    setErrors({});
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* ✅ Mobile Header */}
      <div className="lg:hidden bg-gray-100 px-4 py-3 flex justify-between items-center shadow-sm border-b">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition text-sm"
        >
          <FiArrowLeft className="text-sm" />
        </button>
        
        <h1 className="text-lg font-semibold text-gray-800 truncate mx-2">
          Online Demo
        </h1>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
        >
          <FiMenu />
        </button>
      </div>

      {/* ✅ Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b shadow-lg z-40">
          <div className="px-4 py-3 space-y-3">
            {/* Role Badge */}
            <div className="flex justify-center">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isAdmin
                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                  : 'bg-green-100 text-green-800 border border-green-300'
              }`}>
                {isAdmin ? '👨‍💻 Admin' : '💼 Counsellor'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 transition text-sm"
                title="Filter"
              >
                <FiFilter className="text-sm" />
                <span>Filter</span>
              </button>

              <button
                onClick={handleExport}
                className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 transition text-sm"
                title="Export PDF"
              >
                <FiDownload className="text-sm" />
                <span>Export</span>
              </button>

              {isCounsellor && (
                <button
                  onClick={openCreateForm}
                  className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition text-sm"
                >
                  <FiPlus className="text-sm" />
                  <span>Add</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ Desktop Top Section */}
      <div className="hidden lg:flex bg-gray-100 px-6 py-3 justify-between items-center shadow-sm border-b">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <FiArrowLeft /> Go Back
        </button>
        
        <div className="flex items-center gap-4">
          {/* Role Badge */}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isAdmin
              ? 'bg-purple-100 text-purple-800 border border-purple-300'
              : 'bg-gray-100 text-green-800 border border-gray-100'
          }`}>
            {isAdmin ? '' : ''}
          </span>

          {/* Filter Button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 transition"
            title="Filter"
          >
            <FiFilter />
          </button>

          {/* Export PDF Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 transition"
            title="Export PDF"
          >
            <FiDownload />
          </button>
        </div>
      </div>

      {/* ✅ Title and Actions Section */}
      <div className="bg-gray-100 mt-4 mx-4 lg:mx-6 p-4 rounded-lg shadow-sm">
        <div className="flex flex-wrap justify-between items-center mb-3">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-800">
            Online Demo {isAdmin && <span className="text-xs lg:text-sm text-gray-600 ml-2">(View Only)</span>}
          </h2>
          
          {/* Add Button - Only for Counsellors - Hidden on mobile, shown in mobile menu */}
          {isCounsellor && (
            <button
              onClick={openCreateForm}
              className="hidden lg:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition shadow"
            >
              <FiPlus /> Add Online Demo
            </button>
          )}
        </div>

        {/* Columns + Search/Reload/Export */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setIsColumnsOpen(!isColumnsOpen)}
              className="flex items-center gap-2 border border-blue-500 text-blue-600 px-3 py-2 rounded-md hover:bg-blue-50 transition text-sm w-full lg:w-auto justify-center"
            >
              <FiColumns /> Columns{" "}
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                {visibleColumns.length}/{defaultColumns.length}
              </span>
            </button>

            {isColumnsOpen && (
              <div 
                ref={dropdownRef}
                className="absolute top-11 left-0 right-0 lg:left-auto lg:right-auto bg-white border shadow-lg rounded-md w-full lg:w-72 p-3 z-50"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    Manage Columns
                  </h3>
                  <button
                    onClick={() => setIsColumnsOpen(false)}
                    className="text-gray-500 hover:text-gray-700 transition"
                  >
                    <FiX />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Search columns"
                  value={columnSearch}
                  onChange={(e) => setColumnSearch(e.target.value)}
                  className="w-full border rounded px-2 py-1 mb-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {filteredColumns.map((col) => (
                    <label
                      key={col}
                      className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(col)}
                        onChange={() => toggleColumn(col)}
                      />
                      {col}
                    </label>
                  ))}
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <button
                    onClick={() => setVisibleColumns(defaultColumns)}
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition flex-1 lg:flex-none"
                  >
                    Show All
                  </button>
                  <button
                    onClick={() => setVisibleColumns([])}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition flex-1 lg:flex-none"
                  >
                    Hide All
                  </button>
                  <button
                    onClick={() => setVisibleColumns(defaultColumns)}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition flex-1 lg:flex-none"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Search and Reload - Only for Counsellors */}
            {isCounsellor && (
              <>
                <div className="relative w-full sm:w-64">
                  <FiSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search courses or trainers..."
                    value={searchQuery}
                    onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                    className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-500 transition text-sm"
                  />
                </div>
                <button
                  onClick={() => {
                    dispatch(fetchOnlineDemos());
                    dispatch(getTrainers());
                    dispatch(fetchCourses());
                  }}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-200 text-gray-700 transition w-full sm:w-auto flex items-center justify-center gap-2"
                  title="Reload"
                >
                  <FiRefreshCw />
                  <span className="sm:hidden">Reload</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Responsive Table Container */}
      <div className="px-4 lg:px-6 py-4 lg:py-6">
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 text-gray-700 border-b">
                <tr>
                  <th className="px-4 py-3 border-r font-medium whitespace-nowrap">S.No</th>
                  {defaultColumns.map(
                    (col) =>
                      visibleColumns.includes(col) && (
                        <th
                          key={col}
                          className="px-4 py-3 border-r font-medium whitespace-nowrap"
                        >
                          {col}
                        </th>
                      )
                  )}
                  {isCounsellor && (
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Actions</th>
                  )}
                  {isAdmin && (
                    <th className="px-4 py-3 font-medium whitespace-nowrap">View</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredRows.length > 0 ? (
                  filteredRows.map((row, index) => (
                    <tr key={row._id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-4 py-3 border-r font-medium">{index + 1}</td>
                      {visibleColumns.includes("Course") && (
                        <td className="px-4 py-3 border-r">{row.course}</td>
                      )}
                      {visibleColumns.includes("Date") && (
                        <td className="px-4 py-3 border-r whitespace-nowrap">
                          {formatDisplayDate(row.date)}
                        </td>
                      )}
                      {visibleColumns.includes("Timing") && (
                        <td className="px-4 py-3 border-r whitespace-nowrap">{row.time}</td>
                      )}
                      {visibleColumns.includes("Mode") && (
                        <td className="px-4 py-3 border-r">{row.mode}</td>
                      )}
                      {visibleColumns.includes("Medium") && (
                        <td className="px-4 py-3 border-r">{row.medium}</td>
                      )}
                      {visibleColumns.includes("Trainer") && (
                        <td className="px-4 py-3 border-r">{row.trainer}</td>
                      )}
                      
                      {isCounsellor && (
                        <td className="px-4 py-3">
                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                setEditingRow(row);
                                setFormData({ 
                                  ...row, 
                                  date: row.date ? new Date(row.date).toISOString().split('T')[0] : "",
                                  time: row.time || ""
                                });
                                setFormSubmitted(false);
                                setIsFormOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 p-2 rounded-lg transition hover:bg-blue-50"
                              title="Edit"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(row._id)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-lg transition hover:bg-red-50"
                              title="Delete"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                      
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <span className="text-gray-400 flex justify-center p-2 rounded-lg hover:bg-gray-100 transition" title="View Only">
                            <FiEye size={16} />
                          </span>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={visibleColumns.length + (isCounsellor ? 2 : isAdmin ? 2 : 1)}
                      className="text-center py-12 text-gray-500 text-sm"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-gray-400 mb-3">
                          <FiSearch size={32} />
                        </div>
                        <p className="text-lg font-medium text-gray-600 mb-2">No records found</p>
                        {searchQuery || filterData.branch || filterData.trainer || filterData.mode || filterData.dateFrom || filterData.dateTo ? (
                          <p className="text-sm text-gray-400">
                            Try adjusting your search or filters
                          </p>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="lg:hidden">
            {filteredRows.length > 0 ? (
              filteredRows.map((row, index) => (
                <div key={row._id} className="border-b p-4 hover:bg-gray-50 transition">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium text-gray-500">S.No:</div>
                    <div>{index + 1}</div>

                    {visibleColumns.includes("Course") && (
                      <>
                        <div className="font-medium text-gray-500">Course:</div>
                        <div className="truncate">{row.course}</div>
                      </>
                    )}

                    {visibleColumns.includes("Date") && (
                      <>
                        <div className="font-medium text-gray-500">Date:</div>
                        <div>{formatDisplayDate(row.date)}</div>
                      </>
                    )}

                    {visibleColumns.includes("Timing") && (
                      <>
                        <div className="font-medium text-gray-500">Timing:</div>
                        <div>{row.time}</div>
                      </>
                    )}

                    {visibleColumns.includes("Mode") && (
                      <>
                        <div className="font-medium text-gray-500">Mode:</div>
                        <div>{row.mode}</div>
                      </>
                    )}

                    {visibleColumns.includes("Medium") && (
                      <>
                        <div className="font-medium text-gray-500">Medium:</div>
                        <div>{row.medium}</div>
                      </>
                    )}

                    {visibleColumns.includes("Trainer") && (
                      <>
                        <div className="font-medium text-gray-500">Trainer:</div>
                        <div>{row.trainer}</div>
                      </>
                    )}

                    {/* Actions for Mobile */}
                    <div className="col-span-2 flex justify-end gap-4 pt-2 mt-2 border-t">
                      {isCounsellor && (
                        <>
                          <button
                            onClick={() => {
                              setEditingRow(row);
                              setFormData({ 
                                ...row, 
                                date: row.date ? new Date(row.date).toISOString().split('T')[0] : "",
                                time: row.time || ""
                              });
                              setFormSubmitted(false);
                              setIsFormOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 transition flex items-center gap-1 text-sm"
                          >
                            <FiEdit size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(row._id)}
                            className="text-red-500 hover:text-red-700 transition flex items-center gap-1 text-sm"
                          >
                            <FiTrash2 size={14} />
                            Delete
                          </button>
                        </>
                      )}
                      {isAdmin && (
                        <span className="text-gray-400 flex items-center gap-1 text-sm" title="View Only">
                          <FiEye size={14} />
                          View Only
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 text-sm px-4">
                <div className="flex flex-col items-center justify-center">
                  <div className="text-gray-400 mb-3">
                    <FiSearch size={32} />
                  </div>
                  <p className="text-lg font-medium text-gray-600 mb-2">No records found</p>
                  {searchQuery || filterData.branch || filterData.trainer || filterData.mode || filterData.dateFrom || filterData.dateTo ? (
                    <p className="text-sm text-gray-400">
                      Try adjusting your search or filters
                    </p>
                  ) : null}
                </div>
              </div>
            )}
          </div>
          
          {/* Table Footer with Row Count */}
          {filteredRows.length > 0 && (
            <div className="bg-gray-50 px-4 lg:px-6 py-3 border-t text-xs lg:text-sm text-gray-600 font-medium">
              Showing {filteredRows.length} of {rows.length} records
              {(searchQuery || filterData.branch || filterData.trainer || filterData.mode || filterData.dateFrom || filterData.dateTo) && 
                " (filtered)"}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Responsive Modal Form - ONLY FOR COUNSELLORS */}
      {isFormOpen && isCounsellor && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative border border-gray-200">
            <button
              onClick={() => {
                setIsFormOpen(false);
                setFormSubmitted(false);
                setErrors({});
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 z-10"
            >
              <FiX />
            </button>

            <div className="p-4 lg:p-6">
              <h3 className="text-lg font-semibold mb-3 text-center text-gray-800">
                {editingRow ? "Edit Online Demo" : "Add Online Demo"}
              </h3>

              {/* Date Preview Display */}
              {formData.date && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">
                    Selected Date: <span className="font-bold">{formatDisplayDate(formData.date)}</span>
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Course */}
                <div className="lg:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Course *</label>
                  <select
                    value={formData.course}
                    onChange={(e) => handleInputChange('course', e.target.value)}
                    className={`border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 text-sm ${
                      shouldShowError("course") ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Course</option>
                    {activeCourses.length > 0 ? (
                      activeCourses.map((course) => (
                        <option key={course._id} value={course.name}>
                          {course.name} {course.duration && `- ${course.duration}`}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No courses available</option>
                    )}
                  </select>
                  {shouldShowError("course") && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.course}
                    </p>
                  )}
                </div>

                {/* Date */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className={`border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 text-sm ${
                      shouldShowError("date") ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {shouldShowError("date") && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.date}
                    </p>
                  )}
                </div>

                {/* Time */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Timing *</label>
                  <select
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className={`border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 text-sm ${
                      shouldShowError("time") ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Time Slot</option>
                    {timeSlots.map((slot, index) => (
                      <option key={index} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  {shouldShowError("time") && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.time}
                    </p>
                  )}
                </div>

                {/* Medium */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Medium *</label>
                  <input
                    type="text"
                    value={formData.medium}
                    onChange={(e) => handleInputChange('medium', e.target.value)}
                    placeholder="e.g., Zoom, Google Meet"
                    className={`border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 text-sm ${
                      shouldShowError("medium") ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {shouldShowError("medium") && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.medium}
                    </p>
                  )}
                </div>

                {/* Trainer */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Trainer *</label>
                  <select
                    value={formData.trainer}
                    onChange={(e) => handleInputChange('trainer', e.target.value)}
                    className={`border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 text-sm ${
                      shouldShowError("trainer") ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Trainer</option>
                    {activeTrainers.length > 0 ? (
                      activeTrainers.map((trainer) => (
                        <option key={trainer._id} value={trainer.name}>
                          {trainer.name} {trainer.specialization && `- ${trainer.specialization}`}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No trainers available</option>
                    )}
                  </select>
                  {shouldShowError("trainer") && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.trainer}
                    </p>
                  )}
                </div>

                {/* Mode */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Mode *</label>
                  <select
                    value={formData.mode}
                    onChange={(e) => handleInputChange('mode', e.target.value)}
                    className={`border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 text-sm ${
                      shouldShowError("mode") ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Mode</option>
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                  </select>
                  {shouldShowError("mode") && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.mode}
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="lg:col-span-2 flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setFormSubmitted(false);
                      setErrors({});
                    }}
                    className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100 text-sm transition-colors flex-1 lg:flex-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm transition-colors flex-1 lg:flex-none"
                  > 
                    {editingRow ? "Update" : "Create Online Demo"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Responsive Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative border border-gray-200">
            <button
              onClick={() => setIsFilterOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <FiX />
            </button>

            <div className="p-4 lg:p-6">
              <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
                Filter Online Demos
              </h3>

              <div className="space-y-4">
                {/* Branch */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Branch</label>
                  <select
                    value={filterData.branch}
                    onChange={(e) => setFilterData({ ...filterData, branch: e.target.value })}
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">All Branches</option>
                    {uniqueBranches.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Trainer */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Trainer</label>
                  <select
                    value={filterData.trainer}
                    onChange={(e) => setFilterData({ ...filterData, trainer: e.target.value })}
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">All Trainers</option>
                    {uniqueTrainers.map((trainer) => (
                      <option key={trainer} value={trainer}>
                        {trainer}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mode */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Mode</label>
                  <select
                    value={filterData.mode}
                    onChange={(e) => setFilterData({ ...filterData, mode: e.target.value })}
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">All Modes</option>
                    {uniqueModes.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date From */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Date From</label>
                  <input
                    type="date"
                    value={filterData.dateFrom}
                    onChange={(e) => setFilterData({ ...filterData, dateFrom: e.target.value })}
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  {filterErrors.dateFrom && <p className="text-red-500 text-xs mt-1">{filterErrors.dateFrom}</p>}
                </div>

                {/* Date To */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Date To</label>
                  <input
                    type="date"
                    value={filterData.dateTo}
                    onChange={(e) => setFilterData({ ...filterData, dateTo: e.target.value })}
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  {filterErrors.dateTo && <p className="text-red-500 text-xs mt-1">{filterErrors.dateTo}</p>}
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={handleFilterReset}
                    className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100 text-sm flex-1 lg:flex-none"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleFilterApply}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex-1 lg:flex-none"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineDemo;