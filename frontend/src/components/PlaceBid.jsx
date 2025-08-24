import { useState, useMemo } from 'react';

const ControlButton = ({ onClick, children, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="w-8 h-8 flex items-center justify-center text-xl font-bold bg-slate-700 text-slate-200 rounded-md hover:bg-slate-600 transition-colors disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
    >
        {children}
    </button>
);

const PlaceBid = () => {
    const [selectedBid, setSelectedBid] = useState('yes');
    const [quantity, setQuantity] = useState(1);

    const marketPrices = { yes: 4.00, no: 5.00 };
    const FEE_PERCENTAGE = 0.10;
    const TOTAL_VALUE_PER_SHARE = 10.00;
    const USER_BALANCE = 50.00;

    const handleBidSelect = (bidType) => {
        setSelectedBid(bidType);
        setQuantity(1);
    };

    const { pricePerShare, youPay, youGet, maxAffordableQuantity } = useMemo(() => {
        const currentPricePerShare = marketPrices[selectedBid];
        const affordableQty = currentPricePerShare > 0 ? Math.floor(USER_BALANCE / currentPricePerShare) : 0;

        const payAmount = currentPricePerShare * quantity;
        const totalReturnValue = TOTAL_VALUE_PER_SHARE * quantity;
        const potentialWinnings = totalReturnValue - payAmount;
        const feeOnWinnings = potentialWinnings > 0 ? potentialWinnings * FEE_PERCENTAGE : 0;
        const getAmount = totalReturnValue - feeOnWinnings;

        return {
            pricePerShare: currentPricePerShare,
            youPay: payAmount.toFixed(2),
            youGet: getAmount.toFixed(2),
            maxAffordableQuantity: affordableQty,
        };
    }, [selectedBid, quantity, USER_BALANCE]);

    const handleQuantityChange = (increment) => {
        setQuantity(prev => {
            const newValue = prev + increment;
            return Math.max(1, Math.min(newValue, maxAffordableQuantity));
        });
    };

    const handlePlaceOrder = () => {
        console.log(`Order placed for ${quantity} share(s) of "${selectedBid.toUpperCase()}" at ₹${pricePerShare.toFixed(2)} each.`);
    };

    return (
        <div className="w-80 p-4 rounded-lg bg-slate-800 text-slate-300 font-sans shadow-lg border border-slate-700">
            <h2 className="text-lg font-semibold text-white">Place Your Bid</h2>
            <p className="text-sm text-slate-400 mb-4">Your Balance: ₹{USER_BALANCE.toFixed(2)}</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                    onClick={() => handleBidSelect('yes')}
                    className={`p-2 rounded-lg transition-colors ${selectedBid === 'yes' ? 'bg-teal-500 text-white' : 'bg-teal-500/10 hover:bg-teal-500/20'}`}
                >
                    <span className={`block font-bold ${selectedBid !== 'yes' && 'text-teal-400'}`}>YES</span>
                    <span className={`block text-sm ${selectedBid !== 'yes' && 'text-slate-300'}`}>₹{marketPrices.yes.toFixed(1)}</span>
                </button>
                <button
                    onClick={() => handleBidSelect('no')}
                    className={`p-2 rounded-lg transition-colors ${selectedBid === 'no' ? 'bg-red-600 text-white' : 'bg-red-600/10 hover:bg-red-600/20'}`}
                >
                    <span className={`block font-bold ${selectedBid !== 'no' && 'text-red-400'}`}>NO</span>
                    <span className={`block text-sm ${selectedBid !== 'no' && 'text-slate-300'}`}>₹{marketPrices.no.toFixed(1)}</span>
                </button>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-slate-400">Price</label>
                <div className="flex items-center justify-between p-1 bg-slate-900 rounded-lg">
                    <ControlButton onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>-</ControlButton>
                    <span className="text-lg font-semibold text-white">₹{youPay}</span>
                    {/* Updated: Disabled state is now dynamic */}
                    <ControlButton onClick={() => handleQuantityChange(1)} disabled={quantity >= maxAffordableQuantity}>+</ControlButton>
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-slate-400">Quantity (Max: {maxAffordableQuantity})</label>
                <div className="flex items-center justify-between p-1 bg-slate-900 rounded-lg">
                    <ControlButton onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>-</ControlButton>
                    <span className="text-lg font-semibold text-white">{quantity}</span>
                    {/* Updated: Disabled state is now dynamic */}
                    <ControlButton onClick={() => handleQuantityChange(1)} disabled={quantity >= maxAffordableQuantity}>+</ControlButton>
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">You pay:</span>
                    <span className="font-medium text-white">₹{youPay}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">You Get (after 10% fee):</span>
                    <span className="font-medium text-white">₹{youGet}</span>
                </div>
            </div>

            <button
                onClick={handlePlaceOrder}
                disabled={parseFloat(youPay) > USER_BALANCE || maxAffordableQuantity < 1}
                className="w-full py-3 rounded-lg bg-slate-600 text-white font-semibold hover:bg-slate-500 transition-colors disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
            >
                Place Order for ₹{youPay}
            </button>
        </div>
    );
};

export default PlaceBid;