import React from 'react';

const LoadingSpinner = () => (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading Prediction Market...</p>
        </div>
    </div>
);

export default LoadingSpinner;