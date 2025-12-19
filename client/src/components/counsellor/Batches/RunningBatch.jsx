import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBatches } from '../../../store/slices/batchSlice';

const RunningBatch = () => {
  const dispatch = useDispatch();
  const { batches = [], loading, error } = useSelector((state) => state.batch || {});

  useEffect(() => {
    dispatch(getBatches({ status: 'Running' }));
  }, [dispatch]);

  const tableRows = useMemo(() => {
    return (batches || []).map((batch, index) => (
      <tr
        key={batch._id || index}
        className={`transition duration-150 ease-in-out ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50`}
      >
        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
          {batch.name || 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {batch.course || 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {batch.trainer || 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {batch.branch || 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {batch.code || 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {batch.timing || 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {batch.mode || 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {batch.classRoom || 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-700">
          {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
          {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600 text-center">
          {batch.enrolledCount ?? batch.studentsActive ?? 0}
        </td>
      </tr>
    ));
  }, [batches]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          <p className="mt-4 text-lg text-gray-600">Loading running batches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mx-6 my-4 shadow-sm" role="alert">
        <p className="font-bold">🚨 Data Fetch Error</p>
        <p>Could not load Running batches. Please check the network or try again. Details: {String(error)}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 border-b-4 border-blue-600 pb-2 inline-block">
        <span className="mr-3 text-blue-600">🚀</span> Running Batches
      </h1>

      {batches.length === 0 ? (
        <div className="text-center bg-white p-16 rounded-xl shadow-lg border border-gray-200 mt-8">
          <div className="text-8xl mb-4 text-gray-400">🏃</div>
          <p className="text-2xl font-semibold text-gray-700">No Running Batches Found</p>
          <p className="mt-2 text-gray-500">There are no batches currently running.</p>
        </div>
      ) : (
        <div className="mt-8">
          <div className="overflow-x-auto shadow-2xl rounded-xl border border-gray-200">
            <table className="min-w-max divide-y divide-gray-200 w-full">
              <thead className="bg-blue-600 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Trainer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Timing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Mode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Class Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">
                    Total
                  </th>
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

export default RunningBatch;
