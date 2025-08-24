import React from 'react';

const Header = ({ userBalance }) => (
    <header className="bg-gray-800 p-4 shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">NxtWin</h1>
            <div className="text-lg font-semibold text-teal-400">
                Balance: <span className="font-mono">₹{userBalance.toFixed(2)}</span>
            </div>
        </div>
    </header>
);

export default Header;