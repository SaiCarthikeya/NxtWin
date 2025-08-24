import React from 'react';

const MarketStats = ({ market, orderBook }) => {
    const getBestPrice = (orders) => {
        if (!orders || orders.length === 0) return '---';
        const best = Math.max(...orders.map(o => o.price));
        return `₹${best.toFixed(2)}`;
    };

    const getTotalVolume = (book) => {
        const yesVol = book.YES.reduce((sum, o) => sum + o.quantityFilled, 0);
        const noVol = book.NO.reduce((sum, o) => sum + o.quantityFilled, 0);
        return yesVol + noVol;
    }

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3 text-sm">
            <h3 className="text-white font-bold">Quick Stats</h3>
            <div className="flex justify-between"><span>Market ID</span> <span className="font-mono">{market._id.slice(-8)}</span></div>
            <div className="flex justify-between"><span>Yes Price</span> <span className="font-mono text-teal-400">{getBestPrice(orderBook.YES)}</span></div>
            <div className="flex justify-between"><span>No Price</span> <span className="font-mono text-red-400">{getBestPrice(orderBook.NO)}</span></div>
            <div className="flex justify-between"><span>Volume</span> <span className="font-mono">₹{getTotalVolume(orderBook)}</span></div>
            <div className="flex justify-between"><span>Expires</span> <span className="font-mono">{new Date(market.createdAt).toLocaleDateString()}</span></div>
        </div>
    );
};

export default MarketStats;