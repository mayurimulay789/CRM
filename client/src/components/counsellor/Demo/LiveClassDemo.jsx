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
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const dropdownRef = useRef(null);
  const timePickerRef = useRef(null);

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

  // Time picker state
  const [timePicker, setTimePicker] = useState({
    hour: 9,
    minute: 0,
    period: "AM"
  });

  // Month names for formatting
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Time options
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10, 15, ... 55
  const periods = ["AM", "PM"];

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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  // Format time to AM/PM
  const formatDisplayTime = (timeString) => {
    if (!timeString) return "";
    
    try {
      // Handle both "HH:MM" and "HH:MM:SS" formats
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const minute = minutes || '00';
      
      if (isNaN(hour)) return timeString;
      
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      
      return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      return timeString;
    }
  };

  // Parse time from AM/PM to 24-hour format
  const parseTimeInput = (timeString) => {
    if (!timeString) return "";
    
    try {
      const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return timeString;
      
      let [_, hours, minutes, period] = match;
      let hour = parseInt(hours, 10);
      let minute = parseInt(minutes, 10);
      
      if (period.toUpperCase() === 'PM' && hour !== 12) {
        hour += 12;
      } else if (period.toUpperCase() === 'AM' && hour === 12) {
        hour = 0;
      }
      
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    } catch (error) {
      return timeString;
    }
  };

  // Open time picker
  const openTimePicker = () => {
    if (formData.timing) {
      // Parse existing time
      const match = formData.timing.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        let [_, hour, minute, period] = match;
        setTimePicker({
          hour: parseInt(hour, 10),
          minute: parseInt(minute, 10),
          period: period.toUpperCase()
        });
      }
    }
    setIsTimePickerOpen(true);
  };

  // Select time from picker
  const selectTime = (hour, minute, period) => {
    const formattedTime = `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
    setFormData(prev => ({
      ...prev,
      timing: formattedTime
    }));
    setIsTimePickerOpen(false);
    
    // Clear error if any
    if (formSubmitted && errors.timing) {
      setErrors(prev => ({
        ...prev,
        timing: ""
      }));
    }
  };

  // Quick time selection
  const quickTimes = [
    { label: "9:00 AM", hour: 9, minute: 0, period: "AM" },
    { label: "9:30 AM", hour: 9, minute: 30, period: "AM" },
    { label: "10:00 AM", hour: 10, minute: 0, period: "AM" },
    { label: "10:30 AM", hour: 10, minute: 30, period: "AM" },
    { label: "11:00 AM", hour: 11, minute: 0, period: "AM" },
    { label: "11:30 AM", hour: 11, minute: 30, period: "AM" },
    { label: "12:00 PM", hour: 12, minute: 0, period: "PM" },
    { label: "12:30 PM", hour: 12, minute: 30, period: "PM" },
    { label: "1:00 PM", hour: 1, minute: 0, period: "PM" },
    { label: "1:30 PM", hour: 1, minute: 30, period: "PM" },
    { label: "2:00 PM", hour: 2, minute: 0, period: "PM" },
    { label: "2:30 PM", hour: 2, minute: 30, period: "PM" },
    { label: "3:00 PM", hour: 3, minute: 0, period: "PM" },
    { label: "3:30 PM", hour: 3, minute: 30, period: "PM" },
    { label: "4:00 PM", hour: 4, minute: 0, period: "PM" },
    { label: "4:30 PM", hour: 4, minute: 30, period: "PM" },
    { label: "5:00 PM", hour: 5, minute: 0, period: "PM" },
    { label: "5:30 PM", hour: 5, minute: 30, period: "PM" },
    { label: "6:00 PM", hour: 6, minute: 0, period: "PM" },
    { label: "6:30 PM", hour: 6, minute: 30, period: "PM" },
  ];

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

  // Validation rules
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
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

    if (!formData.timing) {
      newErrors.timing = "Timing is required";
    } else {
      // Validate time format
      const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
      if (!timeRegex.test(formData.timing.trim())) {
        newErrors.timing = "Please select a valid time";
      }
    }

    if (!formData.trainer) {
      newErrors.trainer = "Please select a trainer";
    }

    // Optional fields with validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (formData.mobile) {
      if (!/^[0-9]{10}$/.test(formData.mobile.replace(/\s/g, ''))) {
        newErrors.mobile = "Mobile number must be 10 digits";
      }
    }

    if (formData.counselorRemark && formData.counselorRemark.length > 200) {
      newErrors.counselorRemark = "Remark cannot exceed 200 characters";
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
      return;
    }

    try {
      // Convert date and time to proper format before sending to backend
      const submissionData = {
        ...formData,
        date: formData.date ? new Date(formData.date).toISOString() : "",
        timing: formData.timing ? parseTimeInput(formData.timing) : ""
      };

      if (editingRow) {
        await dispatch(updateLiveClass({ id: editingRow._id, data: submissionData }));
      } else {
        await dispatch(addLiveClass(submissionData));
      }

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
      dispatch(fetchLiveClasses());
    } catch (error) {
      console.error("Error submitting form:", error);
    }
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
            return formatDisplayTime(r.timing);
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

  // Helper functions
  const formatDate = (d) => formatDisplayDate(d);
  const formatTime = (t) => formatDisplayTime(t);
  
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

  // Handle time input change
  const handleTimeChange = (value) => {
    setFormData(prev => ({
      ...prev,
      timing: value
    }));

    if (formSubmitted && errors.timing) {
      setErrors(prev => ({
        ...prev,
        timing: ""
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

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar with Role Badge */}
      <div className="flex justify-between items-center bg-gray-100 px-6 py-3 border-b">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition"
        >
          <FiArrowLeft /> Go Back
        </button>
        
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isAdmin
              ? 'bg-purple-100 text-purple-800 border border-purple-300'
              : 'bg-green-100 text-green-800 border border-green-300'
          }`}>
            {isAdmin ? '👨‍💻 Admin View' : '💼 Counsellor'}
          </span>

          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 transition"
            title="Filter"
          >
            <FiFilter />
          </button>

          <button
            onClick={handlePDFExport}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 transition"
            title="Export PDF"
          >
            <FiDownload />
          </button>
        </div>
      </div>

      {/* Title Section */}
      <div className="mx-6 mt-6 bg-gray-50 p-5 rounded-lg shadow-sm border relative">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-gray-800">
            Live Classes {isAdmin && <span className="text-sm text-gray-600 ml-2">(View Only)</span>}
          </h2>
          
          {isCounsellor && (
            <button
              onClick={openCreateForm}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              <FiPlus /> Add Live Class
            </button>
          )}
        </div>

        {/* Columns + Actions */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsColumnsOpen(!isColumnsOpen)}
              className="flex items-center gap-2 border border-blue-500 text-blue-600 px-3 py-2 rounded-md hover:bg-blue-50 transition text-sm"
            >
              <FiColumns /> Columns {visibleColumns.length}/{defaultColumns.length}
            </button>

            {isColumnsOpen && (
              <div
                ref={dropdownRef}
                className="absolute top-20 left-6 bg-white border shadow-lg rounded-md w-64 p-3 z-50"
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
                  className="w-full border rounded-md px-2 py-1 mb-2 text-sm"
                />
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredColumns.map((col) => (
                    <label key={col} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(col)}
                        onChange={() => toggleColumn(col)}
                      />
                      {col}
                    </label>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
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
                    onClick={() => {
                      setVisibleColumns(defaultColumns);
                      setColumnSearch("");
                    }}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          {isCounsellor && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-72 focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <button
                onClick={() => {
                  dispatch(fetchLiveClasses());
                  dispatch(getTrainers());
                }}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                <FiRefreshCw />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="px-6 py-6">
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700 border-b">
              <tr>
                <th className="px-4 py-3 border-r font-medium">S.No</th>
                {defaultColumns.map(
                  (col) =>
                    visibleColumns.includes(col) && (
                      <th key={col} className="px-4 py-3 border-r font-medium whitespace-nowrap">
                        {col}
                      </th>
                    )
                )}
                {isCounsellor && (
                  <th className="px-4 py-3 font-medium">Actions</th>
                )}
                {isAdmin && (
                  <th className="px-4 py-3 font-medium">View</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row, idx) => (
                  <tr key={row._id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-2 border-r">{idx + 1}</td>
                    {visibleColumns.includes("Name") && <td className="px-4 py-2 border-r">{row.name}</td>}
                    {visibleColumns.includes("Date") && <td className="px-4 py-2 border-r">{formatDate(row.date)}</td>}
                    {visibleColumns.includes("Timing") && <td className="px-4 py-2 border-r">{formatTime(row.timing)}</td>}
                    {visibleColumns.includes("Email") && <td className="px-4 py-2 border-r">{row.email}</td>}
                    {visibleColumns.includes("Mobile") && <td className="px-4 py-2 border-r">{row.mobile}</td>}
                    {visibleColumns.includes("Trainer") && <td className="px-4 py-2 border-r">{row.trainer}</td>}
                    {visibleColumns.includes("Counselor") && <td className="px-4 py-2 border-r">{row.counselor}</td>}
                    {visibleColumns.includes("Counselor Remark") && <td className="px-4 py-2 border-r">{row.counselorRemark}</td>}
                    {visibleColumns.includes("Trainer Reply") && <td className="px-4 py-2 border-r">{row.trainerReply}</td>}
                    {visibleColumns.includes("Add Remark") && <td className="px-4 py-2 border-r">{row.addRemark}</td>}
                    {visibleColumns.includes("Status") && <td className="px-4 py-2 border-r">{row.status}</td>}
                    {visibleColumns.includes("Reason") && <td className="px-4 py-2 border-r">{row.reason}</td>}
                    
                    {isCounsellor && (
                      <td className="px-4 py-2 flex gap-2">
                        <button
                          onClick={() => {
                            setEditingRow(row);
                            setFormData({
                              ...row,
                              date: row.date ? new Date(row.date).toISOString().split('T')[0] : "",
                              timing: row.timing ? formatDisplayTime(row.timing) : ""
                            });
                            setFormSubmitted(false);
                            setIsFormOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(row._id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    )}
                    
                    {isAdmin && (
                      <td className="px-4 py-2">
                        <span className="text-gray-400 flex justify-center" title="View Only">
                          <FiEye />
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
      </div>

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[500px] p-6 relative">
            <button
              onClick={() => setIsFilterOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-xl font-semibold mb-4">Filter Live Classes</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={filterData.status}
                  onChange={(e) => setFilterData({ ...filterData, status: e.target.value })}
                  className="w-full border rounded px-3 py-2"
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
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">All Trainers</option>
                  {uniqueTrainers.map((trainer) => (
                    <option key={trainer} value={trainer}>
                      {trainer}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date From</label>
                  <input
                    type="date"
                    value={filterData.dateFrom}
                    onChange={(e) => setFilterData({ ...filterData, dateFrom: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date To</label>
                  <input
                    type="date"
                    value={filterData.dateTo}
                    onChange={(e) => setFilterData({ ...filterData, dateTo: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              {filterErrors.dateRange && (
                <p className="text-red-500 text-sm">{filterErrors.dateRange}</p>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={handleFilterReset}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                >
                  Reset
                </button>
                <button
                  onClick={handleFilterApply}
                  className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal - ONLY FOR COUNSELLORS */}
      {isFormOpen && isCounsellor && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[800px] max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => {
                setIsFormOpen(false);
                setFormSubmitted(false);
                setErrors({});
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-xl font-semibold mb-4">
              {editingRow ? "Edit Live Class" : "Add Live Class"}
            </h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              {/* Name */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full border rounded px-3 py-2 ${
                    shouldShowError("name") ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter full name"
                />
                {shouldShowError("name") && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Date */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className={`w-full border rounded px-3 py-2 ${
                    shouldShowError("date") ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {shouldShowError("date") && (
                  <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                )}
                {formData.date && (
                  <p className="text-xs text-gray-500 mt-1">
                    Display: {formatDisplayDate(formData.date)}
                  </p>
                )}
              </div>

              {/* Timing */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">
                  Timing <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.timing}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className={`w-full border rounded px-3 py-2 pr-10 ${
                      shouldShowError("timing") ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Select time"
                    readOnly
                    onClick={openTimePicker}
                  />
                  <button
                    type="button"
                    onClick={openTimePicker}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiClock />
                  </button>
                </div>
                {shouldShowError("timing") && (
                  <p className="text-red-500 text-xs mt-1">{errors.timing}</p>
                )}

                {/* Time Picker Dropdown */}
                {isTimePickerOpen && (
                  <div
                    ref={timePickerRef}
                    className="absolute z-50 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg"
                  >
                    <div className="p-4">
                      {/* Quick Time Selection */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2 text-gray-700">Quick Select</h4>
                        <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                          {quickTimes.map((time, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => selectTime(time.hour, time.minute, time.period)}
                              className="text-xs py-2 px-1 border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-300 transition"
                            >
                              {time.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Time Selection */}
                      <div className="grid grid-cols-3 gap-3">
                        {/* Hours */}
                        <div>
                          <label className="block text-xs font-medium mb-1 text-gray-700">Hour</label>
                          <div className="border rounded-md max-h-32 overflow-y-auto">
                            {hours.map((hour) => (
                              <button
                                key={hour}
                                type="button"
                                onClick={() => setTimePicker(prev => ({ ...prev, hour }))}
                                className={`w-full py-1 text-xs border-b border-gray-100 hover:bg-gray-50 ${
                                  timePicker.hour === hour ? 'bg-blue-100 text-blue-700' : ''
                                }`}
                              >
                                {hour}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Minutes */}
                        <div>
                          <label className="block text-xs font-medium mb-1 text-gray-700">Minute</label>
                          <div className="border rounded-md max-h-32 overflow-y-auto">
                            {minutes.map((minute) => (
                              <button
                                key={minute}
                                type="button"
                                onClick={() => setTimePicker(prev => ({ ...prev, minute }))}
                                className={`w-full py-1 text-xs border-b border-gray-100 hover:bg-gray-50 ${
                                  timePicker.minute === minute ? 'bg-blue-100 text-blue-700' : ''
                                }`}
                              >
                                {minute.toString().padStart(2, '0')}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* AM/PM */}
                        <div>
                          <label className="block text-xs font-medium mb-1 text-gray-700">Period</label>
                          <div className="border rounded-md">
                            {periods.map((period) => (
                              <button
                                key={period}
                                type="button"
                                onClick={() => setTimePicker(prev => ({ ...prev, period }))}
                                className={`w-full py-2 text-xs border-b border-gray-100 hover:bg-gray-50 ${
                                  timePicker.period === period ? 'bg-blue-100 text-blue-700' : ''
                                }`}
                              >
                                {period}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Selected Time Display and Apply Button */}
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              Selected: {timePicker.hour}:{timePicker.minute.toString().padStart(2, '0')} {timePicker.period}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setIsTimePickerOpen(false)}
                              className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => selectTime(timePicker.hour, timePicker.minute, timePicker.period)}
                              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Trainer */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">
                  Trainer <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.trainer}
                  onChange={(e) => handleInputChange("trainer", e.target.value)}
                  className={`w-full border rounded px-3 py-2 ${
                    shouldShowError("trainer") ? "border-red-500" : "border-gray-300"
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
                {shouldShowError("trainer") && (
                  <p className="text-red-500 text-xs mt-1">{errors.trainer}</p>
                )}
              </div>

              {/* Email */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full border rounded px-3 py-2 ${
                    shouldShowError("email") ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="example@email.com"
                />
                {shouldShowError("email") && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Mobile */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">Mobile</label>
                <input
                  type="text"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange("mobile", e.target.value)}
                  className={`w-full border rounded px-3 py-2 ${
                    shouldShowError("mobile") ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                />
                {shouldShowError("mobile") && (
                  <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
                )}
              </div>

              {/* Counselor */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">Counselor</label>
                <input
                  type="text"
                  value={formData.counselor}
                  onChange={(e) => handleInputChange("counselor", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Counselor name"
                />
              </div>

              {/* Status */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Status</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Counselor Remark */}
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Counselor Remark</label>
                <textarea
                  value={formData.counselorRemark}
                  onChange={(e) => handleInputChange("counselorRemark", e.target.value)}
                  className={`w-full border rounded px-3 py-2 ${
                    shouldShowError("counselorRemark") ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter counselor remarks (max 200 characters)"
                  rows="2"
                  maxLength="200"
                />
                {shouldShowError("counselorRemark") && (
                  <p className="text-red-500 text-xs mt-1">{errors.counselorRemark}</p>
                )}
                <div className="text-xs text-gray-500 text-right mt-1">
                  {formData.counselorRemark.length}/200
                </div>
              </div>

              {/* Trainer Reply */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">Trainer Reply</label>
                <input
                  type="text"
                  value={formData.trainerReply}
                  onChange={(e) => handleInputChange("trainerReply", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Trainer response"
                />
              </div>

              {/* Add Remark */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">Add Remark</label>
                <input
                  type="text"
                  value={formData.addRemark}
                  onChange={(e) => handleInputChange("addRemark", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional remarks"
                />
              </div>

              {/* Reason */}
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => handleInputChange("reason", e.target.value)}
                  className={`w-full border rounded px-3 py-2 ${
                    shouldShowError("reason") ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter reason (max 200 characters)"
                  rows="2"
                  maxLength="200"
                />
                {shouldShowError("reason") && (
                  <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
                )}
                <div className="text-xs text-gray-500 text-right mt-1">
                  {formData.reason.length}/200
                </div>
              </div>

              {/* Form Actions */}
              <div className="col-span-2 flex justify-end mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setFormSubmitted(false);
                    setErrors({});
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition mr-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
                >
                  {editingRow ? "Update Live Class" : "Create Live Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveClassDemo;