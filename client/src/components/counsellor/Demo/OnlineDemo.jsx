<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import {
  fetchOnlineDemos,
  addOnlineDemo,
  updateOnlineDemo,
  deleteOnlineDemo,
  setSearchQuery,
} from "../../../store/slices/onlineDemoSlice";
import { useDispatch, useSelector } from "react-redux";
import toast from 'react-hot-toast';
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
} from "react-icons/fi";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { useNavigate } from "react-router-dom";

const OnlineDemo = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { rows, searchQuery } = useSelector((state) => state.onlineDemo);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [errors, setErrors] = useState({});
  const [filterErrors, setFilterErrors] = useState({});

  const [formData, setFormData] = useState({
    course: "",
    date: "",
    time: "",
    mode: "",
    medium: "",
    trainer: "",
  });

  const [filterData, setFilterData] = useState({
    branch: "",
    trainer: "",
    mode: "",
    dateFrom: "",
    dateTo: "",
  });

  const defaultColumns = ["Course", "Date", "Timing", "Mode", "Medium", "Trainer"];
  const [visibleColumns, setVisibleColumns] = useState(defaultColumns);
  const [columnSearch, setColumnSearch] = useState("");

  useEffect(() => {
    dispatch(fetchOnlineDemos());
  }, [dispatch]);

  // Get unique values for dropdowns
  const uniqueBranches = [...new Set(rows.map(r => r.branch).filter(Boolean))];
  const uniqueTrainers = [...new Set(rows.map(r => r.trainer).filter(Boolean))];
  const uniqueModes = [...new Set(rows.map(r => r.mode).filter(Boolean))];

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

  // ✅ Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.course.trim()) newErrors.course = "Course name is required";
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

  // ✅ Add / Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingRow) {
      await dispatch(updateOnlineDemo({ id: editingRow._id, data: formData }));
      toast.success('Online demo updated successfully!');
    } else {
      await dispatch(addOnlineDemo(formData));
      toast.success('Online demo added successfully!');
    }

    setIsFormOpen(false);
    setEditingRow(null);
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
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this demo?")) {
      await dispatch(deleteOnlineDemo(id));
      dispatch(fetchOnlineDemos());
    }
  };

  // ✅ PDF Export instead of CSV
  const handleExport = () => {
    const doc = new jsPDF();
    doc.text("Online Demo Data", 14, 12);
    const tableData = filteredRows.map((r, i) => [
      i + 1,
      r.course,
      r.date ? new Date(r.date).toLocaleDateString("en-GB") : "",
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
      {/* ✅ Top Section */}
      <div className="bg-gray-100 px-6 py-3 flex justify-between items-center shadow-sm border-b">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <FiArrowLeft /> Go Back
        </button>
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 transition"
          title="Filter"
        >
          <FiFilter />
        </button>
      </div>

      {/* ✅ Title and Actions */}
      <div className="bg-gray-100 mt-4 mx-6 p-4 rounded-lg shadow-sm">
        <div className="flex flex-wrap justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-gray-800">Online Demo</h2>
          <button
            onClick={() => {
              setIsFormOpen(true);
              setEditingRow(null);
              setFormData({
                course: "",
                date: "",
                time: "",
                mode: "",
                medium: "",
                trainer: "",
              });
              setErrors({});
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition shadow"
          >
            <FiPlus /> Add Online Demo
          </button>
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
                <div className="flex gap-2 mb-2">
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
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
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
              onClick={() => dispatch(fetchOnlineDemos())}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-200 text-gray-700 transition"
              title="Reload"
            >
              <FiRefreshCw />
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-200 text-gray-700 transition"
            >
              <FiDownload /> Export PDF
            </button>
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
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row, index) => (
                  <tr key={row._id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-2 border-r">{index + 1}</td>
                    {visibleColumns.includes("Course") && (
                      <td className="px-4 py-2 border-r">{row.course}</td>
                    )}
                    {visibleColumns.includes("Date") && (
                      <td className="px-4 py-2 border-r">{formatDate(row.date)}</td>
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
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        onClick={() => {
                          setEditingRow(row);
                          setFormData({ ...row });
                          setErrors({});
                          setIsFormOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(row._id)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={visibleColumns.length + 2}
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

      {/* ✅ Modal Form (2-column layout) */}
      {isFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 relative border border-gray-200">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <FiX />
            </button>

            <h3 className="text-lg font-semibold mb-3 text-center text-gray-800">
              {editingRow ? "Edit Online Demo" : "Add Online Demo"}
            </h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              {/* Course */}
              <div>
                <label className="text-sm font-medium text-gray-700">Course</label>
                <input
                  type="text"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {errors.course && <p className="text-red-500 text-xs mt-1">{errors.course}</p>}
              </div>

              {/* Date */}
              <div>
                <label className="text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
              </div>

              {/* Time */}
              <div>
                <label className="text-sm font-medium text-gray-700">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
              </div>

              {/* Medium */}
              <div>
                <label className="text-sm font-medium text-gray-700">Medium</label>
                <input
                  type="text"
                  value={formData.medium}
                  onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                  className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {errors.medium && <p className="text-red-500 text-xs mt-1">{errors.medium}</p>}
              </div>

              {/* Trainer */}
              <div>
                <label className="text-sm font-medium text-gray-700">Trainer</label>
                <input
                  type="text"
                  value={formData.trainer}
                  onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
                  className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {errors.trainer && <p className="text-red-500 text-xs mt-1">{errors.trainer}</p>}
              </div>

              {/* Mode */}
              <div>
                <label className="text-sm font-medium text-gray-700">Mode</label>
                <select
                  value={formData.mode}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                  className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select Mode</option>
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                </select>
                {errors.mode && <p className="text-red-500 text-xs mt-1">{errors.mode}</p>}
              </div>

              {/* Buttons */}
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

      {/* ✅ Filter Modal */}
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
              Filter Online Demos
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setFilterErrors({});
                setIsFilterOpen(false);
              }}
              className="space-y-4"
            >
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
                  type="button"
                  onClick={() => {
                    setFilterData({
                      branch: "",
                      trainer: "",
                      mode: "",
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
=======
import React from 'react';

const OnlineDemo = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">OnlineDemo</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p>OnlineDemo content will be displayed here.</p>
        {/* Add your component logic and JSX here */}
      </div>
>>>>>>> 796f7396510349a3599e146e7987a6e0c9dcc0ef
    </div>
  );
};

export default OnlineDemo;
