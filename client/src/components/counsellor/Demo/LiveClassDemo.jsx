import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLiveClasses,
  addLiveClass,
  updateLiveClass,
  deleteLiveClass,
  setSearchQuery,
} from "../../../features/liveClasses/liveClassesSlice";
import { getTrainers } from "../../../store/slices/trainerSlice";
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
  FiClock,
  FiChevronDown,
  FiMenu,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

const LiveClassDemo = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { rows, searchQuery } = useSelector((state) => state.liveClasses);
  const { user } = useSelector((state) => state.auth);
  const { trainers } = useSelector((state) => state.trainer);

  // Role checks
  const isAdmin = user?.role === 'Admin';
  const isCounsellor = user?.role === 'Counsellor';

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const dropdownRef = useRef(null);
  const timePickerRef = useRef(null);
  const formRef = useRef(null);

  const defaultColumns = [
    "Name",
    "Date",
    "Timing",
    "Email",
    "Mobile",
    "Trainer",
    "Counselor",
    "Counselor Remark",
    "Trainer Reply",
    "Add Remark",
    "Status",
    "Reason",
  ];

  const [visibleColumns, setVisibleColumns] = useState(defaultColumns);
  const [columnSearch, setColumnSearch] = useState("");
  const [filterData, setFilterData] = useState({
    status: "",
    trainer: "",
    dateFrom: "",
    dateTo: "",
  });
  const [filterErrors, setFilterErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    timing: "",
    email: "",
    mobile: "",
    trainer: "",
    counselor: "",
    counselorRemark: "",
    trainerReply: "",
    addRemark: "",
    status: "",
    reason: "",
  });

  const [errors, setErrors] = useState({});

  // Month names for formatting
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Time slots - only 10-12, 12-2, 3-5, and 5-7
  const timeSlots = [
    "10:00 AM - 12:00 PM",
    "12:00 PM - 2:00 PM", 
    "3:00 PM - 5:00 PM",
    "5:00 PM - 7:00 PM"
  ];

  useEffect(() => {
    dispatch(fetchLiveClasses());
    dispatch(getTrainers());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsColumnsOpen(false);
      }
      if (timePickerRef.current && !timePickerRef.current.contains(e.target)) {
        setIsTimePickerOpen(false);
      }
      if (formRef.current && !formRef.current.contains(e.target) && isFormOpen) {
        handleFormClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFormOpen]);

  // Get unique values for dropdowns
  const uniqueStatuses = [...new Set(rows.map(r => r.status).filter(Boolean))];
  const uniqueTrainers = [...new Set(rows.map(r => r.trainer).filter(Boolean))];

  // Filter active trainers for dropdown
  const activeTrainers = trainers.filter(trainer => trainer.status === 'Active');

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

  // Enhanced validation rules
  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case "name":
        if (!value.trim()) {
          newErrors.name = "Name is required";
        } else if (value.trim().length < 2) {
          newErrors.name = "Name must be at least 2 characters";
        } else if (value.trim().length > 50) {
          newErrors.name = "Name cannot exceed 50 characters";
        } else {
          delete newErrors.name;
        }
        break;

      case "date":
        if (!value) {
          newErrors.date = "Date is required";
        } else {
          try {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (isNaN(selectedDate.getTime())) {
              newErrors.date = "Invalid date format";
            } else if (selectedDate < today) {
              newErrors.date = "Date cannot be in the past";
            } else {
              delete newErrors.date;
            }
          } catch (error) {
            newErrors.date = "Invalid date format";
          }
        }
        break;

      case "timing":
        if (!value) {
          newErrors.timing = "Timing is required";
        } else {
          delete newErrors.timing;
        }
        break;

      case "trainer":
        if (!value) {
          newErrors.trainer = "Please select a trainer";
        } else {
          delete newErrors.trainer;
        }
        break;

      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Invalid email format";
        } else if (value && value.length > 100) {
          newErrors.email = "Email cannot exceed 100 characters";
        } else {
          delete newErrors.email;
        }
        break;

      case "mobile":
        if (value) {
          const cleanMobile = value.replace(/\s/g, '');
          if (!/^[0-9]{10}$/.test(cleanMobile)) {
            newErrors.mobile = "Mobile number must be 10 digits";
          } else if (value.length > 15) {
            newErrors.mobile = "Mobile number too long";
          } else {
            delete newErrors.mobile;
          }
        } else {
          delete newErrors.mobile;
        }
        break;

      case "counselor":
        if (value && value.length > 50) {
          newErrors.counselor = "Counselor name cannot exceed 50 characters";
        } else {
          delete newErrors.counselor;
        }
        break;

      case "counselorRemark":
        if (value && value.length > 200) {
          newErrors.counselorRemark = "Remark cannot exceed 200 characters";
        } else {
          delete newErrors.counselorRemark;
        }
        break;

      case "trainerReply":
        if (value && value.length > 200) {
          newErrors.trainerReply = "Trainer reply cannot exceed 200 characters";
        } else {
          delete newErrors.trainerReply;
        }
        break;

      case "addRemark":
        if (value && value.length > 200) {
          newErrors.addRemark = "Remark cannot exceed 200 characters";
        } else {
          delete newErrors.addRemark;
        }
        break;

      case "reason":
        if (value && value.length > 200) {
          newErrors.reason = "Reason cannot exceed 200 characters";
        } else {
          delete newErrors.reason;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.timing) {
      newErrors.timing = "Timing is required";
    }

    if (!formData.trainer) {
      newErrors.trainer = "Please select a trainer";
    }

    // Optional fields validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (formData.mobile && !/^[0-9]{10}$/.test(formData.mobile.replace(/\s/g, ''))) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }

    if (formData.counselorRemark && formData.counselorRemark.length > 200) {
      newErrors.counselorRemark = "Remark cannot exceed 200 characters";
    }

    if (formData.trainerReply && formData.trainerReply.length > 200) {
      newErrors.trainerReply = "Trainer reply cannot exceed 200 characters";
    }

    if (formData.addRemark && formData.addRemark.length > 200) {
      newErrors.addRemark = "Remark cannot exceed 200 characters";
    }

    if (formData.reason && formData.reason.length > 200) {
      newErrors.reason = "Reason cannot exceed 200 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      return;
    }

    try {
      // Convert date to proper format before sending to backend
      const submissionData = {
        ...formData,
        date: formData.date ? new Date(formData.date).toISOString() : ""
      };

      if (editingRow) {
        await dispatch(updateLiveClass({ id: editingRow._id, data: submissionData }));
      } else {
        await dispatch(addLiveClass(submissionData));
      }

      handleFormClose();
      dispatch(fetchLiveClasses());
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Handle form close
  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingRow(null);
    setFormSubmitted(false);
    setFormData({
      name: "",
      date: "",
      timing: "",
      email: "",
      mobile: "",
      trainer: "",
      counselor: "",
      counselorRemark: "",
      trainerReply: "",
      addRemark: "",
      status: "",
      reason: "",
    });
    setErrors({});
    setIsTimePickerOpen(false);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this live class?")) {
      await dispatch(deleteLiveClass(id));
      dispatch(fetchLiveClasses());
    }
  };

  // PDF Export
  const handlePDFExport = () => {
    const doc = new jsPDF();
    doc.text("Live Classes Report", 14, 15);
    const tableColumn = ["S.No", ...visibleColumns];
    const tableRows = filteredRows.map((r, i) => [
      i + 1,
      ...visibleColumns.map((col) => {
        const key = col
          .split(" ")
          .map((word, index) =>
            index === 0
              ? word.toLowerCase()
              : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join("");
        switch (col) {
          case "Date":
            return formatDisplayDate(r.date);
          case "Timing":
            return r.timing;
          default:
            return r[key] || "";
        }
      }),
    ]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 8 },
    });
    doc.save("LiveClasses.pdf");
  };

  const filteredRows = rows.filter((r) => {
    const matchesSearch =
      r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.trainer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.counselor?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !filterData.status || r.status === filterData.status;
    const matchesTrainer = !filterData.trainer || r.trainer === filterData.trainer;
    const matchesDateFrom = !filterData.dateFrom || new Date(r.date) >= new Date(filterData.dateFrom);
    const matchesDateTo = !filterData.dateTo || new Date(r.date) <= new Date(filterData.dateTo);

    return matchesSearch && matchesStatus && matchesTrainer && matchesDateFrom && matchesDateTo;
  });

  // Helper functions
  const formatDate = (d) => formatDisplayDate(d);
  
  const toggleColumn = (col) =>
    setVisibleColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  
  const filteredColumns = defaultColumns.filter((c) =>
    c.toLowerCase().includes(columnSearch.toLowerCase())
  );

  // Open create form
  const openCreateForm = () => {
    setEditingRow(null);
    setFormSubmitted(false);
    setFormData({
      name: "",
      date: "",
      timing: "",
      email: "",
      mobile: "",
      trainer: "",
      counselor: "",
      counselorRemark: "",
      trainerReply: "",
      addRemark: "",
      status: "",
      reason: "",
    });
    setErrors({});
    setIsFormOpen(true);
  };

  // Handle input change with real-time validation
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Real-time validation
    if (formSubmitted) {
      validateField(field, value);
    }
  };

  // Handle date input change
  const handleDateChange = (value) => {
    setFormData(prev => ({
      ...prev,
      date: value
    }));

    if (formSubmitted) {
      validateField("date", value);
    }
  };

  // Handle time slot selection
  const handleTimeSelect = (timeSlot) => {
    setFormData(prev => ({
      ...prev,
      timing: timeSlot
    }));
    setIsTimePickerOpen(false);

    if (formSubmitted) {
      validateField("timing", timeSlot);
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
      status: "",
      trainer: "",
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

  // Get field error message
  const getFieldError = (fieldName) => {
    return formSubmitted ? errors[fieldName] : "";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ✅ Mobile Header */}
      <div className="lg:hidden bg-gray-100 px-4 py-3 flex justify-between items-center shadow-sm border-b">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition text-sm"
        >
          <FiArrowLeft className="text-sm" />
        </button>
        
        <h1 className="text-lg font-semibold text-gray-800 truncate mx-2">
          Live Classes
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
            <div className="flex justify-center gap-3 flex-wrap">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 transition text-sm"
                title="Filter"
              >
                <FiFilter className="text-sm" />
                <span>Filter</span>
              </button>

              <button
                onClick={handlePDFExport}
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
            onClick={handlePDFExport}
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
            Live Classes {isAdmin && <span className="text-xs lg:text-sm text-gray-600 ml-2">(View Only)</span>}
          </h2>
          
          {/* Add Button - Only for Counsellors - Hidden on mobile, shown in mobile menu */}
          {isCounsellor && (
            <button
              onClick={openCreateForm}
              className="hidden lg:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition shadow"
            >
              <FiPlus /> Add Live Class
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
                <div className="max-h-48 overflow-y-auto space-y-1">
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
                    onClick={() => {
                      setVisibleColumns(defaultColumns);
                      setColumnSearch("");
                    }}
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
                    placeholder="Search names, trainers, or counselors..."
                    value={searchQuery}
                    onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                    className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-500 transition text-sm"
                  />
                </div>
                <button
                  onClick={() => {
                    dispatch(fetchLiveClasses());
                    dispatch(getTrainers());
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
              <thead className="bg-gray-100 text-gray-700 border-b sticky top-0 z-10">
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
                      {visibleColumns.includes("Name") && (
                        <td className="px-4 py-3 border-r max-w-xs truncate" title={row.name}>
                          {row.name}
                        </td>
                      )}
                      {visibleColumns.includes("Date") && (
                        <td className="px-4 py-3 border-r whitespace-nowrap">
                          {formatDate(row.date)}
                        </td>
                      )}
                      {visibleColumns.includes("Timing") && (
                        <td className="px-4 py-3 border-r whitespace-nowrap">
                          {row.timing}
                        </td>
                      )}
                      {visibleColumns.includes("Email") && (
                        <td className="px-4 py-3 border-r max-w-xs truncate" title={row.email}>
                          {row.email}
                        </td>
                      )}
                      {visibleColumns.includes("Mobile") && (
                        <td className="px-4 py-3 border-r whitespace-nowrap">
                          {row.mobile}
                        </td>
                      )}
                      {visibleColumns.includes("Trainer") && (
                        <td className="px-4 py-3 border-r max-w-xs truncate" title={row.trainer}>
                          {row.trainer}
                        </td>
                      )}
                      {visibleColumns.includes("Counselor") && (
                        <td className="px-4 py-3 border-r max-w-xs truncate" title={row.counselor}>
                          {row.counselor}
                        </td>
                      )}
                      {visibleColumns.includes("Counselor Remark") && (
                        <td className="px-4 py-3 border-r max-w-sm truncate" title={row.counselorRemark}>
                          {row.counselorRemark}
                        </td>
                      )}
                      {visibleColumns.includes("Trainer Reply") && (
                        <td className="px-4 py-3 border-r max-w-sm truncate" title={row.trainerReply}>
                          {row.trainerReply}
                        </td>
                      )}
                      {visibleColumns.includes("Add Remark") && (
                        <td className="px-4 py-3 border-r max-w-sm truncate" title={row.addRemark}>
                          {row.addRemark}
                        </td>
                      )}
                      {visibleColumns.includes("Status") && (
                        <td className="px-4 py-3 border-r">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            row.status === 'Completed' 
                              ? 'bg-green-100 text-green-800'
                              : row.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      )}
                      {visibleColumns.includes("Reason") && (
                        <td className="px-4 py-3 border-r max-w-sm truncate" title={row.reason}>
                          {row.reason}
                        </td>
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
                                  timing: row.timing || ""
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
                        {searchQuery || filterData.status || filterData.trainer || filterData.dateFrom || filterData.dateTo ? (
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

                    {visibleColumns.includes("Name") && (
                      <>
                        <div className="font-medium text-gray-500">Name:</div>
                        <div className="truncate" title={row.name}>{row.name}</div>
                      </>
                    )}

                    {visibleColumns.includes("Date") && (
                      <>
                        <div className="font-medium text-gray-500">Date:</div>
                        <div>{formatDate(row.date)}</div>
                      </>
                    )}

                    {visibleColumns.includes("Timing") && (
                      <>
                        <div className="font-medium text-gray-500">Timing:</div>
                        <div>{row.timing}</div>
                      </>
                    )}

                    {visibleColumns.includes("Email") && (
                      <>
                        <div className="font-medium text-gray-500">Email:</div>
                        <div className="truncate" title={row.email}>{row.email}</div>
                      </>
                    )}

                    {visibleColumns.includes("Mobile") && (
                      <>
                        <div className="font-medium text-gray-500">Mobile:</div>
                        <div>{row.mobile}</div>
                      </>
                    )}

                    {visibleColumns.includes("Trainer") && (
                      <>
                        <div className="font-medium text-gray-500">Trainer:</div>
                        <div className="truncate" title={row.trainer}>{row.trainer}</div>
                      </>
                    )}

                    {visibleColumns.includes("Counselor") && (
                      <>
                        <div className="font-medium text-gray-500">Counselor:</div>
                        <div className="truncate" title={row.counselor}>{row.counselor}</div>
                      </>
                    )}

                    {visibleColumns.includes("Status") && (
                      <>
                        <div className="font-medium text-gray-500">Status:</div>
                        <div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            row.status === 'Completed' 
                              ? 'bg-green-100 text-green-800'
                              : row.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {row.status}
                          </span>
                        </div>
                      </>
                    )}

                    {visibleColumns.includes("Counselor Remark") && row.counselorRemark && (
                      <>
                        <div className="font-medium text-gray-500">Counselor Remark:</div>
                        <div className="truncate" title={row.counselorRemark}>{row.counselorRemark}</div>
                      </>
                    )}

                    {visibleColumns.includes("Trainer Reply") && row.trainerReply && (
                      <>
                        <div className="font-medium text-gray-500">Trainer Reply:</div>
                        <div className="truncate" title={row.trainerReply}>{row.trainerReply}</div>
                      </>
                    )}

                    {visibleColumns.includes("Add Remark") && row.addRemark && (
                      <>
                        <div className="font-medium text-gray-500">Add Remark:</div>
                        <div className="truncate" title={row.addRemark}>{row.addRemark}</div>
                      </>
                    )}

                    {visibleColumns.includes("Reason") && row.reason && (
                      <>
                        <div className="font-medium text-gray-500">Reason:</div>
                        <div className="truncate" title={row.reason}>{row.reason}</div>
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
                                timing: row.timing || ""
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
                  {searchQuery || filterData.status || filterData.trainer || filterData.dateFrom || filterData.dateTo ? (
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
              {(searchQuery || filterData.status || filterData.trainer || filterData.dateFrom || filterData.dateTo) && 
                " (filtered)"}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Responsive Modal Form - ONLY FOR COUNSELLORS */}
      {isFormOpen && isCounsellor && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
          <div 
            ref={formRef}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative border border-gray-200"
          >
            <button
              onClick={handleFormClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 z-10"
            >
              <FiX size={20} />
            </button>

            <div className="p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-semibold mb-4 text-center text-gray-800">
                {editingRow ? "Edit Live Class" : "Add Live Class"}
              </h3>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Name */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm ${
                      getFieldError("name") ? "border-red-500 bg-red-50" : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Enter full name"
                    maxLength="50"
                  />
                  {getFieldError("name") && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError("name")}</p>
                  )}
                  <div className="text-xs text-gray-500 text-right mt-1">
                    {formData.name.length}/50
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm ${
                      getFieldError("date") ? "border-red-500 bg-red-50" : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {getFieldError("date") && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError("date")}</p>
                  )}
                  {formData.date && (
                    <p className="text-xs text-gray-500 mt-1">
                      Display: {formatDisplayDate(formData.date)}
                    </p>
                  )}
                </div>

                {/* Timing */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Timing <span className="text-red-500">*</span>
                  </label>
                  <div className="relative" ref={timePickerRef}>
                    <button
                      type="button"
                      onClick={() => setIsTimePickerOpen(!isTimePickerOpen)}
                      className={`w-full border rounded-lg px-3 py-2 text-left flex justify-between items-center text-sm ${
                        getFieldError("timing") ? "border-red-500 bg-red-50" : "border-gray-300"
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    >
                      <span className={formData.timing ? "text-gray-800" : "text-gray-500"}>
                        {formData.timing || "Select time slot"}
                      </span>
                      <FiChevronDown className={`text-gray-400 transition-transform ${isTimePickerOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {getFieldError("timing") && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError("timing")}</p>
                    )}

                    {/* Time Picker Dropdown */}
                    {isTimePickerOpen && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2">
                          {timeSlots.map((slot, index) => (
                            <div
                              key={index}
                              className={`p-3 cursor-pointer rounded-lg border transition mb-2 last:mb-0 ${
                                formData.timing === slot
                                  ? 'bg-blue-100 border-blue-400 text-blue-700' 
                                  : 'border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                              }`}
                              onClick={() => handleTimeSelect(slot)}
                            >
                              <div className="font-medium flex items-center gap-2 text-sm">
                                <FiClock className="text-gray-400" />
                                {slot}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Trainer */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Trainer <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="trainer"
                    value={formData.trainer}
                    onChange={(e) => handleInputChange("trainer", e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm ${
                      getFieldError("trainer") ? "border-red-500 bg-red-50" : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
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
                  {getFieldError("trainer") && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError("trainer")}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm ${
                      getFieldError("email") ? "border-red-500 bg-red-50" : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="example@email.com"
                    maxLength="100"
                  />
                  {getFieldError("email") && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError("email")}</p>
                  )}
                  <div className="text-xs text-gray-500 text-right mt-1">
                    {formData.email.length}/100
                  </div>
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-sm font-medium mb-1">Mobile</label>
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange("mobile", e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm ${
                      getFieldError("mobile") ? "border-red-500 bg-red-50" : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="10-digit mobile number"
                    maxLength="15"
                  />
                  {getFieldError("mobile") && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError("mobile")}</p>
                  )}
                </div>

                {/* Counselor */}
                <div>
                  <label className="block text-sm font-medium mb-1">Counselor</label>
                  <input
                    type="text"
                    name="counselor"
                    value={formData.counselor}
                    onChange={(e) => handleInputChange("counselor", e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm ${
                      getFieldError("counselor") ? "border-red-500 bg-red-50" : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Counselor name"
                    maxLength="50"
                  />
                  {getFieldError("counselor") && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError("counselor")}</p>
                  )}
                  <div className="text-xs text-gray-500 text-right mt-1">
                    {formData.counselor.length}/50
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Status</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Counselor Remark */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium mb-1">Counselor Remark</label>
                  <textarea
                    name="counselorRemark"
                    value={formData.counselorRemark}
                    onChange={(e) => handleInputChange("counselorRemark", e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm ${
                      getFieldError("counselorRemark") ? "border-red-500 bg-red-50" : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Enter counselor remarks (max 200 characters)"
                    rows="2"
                    maxLength="200"
                  />
                  {getFieldError("counselorRemark") && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError("counselorRemark")}</p>
                  )}
                  <div className="text-xs text-gray-500 text-right mt-1">
                    {formData.counselorRemark.length}/200
                  </div>
                </div>

                {/* Trainer Reply */}
                <div>
                  <label className="block text-sm font-medium mb-1">Trainer Reply</label>
                  <input
                    type="text"
                    name="trainerReply"
                    value={formData.trainerReply}
                    onChange={(e) => handleInputChange("trainerReply", e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm ${
                      getFieldError("trainerReply") ? "border-red-500 bg-red-50" : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Trainer response"
                    maxLength="200"
                  />
                  {getFieldError("trainerReply") && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError("trainerReply")}</p>
                  )}
                  <div className="text-xs text-gray-500 text-right mt-1">
                    {formData.trainerReply.length}/200
                  </div>
                </div>

                {/* Add Remark */}
                <div>
                  <label className="block text-sm font-medium mb-1">Add Remark</label>
                  <input
                    type="text"
                    name="addRemark"
                    value={formData.addRemark}
                    onChange={(e) => handleInputChange("addRemark", e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm ${
                      getFieldError("addRemark") ? "border-red-500 bg-red-50" : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Additional remarks"
                    maxLength="200"
                  />
                  {getFieldError("addRemark") && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError("addRemark")}</p>
                  )}
                  <div className="text-xs text-gray-500 text-right mt-1">
                    {formData.addRemark.length}/200
                  </div>
                </div>

                {/* Reason */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium mb-1">Reason</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={(e) => handleInputChange("reason", e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm ${
                      getFieldError("reason") ? "border-red-500 bg-red-50" : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Enter reason (max 200 characters)"
                    rows="2"
                    maxLength="200"
                  />
                  {getFieldError("reason") && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError("reason")}</p>
                  )}
                  <div className="text-xs text-gray-500 text-right mt-1">
                    {formData.reason.length}/200
                  </div>
                </div>

                {/* Form Actions */}
                <div className="lg:col-span-2 flex justify-end gap-2 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleFormClose}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition text-sm flex-1 lg:flex-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium text-sm flex-1 lg:flex-none"
                  >
                    {editingRow ? "Update" : "Create Live Class"}
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
              <FiX size={20} />
            </button>

            <div className="p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-semibold mb-4 text-center text-gray-800">
                Filter Live Classes
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={filterData.status}
                    onChange={(e) => setFilterData({ ...filterData, status: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Statuses</option>
                    {uniqueStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Trainer</label>
                  <select
                    value={filterData.trainer}
                    onChange={(e) => setFilterData({ ...filterData, trainer: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Trainers</option>
                    {uniqueTrainers.map((trainer) => (
                      <option key={trainer} value={trainer}>
                        {trainer}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date From</label>
                    <input
                      type="date"
                      value={filterData.dateFrom}
                      onChange={(e) => setFilterData({ ...filterData, dateFrom: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Date To</label>
                    <input
                      type="date"
                      value={filterData.dateTo}
                      onChange={(e) => setFilterData({ ...filterData, dateTo: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {filterErrors.dateRange && (
                  <p className="text-red-500 text-sm text-center">{filterErrors.dateRange}</p>
                )}

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={handleFilterReset}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition text-sm flex-1 lg:flex-none"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleFilterApply}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm flex-1 lg:flex-none"
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

export default LiveClassDemo;