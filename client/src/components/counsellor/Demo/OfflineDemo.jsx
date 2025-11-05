import React, { useEffect, useState } from "react";
import {
  fetchOfflineDemos,
  addOfflineDemo,
  updateOfflineDemo,
  deleteOfflineDemo,
  setSearchQuery,
} from "../../../store/slices/offlineDemoSlice";
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
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

const OfflineDemo = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { rows, searchQuery } = useSelector((state) => state.offlineDemo);
  const { user } = useSelector((state) => state.auth); // Get user from auth state

  // Role checks
  const isAdmin = user?.role === 'Admin';
  const isCounsellor = user?.role === 'Counsellor';

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [errors, setErrors] = useState({});
  const [filterErrors, setFilterErrors] = useState({});

  const defaultColumns = [
    "Course",
    "Branch",
    "Date",
    "Timing",
    "Mode",
    "Medium",
    "Trainer",
  ];

  const [visibleColumns, setVisibleColumns] = useState(defaultColumns);
  const [columnSearch, setColumnSearch] = useState("");

  const [formData, setFormData] = useState({
    course: "",
    branch: "",
    date: "",
    time: "",
    medium: "",
    trainer: "",
    mode: "",
  });

  const [filterData, setFilterData] = useState({
    branch: "",
    trainer: "",
    mode: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    dispatch(fetchOfflineDemos());
  }, [dispatch]);

  // Get unique values for dropdowns
  const uniqueBranches = [...new Set(rows.map(r => r.branch).filter(Boolean))];
  const uniqueTrainers = [...new Set(rows.map(r => r.trainer).filter(Boolean))];
  const uniqueModes = [...new Set(rows.map(r => r.mode).filter(Boolean))];

  const filteredRows = rows.filter((r) => {
    const matchesSearch =
      r.course?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.trainer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.branch?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBranch = !filterData.branch || r.branch === filterData.branch;
    const matchesTrainer = !filterData.trainer || r.trainer === filterData.trainer;
    const matchesMode = !filterData.mode || r.mode === filterData.mode;
    const matchesDateFrom = !filterData.dateFrom || new Date(r.date) >= new Date(filterData.dateFrom);
    const matchesDateTo = !filterData.dateTo || new Date(r.date) <= new Date(filterData.dateTo);

    return matchesSearch && matchesBranch && matchesTrainer && matchesMode && matchesDateFrom && matchesDateTo;
  });

  // ✅ Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.course.trim()) newErrors.course = "Course name is required";
    if (!formData.branch.trim()) newErrors.branch = "Branch is required";
    if (!formData.date) newErrors.date = "Please select a date";
    else if (new Date(formData.date) < new Date().setHours(0, 0, 0, 0))
      newErrors.date = "Date cannot be in the past";
    if (!formData.time.trim()) newErrors.time = "Timing is required";
    if (!formData.mode) newErrors.mode = "Please select mode";
    if (!formData.medium.trim()) newErrors.medium = "Medium is required";
    if (!formData.trainer.trim()) newErrors.trainer = "Trainer name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Add / Update - Only for Counsellors
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingRow)
      await dispatch(updateOfflineDemo({ id: editingRow._id, data: formData }));
    else await dispatch(addOfflineDemo(formData));

    setIsFormOpen(false);
    setEditingRow(null);
    setFormData({
      course: "",
      branch: "",
      date: "",
      time: "",
      medium: "",
      trainer: "",
      mode: "",
    });
    setErrors({});
    dispatch(fetchOfflineDemos());
  };

  const handleFilterApply = () => {
    setIsFilterOpen(false);
  };

  const handleFilterClear = () => {
    setFilterData({
      branch: "",
      trainer: "",
      mode: "",
      dateFrom: "",
      dateTo: "",
    });
    setIsFilterOpen(false);
  };

  // ✅ Delete - Only for Counsellors
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this demo?")) {
      await dispatch(deleteOfflineDemo(id));
      dispatch(fetchOfflineDemos());
    }
  };

  // ✅ Export to PDF instead of CSV - Available for both roles
  const handleExport = () => {
    const doc = new jsPDF();
    doc.text("Offline Demo Data", 14, 15);

    const tableColumn = ["S.No", ...defaultColumns];
    const tableRows = filteredRows.map((r, i) => [
      i + 1,
      r.course,
      r.branch,
      formatDate(r.date),
      r.time,
      r.mode,
      r.medium,
      r.trainer,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save("OfflineDemoData.pdf");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB");
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

  return (
    <div className="min-h-screen bg-white relative">
      {/* ✅ Top Section with Role Badge */}
      <div className="bg-gray-100 px-6 py-3 flex justify-between items-center shadow-sm border-b">
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
              : 'bg-green-100 text-green-800 border border-green-300'
          }`}>
            {isAdmin ? '👨‍💻 Admin View' : '💼 Counsellor'}
          </span>

          {/* Filter Button - Available for both roles */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 transition"
            title="Filter"
          >
            <FiFilter />
          </button>

          {/* Export PDF Button - Available for both roles */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 transition"
            title="Export PDF"
          >
            <FiDownload />
          </button>
        </div>
      </div>

      {/* ✅ Title and Actions */}
      <div className="bg-gray-100 mt-4 mx-6 p-4 rounded-lg shadow-sm">
        <div className="flex flex-wrap justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-gray-800">
            Offline Demo {isAdmin && <span className="text-sm text-gray-600 ml-2">(View Only)</span>}
          </h2>
          
          {/* Add Button - Only for Counsellors */}
          {isCounsellor && (
            <button
              onClick={() => {
                setIsFormOpen(true);
                setEditingRow(null);
                setFormData({
                  course: "",
                  branch: "",
                  date: "",
                  time: "",
                  medium: "",
                  trainer: "",
                  mode: "",
                });
                setErrors({});
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition shadow"
            >
              <FiPlus /> Add Offline Demo
            </button>
          )}
        </div>

        {/* Columns + Search/Reload/Export */}
        <div className="flex justify-between items-center gap-3 flex-wrap">
          <div className="relative">
            <button
              onClick={() => setIsColumnsOpen(!isColumnsOpen)}
              className="flex items-center gap-2 border border-blue-500 text-blue-600 px-3 py-2 rounded-md hover:bg-blue-50 transition text-sm"
            >
              <FiColumns /> Columns{" "}
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                {visibleColumns.length}/{defaultColumns.length}
              </span>
            </button>

            {isColumnsOpen && (
              <div className="absolute top-11 left-0 bg-white border shadow-lg rounded-md w-72 p-3 z-50">
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
                    onClick={() => setVisibleColumns(defaultColumns)}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isCounsellor && (
              <>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                    className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-64 focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <button
                  onClick={() => dispatch(fetchOfflineDemos())}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  <FiRefreshCw />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Table */}
      <div className="px-6 py-6">
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700 border-b">
              <tr>
                <th className="px-4 py-3 border-r font-medium">S.No</th>
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
                filteredRows.map((row, index) => (
                  <tr
                    key={row._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-2 border-r">{index + 1}</td>
                    {visibleColumns.includes("Course") && (
                      <td className="px-4 py-2 border-r">{row.course}</td>
                    )}
                    {visibleColumns.includes("Branch") && (
                      <td className="px-4 py-2 border-r">{row.branch}</td>
                    )}
                    {visibleColumns.includes("Date") && (
                      <td className="px-4 py-2 border-r">
                        {formatDate(row.date)}
                      </td>
                    )}
                    {visibleColumns.includes("Timing") && (
                      <td className="px-4 py-2 border-r">{row.time}</td>
                    )}
                    {visibleColumns.includes("Mode") && (
                      <td className="px-4 py-2 border-r">{row.mode}</td>
                    )}
                    {visibleColumns.includes("Medium") && (
                      <td className="px-4 py-2 border-r">{row.medium}</td>
                    )}
                    {visibleColumns.includes("Trainer") && (
                      <td className="px-4 py-2 border-r">{row.trainer}</td>
                    )}
                    
                    {/* Actions - Only for Counsellors */}
                    {isCounsellor && (
                      <td className="px-4 py-2 flex gap-2">
                        <button
                          onClick={() => {
                            setEditingRow(row);
                            setFormData({ ...row });
                            setErrors({});
                            setIsFormOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="Edit"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(row._id)}
                          className="text-red-500 hover:text-red-700 transition"
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

      {/* ✅ Filter Modal - AVAILABLE FOR BOTH ROLES */}
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
              Filter Offline Demos
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium">Branch</label>
                <select
                  value={filterData.branch}
                  onChange={(e) =>
                    setFilterData({ ...filterData, branch: e.target.value })
                  }
                  className="border rounded px-3 py-2 text-sm w-full"
                >
                  <option value="">All Branches</option>
                  {uniqueBranches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Trainer</label>
                <select
                  value={filterData.trainer}
                  onChange={(e) =>
                    setFilterData({ ...filterData, trainer: e.target.value })
                  }
                  className="border rounded px-3 py-2 text-sm w-full"
                >
                  <option value="">All Trainers</option>
                  {uniqueTrainers.map((trainer) => (
                    <option key={trainer} value={trainer}>
                      {trainer}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Mode</label>
                <select
                  value={filterData.mode}
                  onChange={(e) =>
                    setFilterData({ ...filterData, mode: e.target.value })
                  }
                  className="border rounded px-3 py-2 text-sm w-full"
                >
                  <option value="">All Modes</option>
                  {uniqueModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Date From</label>
                  <input
                    type="date"
                    value={filterData.dateFrom}
                    onChange={(e) =>
                      setFilterData({ ...filterData, dateFrom: e.target.value })
                    }
                    className="border rounded px-3 py-2 text-sm w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Date To</label>
                  <input
                    type="date"
                    value={filterData.dateTo}
                    onChange={(e) =>
                      setFilterData({ ...filterData, dateTo: e.target.value })
                    }
                    className="border rounded px-3 py-2 text-sm w-full"
                  />
                </div>
              </div>

              {/* Apply + Clear */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleFilterClear}
                  className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100 text-sm"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleFilterApply}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal Form - ONLY FOR COUNSELLORS */}
      {isFormOpen && isCounsellor && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 relative border border-gray-200">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <FiX />
            </button>

            <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
              {editingRow ? "Edit Offline Demo" : "Add Offline Demo"}
            </h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Course *</label>
                <input
                  type="text"
                  placeholder="Enter course name"
                  value={formData.course}
                  onChange={(e) =>
                    setFormData({ ...formData, course: e.target.value })
                  }
                  className="border rounded px-3 py-2 text-sm w-full"
                  required
                />
                {errors.course && <p className="text-red-500 text-xs mt-1">{errors.course}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Branch *</label>
                <input
                  type="text"
                  placeholder="Enter branch"
                  value={formData.branch}
                  onChange={(e) =>
                    setFormData({ ...formData, branch: e.target.value })
                  }
                  className="border rounded px-3 py-2 text-sm w-full"
                  required
                />
                {errors.branch && <p className="text-red-500 text-xs mt-1">{errors.branch}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="border rounded px-3 py-2 text-sm w-full"
                  required
                />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Time *</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  className="border rounded px-3 py-2 text-sm w-full"
                  required
                />
                {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Medium *</label>
                <input
                  type="text"
                  placeholder="Enter medium"
                  value={formData.medium}
                  onChange={(e) =>
                    setFormData({ ...formData, medium: e.target.value })
                  }
                  className="border rounded px-3 py-2 text-sm w-full"
                  required
                />
                {errors.medium && <p className="text-red-500 text-xs mt-1">{errors.medium}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Trainer *</label>
                <input
                  type="text"
                  placeholder="Enter trainer name"
                  value={formData.trainer}
                  onChange={(e) =>
                    setFormData({ ...formData, trainer: e.target.value })
                  }
                  className="border rounded px-3 py-2 text-sm w-full"
                  required
                />
                {errors.trainer && <p className="text-red-500 text-xs mt-1">{errors.trainer}</p>}
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Mode *</label>
                <select
                  value={formData.mode}
                  onChange={(e) =>
                    setFormData({ ...formData, mode: e.target.value })
                  }
                  className="border rounded px-3 py-2 text-sm w-full"
                  required
                >
                  <option value="">Select Mode</option>
                  <option value="Offline">Offline</option>
                  <option value="Online">Online</option>
                </select>
                {errors.mode && <p className="text-red-500 text-xs mt-1">{errors.mode}</p>}
              </div>

              {/* Submit + Cancel */}
              <div className="col-span-2 flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  {editingRow ? "Update" : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineDemo;