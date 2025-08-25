import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react'; // 1. Import the useAuth hook

const PlaceBid = ({ market, userId }) => {
    const { getToken } = useAuth(); // 2. Get the getToken function from the hook
    const [selectedOption, setSelectedOption] = useState('YES');
    const [price, setPrice] = useState(5.0);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handlePriceChange = (amount) => {
        setPrice(prev => Math.max(0.5, Math.min(9.5, parseFloat((prev + amount).toFixed(1)))));
    };

    const handleQuantityChange = (amount) => {
        setQuantity(prev => Math.max(1, prev + amount));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const token = await getToken(); // 3. Get the session token from Clerk

            const response = await fetch('http://localhost:3001/api/orders/place', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 4. Add the token to the Authorization header
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId,
                    marketId: market._id,
                    optionChosen: selectedOption,
                    price,
                    quantity
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Something went wrong');
            }

            console.log('Order placed successfully!');

        } catch (error) {
            console.error("Failed to place order:", error);
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const totalCost = (price * quantity).toFixed(2);
    const potentialReturn = (10 * quantity).toFixed(2);

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
            <h3 className="text-white font-bold">Place Your Bid</h3>
            <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setSelectedOption('YES')} className={`p-3 rounded-md font-bold text-center transition ${selectedOption === 'YES' ? 'bg-teal-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                    YES
                </button>
                <button onClick={() => setSelectedOption('NO')} className={`p-3 rounded-md font-bold text-center transition ${selectedOption === 'NO' ? 'bg-red-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                    NO
                </button>
            </div>

            <InputStepper label="Price" value={price.toFixed(1)} onStep={handlePriceChange} />
            <InputStepper label="Quantity" value={quantity} onStep={handleQuantityChange} />

            <div className="border-t border-gray-700 pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>You pay:</span> <span className="font-bold text-white">₹{totalCost}</span></div>
                <div className="flex justify-between"><span>You Get (after 10% fee):</span> <span className="font-bold text-white">₹{(potentialReturn * 0.9).toFixed(2)}</span></div>
            </div>

            {errorMessage && (
                <div className="text-red-400 bg-red-900/50 p-3 rounded-md text-center text-sm">
                    {errorMessage}
                </div>
            )}

            <button onClick={handleSubmit} disabled={isLoading} className="w-full bg-slate-600 hover:bg-slate-500 font-bold py-3 rounded-lg transition disabled:bg-gray-500">
                {isLoading ? 'Placing...' : `Place Order @ ₹${totalCost}`}
            </button>
        </div>
    );
};

const InputStepper = ({ label, value, onStep }) => (
    <div>
        <label className="text-sm text-gray-400">{label}</label>
        <div className="flex items-center justify-between bg-gray-900 rounded-md p-1 mt-1">
            <button onClick={() => onStep(- (label === 'Price' ? 0.5 : 1))} className="w-10 h-10 text-xl font-bold bg-gray-700 rounded">-</button>
            <span className="text-lg font-bold text-white">{value}</span>
            <button onClick={() => onStep(label === 'Price' ? 0.5 : 1)} className="w-10 h-10 text-xl font-bold bg-gray-700 rounded">+</button>
        </div>
    </div>
);

export default PlaceBid;