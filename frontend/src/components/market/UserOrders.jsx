import React from 'react';

const UserOrders = ({ orders }) => {
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-white font-bold mb-4">Your Orders</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                        <tr>
                            <th className="px-4 py-2">Option</th>
                            <th className="px-4 py-2">Price</th>
                            <th className="px-4 py-2">Qty</th>
                            <th className="px-4 py-2">Total</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order._id} className="border-b border-gray-700">
                                <td className={`px-4 py-2 font-bold ${order.outcome === 'YES' ? 'text-teal-400' : 'text-red-400'}`}>{order.outcome}</td>
                                <td className="px-4 py-2 font-mono">₹{order.price.toFixed(2)}</td>
                                <td className="px-4 py-2">{order.quantity}</td>
                                <td className="px-4 py-2 font-mono">₹{(order.price * order.quantity).toFixed(2)}</td>
                                <td className="px-4 py-2">
                                    <span className={`px-2 py-1 text-xs rounded-full ${order.status === 'FILLED' ? 'bg-green-800 text-green-300' : 'bg-yellow-800 text-yellow-300'}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-4 py-2">{new Date(order.createdAt).toLocaleTimeString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserOrders;