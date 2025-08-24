import React from 'react';

const EventDetails = ({ market, userBalance }) => (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <span className="text-xs font-bold text-teal-400 bg-gray-700 px-2 py-1 rounded">General</span>
        <h2 className="text-2xl font-bold text-white mt-2">{market.question}</h2>
        <p className="text-gray-400 mt-1">{market.description}</p>
        <div className="mt-4 border-t border-gray-700 pt-4 text-center">
            <span className="text-gray-400">Your remaining balance</span>
            <p className="text-2xl font-bold text-white font-mono">₹{userBalance.toFixed(2)}</p>
        </div>
    </div>
);

export default EventDetails;