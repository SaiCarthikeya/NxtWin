// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div className="text-center p-20">
            <h1 className="text-6xl font-bold text-white">404</h1>
            <p className="text-2xl text-gray-400 mt-4">Page Not Found</p>
            <p className="text-gray-500 mt-2">The page you are looking for does not exist.</p>
            <Link
                to="/"
                className="mt-8 inline-block bg-teal-600 text-white font-bold py-3 px-6 rounded-md hover:bg-teal-700"
            >
                Go Home
            </Link>
        </div>
    );
};

export default NotFoundPage;