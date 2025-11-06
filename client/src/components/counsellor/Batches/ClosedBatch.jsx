import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBatches } from '../../../store/slices/batchSlice';

const ClosedBatch = () => {
  const dispatch = useDispatch();
  // Destructure state from the Redux store
  const { batches, loading, error } = useSelector((state) => state.batch);

  useEffect(() => {
    // Dispatch action to fetch batches filtered by status: 'Closed'
    dispatch(getBatches({ status: 'Closed' }));
  }, [dispatch]);

  // Memoize table rows for better performance
  const tableRows = useMemo(() => {
    return batches.map((batch, index) => (
      <tr
        key={batch._id}
        // Zebra striping and light indigo hover effect
        className={`transition duration-150 ease-in-out ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50`}
      >
        {/* Batch Name - Bold */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-semibold text-gray-900">{batch.name}</div>
        </td>
        {/* Description - Truncated, full text visible on hover */}
        <td className="px-6 py-4 max-w-[200px] truncate">
          <div className="text-sm text-gray-600" title={batch.description}>{batch.description || 'N/A'}</div>
        </td>
        {/* Course */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{batch.course || 'N/A'}</div>
        </td>
        {/* Trainer */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{batch.trainer || 'N/A'}</div>
        </td>
        {/* Branch */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{batch.branch || 'N/A'}</div>
        </td>
        {/* Class Room */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{batch.classRoom || 'N/A'}</div>
        </td>
        {/* Code - Monospaced Font (Indigo color) */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-mono text-indigo-700">{batch.code || 'N/A'}</div>
        </td>
        {/* Timing */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{batch.timing || 'N/A'}</div>
        </td>
        {/* Mode */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{batch.mode || 'N/A'}</div>
        </td>
        {/* Country */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{batch.country || 'N/A'}</div>
        </td>
        {/* Batch Type */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{batch.batchType || 'N/A'}</div>
        </td>
        {/* Students - Highlighted (Indigo color) */}
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <div className="text-sm font-bold text-indigo-600">{batch.studentsActive || 0}</div>
        </td>
        {/* Batch Days */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{batch.batchDays || 'N/A'}</div>
        </td>
        {/* Start Date */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-600">
            {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : 'N/A'}
          </div>
        </td>
        {/* End Date */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-600">
            {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : 'N/A'}
          </div>
        </td>
        {/* Completion Date - Emphasized */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-semibold text-green-700">
            {batch.completionDate ? new Date(batch.completionDate).toLocaleDateString() : 'N/A'}
          </div>
        </td>
        {/* Merging Status */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{batch.mergingStatus || 'N/A'}</div>
        </td>
        {/* Merging Till */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-600">
            {batch.mergingTill ? new Date(batch.mergingTill).toLocaleDateString() : 'N/A'}
          </div>
        </td>
        {/* Batch Exten Approval */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{batch.batchExtenApproval || 'N/A'}</div>
        </td>
        {/* Approval Status */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{batch.approvalStatus || 'N/A'}</div>
        </td>
        {/* Status Badge */}
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="inline-flex items-center px-3 py-1 text-xs font-bold leading-5 rounded-full bg-green-100 text-green-800 border border-green-300">
            <span className="w-2 h-2 mr-2 bg-green-500 rounded-full"></span>
            Closed
          </span>
        </td>
      </tr>
    ));
  }, [batches]);

  // --- Loading State UI ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center">
          {/* Indigo themed loading spinner */}
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          <p className="mt-4 text-lg text-gray-600">Loading closed batches...</p>
        </div>
      </div>
    );
  }

  // --- Error State UI ---
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mx-6 my-4 shadow-sm" role="alert">
        <p className="font-bold">🚨 Data Fetch Error</p>
        <p>Could not load Closed batches. Please check the network or try again. Details: **{error}**</p>
      </div>
    );
  }

  // --- Main Content UI ---
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Page Header: Indigo themed and visually strong */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 border-b-4 border-indigo-600 pb-2 inline-block">
        <span className="mr-3 text-indigo-600">✅</span> Completed Batches
      </h1>

      {batches.length === 0 ? (
        // --- Empty State UI (Professional Look) ---
        <div className="text-center bg-white p-16 rounded-xl shadow-lg border border-gray-200 mt-8">
          <div className="text-8xl mb-4 text-gray-400">📦</div>
          <p className="text-2xl font-semibold text-gray-700">No Closed Batches Found</p>
          <p className="mt-2 text-gray-500">There are no completed or closed batches to display at this time.</p>
        </div>
      ) : (
        // --- Batches Table UI (Enhanced Professional Look with Horizontal Scroll Fix) ---
        <div className="mt-8">
          {/* Table Container: overflow-x-auto ensures horizontal scrolling is contained here */}
          <div className="overflow-x-auto shadow-2xl rounded-xl border border-gray-200">
            {/* IMPORTANT: min-w-max allows the table to be as wide as its content, enabling the container scroll */}
            <table className="min-w-max divide-y divide-gray-200">
              {/* Table Header: Deep Indigo background for theme matching */}
              <thead className="bg-indigo-700 sticky top-0 z-10">
                <tr>
                  {[
                    'Batch Name', 'Description', 'Course', 'Trainer', 'Branch',
                    'Class Room', 'Code', 'Timing', 'Mode', 'Country',
                    'Batch Type', 'Students', 'Batch Days', 'Start Date', 'End Date',
                    'Completion Date', 'Merging Status', 'Merging Till',
                    'Exten Approval', 'Approval Status', 'Status'
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {tableRows}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClosedBatch;
