// src/pages/MyOrdersPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import LoadingSpinner from '../components/LoadingSpinner';

const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { getToken } = useAuth();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = await getToken();
                const res = await fetch('http://localhost:3001/api/orders/my-orders', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [getToken]);

    const getStatusClass = (status) => {
        switch (status) {
            case 'FILLED': return 'bg-green-800 text-green-300';
            case 'OPEN': return 'bg-yellow-800 text-yellow-300';
            case 'PARTIALLY_FILLED': return 'bg-blue-800 text-blue-300';
            default: return 'bg-gray-700 text-gray-300';
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold text-white mb-6">Your Orders</h1>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                {orders.length > 0 ? (
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                            <tr>
                                <th className="px-4 py-2">Market</th>
                                <th className="px-4 py-2">Option</th>
                                <th className="px-4 py-2">Price</th>
                                <th className="px-4 py-2">Qty</th>
                                <th className="px-4 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id} className="border-b border-gray-700">
                                    <td className="px-4 py-2 text-white">{order.market?.question || 'Market not found'}</td>
                                    <td className={`px-4 py-2 font-bold ${order.outcome === 'YES' ? 'text-teal-400' : 'text-red-400'}`}>{order.outcome}</td>
                                    <td className="px-4 py-2 font-mono">₹{order.price.toFixed(2)}</td>
                                    <td className="px-4 py-2">{order.quantityFilled}/{order.quantity}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(order.status)}`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-400 text-center py-4">You haven't placed any orders yet.</p>
                )}
            </div>
        </div>
    );
};

export default MyOrdersPage;