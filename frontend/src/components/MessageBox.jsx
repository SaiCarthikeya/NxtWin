import React from 'react';

const MessageBox = ({ message, type = 'info' }) => {
    if (!message) return null;

    const baseClasses = "p-4 rounded-lg mb-4 text-center font-semibold";
    const typeClasses = {
        info: 'bg-blue-900/50 text-blue-300',
        error: 'bg-red-900/50 text-red-300',
        success: 'bg-green-900/50 text-green-300',
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`}>
            {message}
        </div>
    );
};

export default MessageBox;