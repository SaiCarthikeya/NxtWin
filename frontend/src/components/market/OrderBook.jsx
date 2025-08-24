import React from 'react';

const OrderBook = ({ orderBook }) => {
    const aggregateOrders = (orders) => {
        const aggregation = {};
        orders.forEach(order => {
            const remaining = order.quantity - order.quantityFilled;
            if (aggregation[order.price]) {
                aggregation[order.price] += remaining;
            } else {
                aggregation[order.price] = remaining;
            }
        });
        return Object.entries(aggregation).sort((a, b) => b[0] - a[0]);
    };

    const yesOrders = aggregateOrders(orderBook.YES);
    const noOrders = aggregateOrders(orderBook.NO);

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-white font-bold mb-4">Order Book</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <div className="flex justify-between text-gray-400 pb-2 border-b border-gray-700">
                        <span>Price</span>
                        <span>Available YES Orders</span>
                    </div>
                    {yesOrders.map(([price, quantity]) => (
                        <OrderRow key={price} price={price} quantity={quantity} type="YES" />
                    ))}
                </div>
                <div>
                    <div className="flex justify-between text-gray-400 pb-2 border-b border-gray-700">
                        <span>Price</span>
                        <span>Available NO Orders</span>
                    </div>
                    {noOrders.map(([price, quantity]) => (
                        <OrderRow key={price} price={price} quantity={quantity} type="NO" />
                    ))}
                </div>
            </div>
        </div>
    );
};

const OrderRow = ({ price, quantity, type }) => (
    <div className={`flex justify-between py-1.5 font-mono ${type === 'YES' ? 'text-teal-400' : 'text-red-400'}`}>
        <span>₹{parseFloat(price).toFixed(2)}</span>
        <span>{quantity}</span>
    </div>
);

export default OrderBook;