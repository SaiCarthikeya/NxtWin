// src/pages/MarketsListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import LoadingSpinner from '../components/LoadingSpinner';

const MarketsListPage = () => {
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(true);
    const { getToken } = useAuth();

    const fetchMarkets = useCallback(async () => {
        try {
            const token = await getToken(); // Get the session token from Clerk
            const res = await fetch('http://localhost:3001/api/markets', {
                headers: {
                    // Add the token to the Authorization header
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to fetch markets');
            const data = await res.json();
            setMarkets(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        fetchMarkets();
    }, [fetchMarkets]);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="container mx-auto p-4 ">
            <h1 className="text-3xl font-bold text-white mb-6">Available Markets</h1>
            <div className="space-y-4">
                {markets.map(market => (
                    <Link
                        key={market._id}
                        to={`/market/${market._id}`}
                        className="block bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-teal-500 transition"
                    >
                        <h2 className="text-xl font-semibold text-white">{market.question}</h2>
                        <p className="text-sm text-gray-400 mt-1">{market.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default MarketsListPage;