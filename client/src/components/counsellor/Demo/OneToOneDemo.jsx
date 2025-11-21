import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOneToOneDemos,
  addOneToOneDemo,
  updateOneToOneDemo,
  deleteOneToOneDemo,
  setSearchQuery,
} from "../../../store/slices/oneToOneSlice";
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

const OneToOneDemo = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { rows, searchQuery } = useSelector((state) => state.oneToOne);
  const { user } = useSelector((state) => state.auth);
  const { trainers } = useSelector((state) => state.trainer);

  // Role checks
  const isAdmin = user?.role === 'Admin';
  const isCounsellor = user?.role === 'Counsellor';

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const dropdownRef = useRef(null);
  const timePickerRef = useRef(null);
  const formRef = useRef(null);
  const mobileMenuRef = useRef(null);

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

  // Time slots for selection
  const timeSlots = [
    { label: "10:00 AM - 12:00 PM", value: "10:00 AM - 12:00 PM" },
    { label: "12:00 PM - 2:00 PM", value: "12:00 PM - 2:00 PM" },
    { label: "3:00 PM - 5:00 PM", value: "3:00 PM - 5:00 PM" },
    { label: "5:00 PM - 7:00 PM", value: "5:00 PM - 7:00 PM" },
  ];

  // Responsive breakpoints
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

  useEffect(() => {
    dispatch(fetchOneToOneDemos());
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
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFormOpen]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        await dispatch(updateOneToOneDemo({ id: editingRow._id, data: submissionData }));
      } else {
        await dispatch(addOneToOneDemo(submissionData));
      }

      handleFormClose();
      dispatch(fetchOneToOneDemos());
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
    if (window.confirm("Are you sure you want to delete this demo?")) {
      await dispatch(deleteOneToOneDemo(id));
      dispatch(fetchOneToOneDemos());
    }
  };

  // PDF Export
  const handlePDFExport = () => {
    const doc = new jsPDF();
    doc.text("One-to-One Demo Report", 14, 15);
    const tableColumn = ["S.No", ...visibleColumns];
    const tableRows = filteredRows.map((r, i) => [
      i + 1,
      ...visibleColumns.map((col) => {
        const key = col.split(' ').map((word, index) => index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
        switch (col) {
          case "Date":
            return formatDisplayDate(r.date);
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
    doc.save("OneToOneDemo.pdf");
  };

  const filteredRows = rows.filter((r) => {
    const matchSearch = !searchQuery
      ? true
      : Object.values(r).join(" ").toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = !filterData.status || r.status === filterData.status;
    const matchTrainer = !filterData.trainer || r.trainer === filterData.trainer;
    const matchDateFrom = !filterData.dateFrom || new Date(r.date) >= new Date(filterData.dateFrom);
    const matchDateTo = !filterData.dateTo || new Date(r.date) <= new Date(filterData.dateTo);
    return matchSearch && matchStatus && matchTrainer && matchDateFrom && matchDateTo;
  });

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
      timing: timeSlot.value
    }));
    setIsTimePickerOpen(false);

    if (formSubmitted) {
      validateField("timing", timeSlot.value);
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

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar with Role Badge */}
      <div className="flex justify-between items-center bg-gray-100 px-4 md:px-6 py-3 border-b">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 md:gap-2 bg-blue-600 text-white px-3 md:px-4 py-1.5 rounded-md hover:bg-blue-700 transition text-sm md:text-base"
          >
            <FiArrowLeft className="text-sm md:text-base" /> 
            <span className="hidden sm:inline">Go Back</span>
          </button>
          
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md border border-gray-300 hover:bg-gray-200 transition"
          >
            <FiMenu size={18} />
          </button>
        </div>
        
        <div className={`flex items-center gap-2 md:gap-4 ${isMobileMenuOpen ? 'max-md:fixed max-md:top-16 max-md:right-4 max-md:bg-white max-md:border max-md:rounded-lg max-md:shadow-lg max-md:p-4 max-md:z-40 max-md:flex-col max-md:items-end' : 'max-md:hidden'}`}
             ref={mobileMenuRef}>
          <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
            isAdmin
              ? 'bg-purple-100 text-purple-800 border border-purple-300'
              : 'bg-gray-100 text-green-800 border border-gray-100'
          }`}>
            {isAdmin ? '' : ''}
          </span>

          <button
            onClick={() => {
              setIsFilterOpen(!isFilterOpen);
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-1 md:gap-1 bg-gray-200 text-gray-700 px-2 md:px-2 py-1.5 md:py-2 rounded-md hover:bg-gray-300 transition text-sm"
            title="Filter"
          >
            <FiFilter className="text-sm md:text-base" />
            <span className="hidden sm:inline"></span>
          </button>

          <button
            onClick={handlePDFExport}
            className="flex items-center gap-1 md:gap-1 bg-gray-200 text-gray-700 px-2 md:px-2 py-1.5 md:py-2 rounded-md hover:bg-gray-300 transition text-sm"
            title="Export PDF"
          >
            <FiDownload className="text-sm md:text-base" />
            <span className="hidden sm:inline"></span>
          </button>
        </div>
      </div>

      {/* Title Section */}
      <div className="mx-4 md:mx-6 mt-4 md:mt-6 mb-4 md:mb-6 bg-gray-50 p-4 md:p-5 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">
            1-1 Demo {isAdmin && <span className="text-xs md:text-sm text-gray-600 ml-2">(View Only)</span>}
          </h2>
          
          {isCounsellor && (
            <button
              onClick={openCreateForm}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-3 md:px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm md:text-base w-full sm:w-auto"
            >
              <FiPlus /> Add 1-1 Demo
            </button>
          )}
        </div>

        {/* Columns and Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setIsColumnsOpen(!isColumnsOpen)}
                className="flex items-center gap-2 border border-blue-500 text-blue-600 px-2 md:px-3 py-1.5 md:py-2 rounded-md hover:bg-blue-50 transition text-xs md:text-sm w-full sm:w-auto"
              >
                <FiColumns /> Columns{" "}
                <span className="bg-blue-100 text-blue-700 px-1.5 md:px-2 py-0.5 rounded text-xs">
                  {visibleColumns.length}/{defaultColumns.length}
                </span>
              </button>

              {isColumnsOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute top-11 left-0 bg-white border shadow-lg rounded-md w-72 md:w-80 p-3 z-50 max-h-96 overflow-y-auto"
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

                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      onClick={() => setVisibleColumns(defaultColumns)}
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition"
                    >
                      Show All
                    </button>
                    <button
                      onClick={() => setVisibleColumns([])}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition"
                    >
                      Hide All
                    </button>
                    <button
                      onClick={() => setVisibleColumns(defaultColumns)}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isCounsellor && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition text-sm md:text-base"
                />
              </div>
              <button
                onClick={() => {
                  dispatch(fetchOneToOneDemos());
                  dispatch(getTrainers());
                }}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-200 transition"
              >
                <FiRefreshCw />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="px-2 sm:px-4 md:px-6 pb-4 md:pb-6">
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm text-left border-collapse">
              <thead className="bg-gray-100 text-gray-700 border-b">
                <tr>
                  <th className="px-2 md:px-4 py-2 md:py-3 border-r font-medium whitespace-nowrap">S.No</th>
                  {defaultColumns.map(
                    (col) =>
                      visibleColumns.includes(col) && (
                        <th key={col} className="px-2 md:px-4 py-2 md:py-3 border-r font-medium whitespace-nowrap">
                          {isMobile ? col.split(' ')[0] : col}
                        </th>
                      )
                  )}
                  {isCounsellor && (
                    <th className="px-2 md:px-4 py-2 md:py-3 font-medium whitespace-nowrap">Actions</th>
                  )}
                  {isAdmin && (
                    <th className="px-2 md:px-4 py-2 md:py-3 font-medium whitespace-nowrap">View</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredRows.length > 0 ? (
                  filteredRows.map((row, idx) => (
                    <tr key={row._id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-2 md:px-4 py-1.5 md:py-2 border-r text-center">{idx + 1}</td>
                      {visibleColumns.includes("Name") && (
                        <td className="px-2 md:px-4 py-1.5 md:py-2 border-r max-w-[120px] truncate" title={row.name}>
                          {row.name}
                        </td>
                      )}
                      {visibleColumns.includes("Date") && (
                        <td className="px-2 md:px-4 py-1.5 md:py-2 border-r whitespace-nowrap">
                          {formatDate(row.date)}
                        </td>
                      )}
                      {visibleColumns.includes("Timing") && (
                        <td className="px-2 md:px-4 py-1.5 md:py-2 border-r whitespace-nowrap">
                          {isMobile ? row.timing?.split(' ')[0] : row.timing}
                        </td>
                      )}
                      {visibleColumns.includes("Email") && (
                        <td className="px-2 md:px-4 py-1.5 md:py-2 border-r max-w-[120px] truncate" title={row.email}>
                          {row.email}
                        </td>
                      )}
                      {visibleColumns.includes("Mobile") && (
                        <td className="px-2 md:px-4 py-1.5 md:py-2 border-r whitespace-nowrap">
                          {row.mobile}
                        </td>
                      )}
                      {visibleColumns.includes("Trainer") && (
                        <td className="px-2 md:px-4 py-1.5 md:py-2 border-r max-w-[100px] truncate" title={row.trainer}>
                          {row.trainer}
                        </td>
                      )}
                      {visibleColumns.includes("Counselor") && (
                        <td className="px-2 md:px-4 py-1.5 md:py-2 border-r max-w-[100px] truncate" title={row.counselor}>
                          {row.counselor}
                        </td>
                      )}
                      {visibleColumns.includes("Counselor Remark") && (
                        <td className="px-2 md:px-4 py-1.5 md:py-2 border-r max-w-[120px] truncate" title={row.counselorRemark}>
                          {row.counselorRemark}
                        </td>
                      )}
                      {visibleColumns.includes("Trainer Reply") && (
                        <td className="px-2 md:px-4 py-1.5 md:py-2 border-r max-w-[120px] truncate" title={row.trainerReply}>
                          {row.trainerReply}
                        </td>
                      )}
                      {visibleColumns.includes("Add Remark") && (
                        <td className="px-2 md:px-4 py-1.5 md:py-2 border-r max-w-[120px] truncate" title={row.addRemark}>
                          {row.addRemark}
                        </td>
                      )}
                      {visibleColumns.includes("Status") && (
                        <td className="px-2 md:px-4 py-1.5 md:py-2 border-r">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            row.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            row.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      )}
                      {visibleColumns.includes("Reason") && (
                        <td className="px-2 md:px-4 py-1.5 md:py-2 border-r max-w-[120px] truncate" title={row.reason}>
                          {row.reason}
                        </td>
                      )}
                      
                      {isCounsellor && (
                        <td className="px-2 md:px-4 py-1.5 md:py-2 flex gap-1 md:gap-2 justify-center">
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
                            className="text-blue-600 hover:text-blue-800 p-1 transition"
                            title="Edit"
                          >
                            <FiEdit size={isMobile ? 14 : 16} />
                          </button>
                          <button
                            onClick={() => handleDelete(row._id)}
                            className="text-red-500 hover:text-red-700 p-1 transition"
                            title="Delete"
                          >
                            <FiTrash2 size={isMobile ? 14 : 16} />
                          </button>
                        </td>
                      )}
                      
                      {isAdmin && (
                        <td className="px-2 md:px-4 py-1.5 md:py-2">
                          <span className="text-gray-400 flex justify-center" title="View Only">
                            <FiEye size={isMobile ? 14 : 16} />
                          </span>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={visibleColumns.length + (isCounsellor ? 2 : isAdmin ? 2 : 1)}
                      className="text-center py-6 text-gray-500 text-sm"
                    >
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Row Count */}
          {filteredRows.length > 0 && (
            <div className="bg-gray-50 px-4 md:px-6 py-2 md:py-3 border-t text-xs text-gray-600">
              Showing {filteredRows.length} of {rows.length} records
              {(searchQuery || filterData.status || filterData.trainer || filterData.dateFrom || filterData.dateTo) &&
                " (filtered)"}
            </div>
          )}
        </div>
      </div>

      {/* Form Modal - ONLY FOR COUNSELLORS */}
      {isFormOpen && isCounsellor && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-2 md:p-4">
          <div 
            ref={formRef}
            className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 md:p-6 relative"
          >
            <button
              onClick={handleFormClose}
              className="absolute top-2 right-2 md:top-3 md:right-3 text-gray-500 hover:text-gray-700"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-lg md:text-xl font-semibold mb-4">
              {editingRow ? "Edit 1-1 Demo" : "Add 1-1 Demo"}
            </h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {/* Name */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full border rounded px-3 py-2 text-sm ${
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
              <div className="md:col-span-1">
                <label className="block text-sm font-medium mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className={`w-full border rounded px-3 py-2 text-sm ${
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
              <div className="md:col-span-1">
                <label className="block text-sm font-medium mb-1">
                  Timing <span className="text-red-500">*</span>
                </label>
                <div className="relative" ref={timePickerRef}>
                  <button
                    type="button"
                    onClick={() => setIsTimePickerOpen(!isTimePickerOpen)}
                    className={`w-full border rounded px-3 py-2 text-left flex justify-between items-center text-sm ${
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
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleTimeSelect(slot)}
                            className={`w-full text-left p-2 md:p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition mb-2 last:mb-0 text-sm ${
                              formData.timing === slot.value 
                                ? 'bg-blue-100 border-blue-400 text-blue-700' 
                                : 'border-gray-200'
                            }`}
                          >
                            <div className="font-medium">{slot.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Trainer */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium mb-1">
                  Trainer <span className="text-red-500">*</span>
                </label>
                <select
                  name="trainer"
                  value={formData.trainer}
                  onChange={(e) => handleInputChange("trainer", e.target.value)}
                  className={`w-full border rounded px-3 py-2 text-sm ${
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
              <div className="md:col-span-1">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full border rounded px-3 py-2 text-sm ${
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
              <div className="md:col-span-1">
                <label className="block text-sm font-medium mb-1">Mobile</label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange("mobile", e.target.value)}
                  className={`w-full border rounded px-3 py-2 text-sm ${
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
              <div className="md:col-span-1">
                <label className="block text-sm font-medium mb-1">Counselor</label>
                <input
                  type="text"
                  name="counselor"
                  value={formData.counselor}
                  onChange={(e) => handleInputChange("counselor", e.target.value)}
                  className={`w-full border rounded px-3 py-2 text-sm ${
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
              <div className="md:col-span-1">
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Status</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Counselor Remark */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Counselor Remark</label>
                <textarea
                  name="counselorRemark"
                  value={formData.counselorRemark}
                  onChange={(e) => handleInputChange("counselorRemark", e.target.value)}
                  className={`w-full border rounded px-3 py-2 text-sm ${
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
              <div className="md:col-span-1">
                <label className="block text-sm font-medium mb-1">Trainer Reply</label>
                <input
                  type="text"
                  name="trainerReply"
                  value={formData.trainerReply}
                  onChange={(e) => handleInputChange("trainerReply", e.target.value)}
                  className={`w-full border rounded px-3 py-2 text-sm ${
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
              <div className="md:col-span-1">
                <label className="block text-sm font-medium mb-1">Add Remark</label>
                <input
                  type="text"
                  name="addRemark"
                  value={formData.addRemark}
                  onChange={(e) => handleInputChange("addRemark", e.target.value)}
                  className={`w-full border rounded px-3 py-2 text-sm ${
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={(e) => handleInputChange("reason", e.target.value)}
                  className={`w-full border rounded px-3 py-2 text-sm ${
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
              <div className="md:col-span-2 flex justify-end mt-4 md:mt-6 pt-3 md:pt-4 border-t">
                <button
                  type="button"
                  onClick={handleFormClose}
                  className="px-4 md:px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition mr-2 md:mr-3 text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 md:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium text-sm md:text-base"
                >  
                  {editingRow ? "Update" : "Create 1-1 Demo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4 md:p-6 relative">
            <button
              onClick={() => setIsFilterOpen(false)}
              className="absolute top-2 right-2 md:top-3 md:right-3 text-gray-500 hover:text-gray-700"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-lg md:text-xl font-semibold mb-4">Filter 1-1 Demos</h3>

            <div className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={filterData.status}
                  onChange={(e) => setFilterData({ ...filterData, status: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm md:text-base"
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
                  className="w-full border rounded px-3 py-2 text-sm md:text-base"
                >
                  <option value="">All Trainers</option>
                  {uniqueTrainers.map((trainer) => (
                    <option key={trainer} value={trainer}>
                      {trainer}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date From</label>
                  <input
                    type="date"
                    value={filterData.dateFrom}
                    onChange={(e) => setFilterData({ ...filterData, dateFrom: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date To</label>
                  <input
                    type="date"
                    value={filterData.dateTo}
                    onChange={(e) => setFilterData({ ...filterData, dateTo: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm md:text-base"
                  />
                </div>
              </div>

              {filterErrors.dateRange && (
                <p className="text-red-500 text-sm">{filterErrors.dateRange}</p>
              )}

              <div className="flex justify-end gap-2 md:gap-3 mt-4 md:mt-6">
                <button
                  onClick={handleFilterReset}
                  className="px-3 md:px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition text-sm md:text-base"
                >
                  Reset
                </button>
                <button
                  onClick={handleFilterApply}
                  className="px-4 md:px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm md:text-base"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OneToOneDemo;