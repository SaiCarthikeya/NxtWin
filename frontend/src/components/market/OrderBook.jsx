import React from 'react';

const OrderBook = ({ orderBook }) => {
    const MAX_PAYOUT = 10;

    const createAvailableTrades = (opposingOrders) => {
        const aggregation = {};
        opposingOrders.forEach(order => {
            const remainingQuantity = order.quantity - order.quantityFilled;
            if (remainingQuantity <= 0) return;

            const availablePrice = parseFloat((MAX_PAYOUT - order.price).toFixed(2));

            if (aggregation[availablePrice]) {
                aggregation[availablePrice] += remainingQuantity;
            } else {
                aggregation[availablePrice] = remainingQuantity;
            }
        });
        return Object.entries(aggregation).sort((a, b) => b[0] - a[0]);
    };

    const availableYesTrades = createAvailableTrades(orderBook.NO || []);
    const availableNoTrades = createAvailableTrades(orderBook.YES || []);

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-white font-bold mb-4">Order Book (Available Trades)</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <div className="flex justify-between text-gray-400 pb-2 border-b border-gray-700">
                        <span>Price</span>
                        <span>Available YES</span>
                    </div>
                    {availableYesTrades.length > 0 ? (
                        availableYesTrades.map(([price, quantity]) => (
                            <OrderRow key={price} price={price} quantity={quantity} type="YES" />
                        ))
                    ) : (
                        <p className="text-gray-500 pt-2 text-xs">No YES trades available</p>
                    )}
                </div>
                <div>
                    <div className="flex justify-between text-gray-400 pb-2 border-b border-gray-700">
                        <span>Price</span>
                        <span>Available NO</span>
                    </div>
                    {availableNoTrades.length > 0 ? (
                        availableNoTrades.map(([price, quantity]) => (
                            // THE FIX IS HERE: It now correctly uses price={price}
                            <OrderRow key={price} price={price} quantity={quantity} type="NO" />
                        ))
                    ) : (
                        <p className="text-gray-500 pt-2 text-xs">No NO trades available</p>
                    )}
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