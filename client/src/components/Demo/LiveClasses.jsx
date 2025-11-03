import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLiveClasses,
  addLiveClass,
  updateLiveClass,
  deleteLiveClass,
  setSearchQuery,
} from "../../features/liveClasses/liveClassesSlice";
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
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

const LiveClasses = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { rows, searchQuery } = useSelector((state) => state.liveClasses);

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
  const [filterStatus, setFilterStatus] = useState("");

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
    dispatch(fetchLiveClasses());
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

  const filteredRows = rows.filter((r) => {
    const matchSearch = !searchQuery
      ? true
      : Object.values(r).join(" ").toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = !filterStatus ? true : r.status === filterStatus;
    return matchSearch && matchFilter;
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingRow) {
      await dispatch(updateLiveClass({ id: editingRow._id, data: formData }));
    } else {
      await dispatch(addLiveClass(formData));
    }

    setIsFormOpen(false);
    setEditingRow(null);
    dispatch(fetchLiveClasses());
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this live class?")) {
      await dispatch(deleteLiveClass(id));
      dispatch(fetchLiveClasses());
    }
  };

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
    doc.save("LiveClasses.pdf");
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
      {/* Top Bar */}
      <div className="flex justify-between items-center bg-gray-100 px-6 py-3 border-b">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition"
        >
          <FiArrowLeft /> Go Back
        </button>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
          title="Filter"
        >
          <FiFilter />
        </button>
      </div>

      {/* Title Section */}
      <div className="mx-6 mt-6 bg-gray-50 p-5 rounded-lg shadow-sm border relative">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-gray-800">Live Classes</h2>
          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            <FiPlus /> Add Live Class
          </button>
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
                <div className="flex justify-between mt-3">
                  <button
                    onClick={() => setVisibleColumns(defaultColumns)}
                    className="bg-green-500 text-white text-sm px-3 py-1 rounded-md"
                  >
                    Show All
                  </button>
                  <button
                    onClick={() => setVisibleColumns([])}
                    className="bg-red-500 text-white text-sm px-3 py-1 rounded-md"
                  >
                    Hide All
                  </button>
                  <button
                    onClick={() => {
                      setVisibleColumns(defaultColumns);
                      setColumnSearch("");
                    }}
                    className="bg-blue-500 text-white text-sm px-3 py-1 rounded-md"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>

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
              onClick={() => dispatch(fetchLiveClasses())}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              <FiRefreshCw />
            </button>
            <button
              onClick={handlePDFExport}
              className="flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-200 text-gray-700 transition"
            >
              <FiDownload /> Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[800px] max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-xl font-semibold mb-4">
              {editingRow ? "Edit Live Class" : "Add Live Class"}
            </h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              {[
                { label: "Name", name: "name", type: "text" },
                { label: "Date", name: "date", type: "date" },
                { label: "Timing", name: "timing", type: "time" },
                { label: "Email", name: "email", type: "email" },
                { label: "Mobile", name: "mobile", type: "text" },
                { label: "Trainer", name: "trainer", type: "text" },
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
                <th className="px-4 py-3 font-medium">Actions</th>
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
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(row._id)}
                        className="text-red-500 hover:text-red-700"
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
    </div>
  );
};

export default LiveClasses;
