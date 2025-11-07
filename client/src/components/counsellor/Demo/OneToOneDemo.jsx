import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOneToOneDemos,
  addOneToOneDemo,
  updateOneToOneDemo,
  deleteOneToOneDemo,
  setSearchQuery,
} from "../../../store/slices/oneToOneSlice";
import { getTrainers } from "../../../store/slices/trainerSlice"; // Import getTrainers
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
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

const OneToOneDemo = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { rows, searchQuery } = useSelector((state) => state.oneToOne);
  const { user } = useSelector((state) => state.auth); // Get user from auth state
  const { trainers } = useSelector((state) => state.trainer); // Get trainers from trainer state

  // Role checks
  const isAdmin = user?.role === 'Admin';
  const isCounsellor = user?.role === 'Counsellor';

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const dropdownRef = useRef(null);

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

  useEffect(() => {
    dispatch(fetchOneToOneDemos());
    dispatch(getTrainers()); // Fetch trainers when component mounts
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
  const uniqueStatuses = [...new Set(rows.map(r => r.status).filter(Boolean))];
  const uniqueTrainers = [...new Set(rows.map(r => r.trainer).filter(Boolean))];

  // Filter active trainers for dropdown
  const activeTrainers = trainers.filter(trainer => trainer.status === 'Active');

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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.timing) newErrors.timing = "Timing is required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (formData.mobile && !/^[0-9]{10}$/.test(formData.mobile))
      newErrors.mobile = "Mobile number must be 10 digits";
    if (!formData.trainer.trim()) newErrors.trainer = "Please select a trainer";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Add / Update - Only for Counsellors
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingRow) {
      await dispatch(updateOneToOneDemo({ id: editingRow._id, data: formData }));
    } else {
      await dispatch(addOneToOneDemo(formData));
    }

    setIsFormOpen(false);
    setEditingRow(null);
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
    dispatch(fetchOneToOneDemos());
  };

  // ✅ Delete - Only for Counsellors
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this demo?")) {
      await dispatch(deleteOneToOneDemo(id));
      dispatch(fetchOneToOneDemos());
    }
  };

  // ✅ PDF Export - Available for both roles
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
            return r.date ? new Date(r.date).toLocaleDateString("en-GB") : "";
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

  const formatDate = (d) => (!d ? "" : new Date(d).toLocaleDateString("en-GB"));
  const toggleColumn = (col) =>
    setVisibleColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  const filteredColumns = defaultColumns.filter((c) =>
    c.toLowerCase().includes(columnSearch.toLowerCase())
  );

  const openCreateForm = () => {
    setEditingRow(null);
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

  return (
    <div className="min-h-screen bg-white">
      {/* ✅ Top Bar with Role Badge */}
      <div className="flex justify-between items-center bg-gray-100 px-6 py-3 border-b">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition"
        >
          <FiArrowLeft /> Go Back
        </button>
        
        <div className="flex items-center gap-4">
          {/* Role Badge */}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isAdmin
              ? 'bg-purple-100 text-purple-800 border border-purple-300'
              : 'bg-green-100 text-green-800 border border-green-300'
          }`}>
            {isAdmin ? '👨‍💻 Admin View' : '💼 Counsellor'}
          </span>

          {/* Filter Button - Available for both roles */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 transition"
            title="Filter"
          >
            <FiFilter />
          </button>

          {/* PDF Export Button - Available for both roles */}
          <button
            onClick={handlePDFExport}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 transition"
            title="Export PDF"
          >
            <FiDownload />
          </button>
        </div>
      </div>

      {/* ✅ Title Section */}
      <div className="mx-6 mt-6 bg-gray-50 p-5 rounded-lg shadow-sm border relative">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-gray-800">
            1-1 Demo {isAdmin && <span className="text-sm text-gray-600 ml-2">(View Only)</span>}
          </h2>
          
          {/* Add Button - Only for Counsellors */}
          {isCounsellor && (
            <button
              onClick={openCreateForm}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              <FiPlus /> Add 1-1 Demo
            </button>
          )}
        </div>

        {/* Columns and Action Buttons in same line */}
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

          {/* Search, Reload, and Export PDF - Only for Counsellors */}
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
                  dispatch(fetchOneToOneDemos());
                  dispatch(getTrainers()); // Refresh trainers on reload
                }}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                <FiRefreshCw />
              </button>
              
            </div>
          )}
        </div>
      </div>

      {/* ✅ Table */}
      <div className="px-6 py-6">
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-auto max-h-96">
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
                {/* Show Actions column only for Counsellors */}
                {isCounsellor && (
                  <th className="px-4 py-3 font-medium">Actions</th>
                )}
                {/* Show View column for Admin */}
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
                    {visibleColumns.includes("Timing") && <td className="px-4 py-2 border-r">{row.timing}</td>}
                    {visibleColumns.includes("Email") && <td className="px-4 py-2 border-r">{row.email}</td>}
                    {visibleColumns.includes("Mobile") && <td className="px-4 py-2 border-r">{row.mobile}</td>}
                    {visibleColumns.includes("Trainer") && <td className="px-4 py-2 border-r">{row.trainer}</td>}
                    {visibleColumns.includes("Counselor") && <td className="px-4 py-2 border-r">{row.counselor}</td>}
                    {visibleColumns.includes("Counselor Remark") && <td className="px-4 py-2 border-r">{row.counselorRemark}</td>}
                    {visibleColumns.includes("Trainer Reply") && <td className="px-4 py-2 border-r">{row.trainerReply}</td>}
                    {visibleColumns.includes("Add Remark") && <td className="px-4 py-2 border-r">{row.addRemark}</td>}
                    {visibleColumns.includes("Status") && <td className="px-4 py-2 border-r">{row.status}</td>}
                    {visibleColumns.includes("Reason") && <td className="px-4 py-2 border-r">{row.reason}</td>}
                    
                    {/* Actions - Only for Counsellors */}
                    {isCounsellor && (
                      <td className="px-4 py-2 flex gap-2">
                        <button
                          onClick={() => {
                            setEditingRow(row);
                            setFormData({
                              ...row,
                              date: row.date ? row.date.split("T")[0] : "",
                            });
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
                    
                    {/* View-only indicator for Admin */}
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

      {/* ✅ Modal Form - ONLY FOR COUNSELLORS */}
      {isFormOpen && isCounsellor && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[800px] max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-xl font-semibold mb-4">
              {editingRow ? "Edit 1-1 Demo" : "Add 1-1 Demo"}
            </h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              {[
                { label: "Name", name: "name", type: "text" },
                { label: "Date", name: "date", type: "date" },
                { label: "Timing", name: "timing", type: "time" },
                { label: "Email", name: "email", type: "email" },
                { label: "Mobile", name: "mobile", type: "text" },
                { label: "Counselor", name: "counselor", type: "text" },
                { label: "Counselor Remark", name: "counselorRemark", type: "text" },
                { label: "Trainer Reply", name: "trainerReply", type: "text" },
                { label: "Add Remark", name: "addRemark", type: "text" },
                { label: "Status", name: "status", type: "select" },
                { label: "Reason", name: "reason", type: "text" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium mb-1">{field.label}</label>
                  {field.type === "select" ? (
                    <select
                      name={field.name}
                      value={formData[field.name]}
                      onChange={(e) =>
                        setFormData({ ...formData, [field.name]: e.target.value })
                      }
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">Select</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={(e) =>
                        setFormData({ ...formData, [field.name]: e.target.value })
                      }
                      className="w-full border rounded px-3 py-2"
                    />
                  )}
                  {errors[field.name] && (
                    <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
                  )}
                </div>
              ))}

              {/* Trainer - Updated to dropdown */}
              <div>
                <label className="block text-sm font-medium mb-1">Trainer *</label>
                <select
                  name="trainer"
                  value={formData.trainer}
                  onChange={(e) =>
                    setFormData({ ...formData, trainer: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
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
                {errors.trainer && (
                  <p className="text-red-500 text-xs mt-1">{errors.trainer}</p>
                )}
              </div>

              <div className="col-span-2 flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border rounded-md mr-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  {editingRow ? "Update" : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Filter Modal - Available for both roles */}
      {isFilterOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative border border-gray-200">
            <button
              onClick={() => setIsFilterOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <FiX />
            </button>

            <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
              Filter 1-1 Demos
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setFilterErrors({});
                setIsFilterOpen(false);
              }}
              className="space-y-4"
            >
              {/* Status */}
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select
                  value={filterData.status}
                  onChange={(e) => setFilterData({ ...filterData, status: e.target.value })}
                  className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Statuses</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
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
                  type="button"
                  onClick={() => {
                    setFilterData({
                      status: "",
                      trainer: "",
                      dateFrom: "",
                      dateTo: "",
                    });
                    setFilterErrors({});
                  }}
                  className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100 text-sm"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OneToOneDemo;