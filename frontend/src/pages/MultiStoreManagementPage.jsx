import React from 'react';

const MultiStoreManagementPage = () => {
  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      {/* Header - Matching POS theme */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 shadow-md">
        <h1 className="text-xl font-bold text-white">
          Multi-store Management
        </h1>
        <p className="text-indigo-100 text-xs mt-1 opacity-90">
          Manage multiple store locations
        </p>
      </div>

      {/* Coming Soon Content - Minimal design */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-6">
        <div className="max-w-lg text-center">
          {/* Simple icon */}
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50">
            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Coming Soon
          </h2>
          
          <p className="text-base text-gray-600 mb-6">
            We're building a powerful multi-store management system for you.
          </p>

          {/* Features Preview - Minimal, matching theme */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Upcoming Features
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2 p-3 bg-indigo-50 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0"></div>
                <div>
                  <h4 className="text-sm font-medium text-gray-800">Store Dashboard</h4>
                  <p className="text-xs text-gray-600 mt-0.5">Centralized view of all stores</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 flex-shrink-0"></div>
                <div>
                  <h4 className="text-sm font-medium text-gray-800">Inventory Sync</h4>
                  <p className="text-xs text-gray-600 mt-0.5">Real-time stock updates</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>
                <div>
                  <h4 className="text-sm font-medium text-gray-800">Stock Transfer</h4>
                  <p className="text-xs text-gray-600 mt-0.5">Transfer between stores</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5 flex-shrink-0"></div>
                <div>
                  <h4 className="text-sm font-medium text-gray-800">Analytics</h4>
                  <p className="text-xs text-gray-600 mt-0.5">Compare store performance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiStoreManagementPage;
