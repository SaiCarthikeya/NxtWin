import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [userBalance, setUserBalance] = useState(1000);
  const [currentMarket, setCurrentMarket] = useState(null);
  const [chosenOption, setChosenOption] = useState(null);
  const [bidQuantity, setBidQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // Load initial data
    loadInitialData();

    return () => newSocket.close();
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('market-update', (data) => {
      if (data.marketId === currentMarket?.id) {
        setCurrentMarket(prev => ({
          ...prev,
          yes_price: data.newYesPrice,
          no_price: data.newNoPrice,
          yes_volume: data.newYesVolume,
          no_volume: data.newNoVolume
        }));
      }
    });

    socket.on('user-update', (data) => {
      // For demo purposes, we'll assume user ID 1
      if (data.userId === 1) {
        setUserBalance(data.newBalance);
      }
    });

    socket.on('market-resolved', (data) => {
      if (data.marketId === currentMarket?.id) {
        setCurrentMarket(prev => ({
          ...prev,
          status: data.newStatus
        }));
        setMessage(`Market resolved! Winner: ${data.winningOption.toUpperCase()}`);
      }
    });

    return () => {
      socket.off('market-update');
      socket.off('user-update');
      socket.off('market-resolved');
    };
  }, [socket, currentMarket]);

  const loadInitialData = async () => {
    try {
      // Load markets
      const marketsResponse = await fetch('http://localhost:3001/api/markets');
      const markets = await marketsResponse.json();
      
      if (markets.length > 0) {
        setCurrentMarket(markets[0]);
      }

      // Load user data (assuming user ID 1 for demo)
      const userResponse = await fetch('http://localhost:3001/api/users/1');
      const user = await userResponse.json();
      setUserBalance(user.virtual_balance);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setMessage('Error loading data. Make sure the backend is running.');
    }
  };

  const handleOptionSelect = (option) => {
    setChosenOption(option);
    setMessage('');
  };

  const handlePlaceBid = async () => {
    if (!chosenOption || !currentMarket) {
      setMessage('Please select an option first');
      return;
    }

    if (bidQuantity <= 0) {
      setMessage('Please enter a valid quantity');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/place-bid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1, // Demo user ID
          marketId: currentMarket.id,
          optionChosen: chosenOption,
          quantity: parseFloat(bidQuantity)
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage(`Bid placed successfully! Cost: ${result.totalCost.toFixed(2)} coins`);
        setUserBalance(result.newBalance);
        setChosenOption(null);
        setBidQuantity(1);
      } else {
        setMessage(result.error || 'Failed to place bid');
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      setMessage('Error placing bid. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    return (price * 100).toFixed(1) + '%';
  };

  const formatVolume = (volume) => {
    return volume.toFixed(2);
  };

  if (!currentMarket) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prediction market...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
            <h1 className="text-3xl font-bold text-center mb-2">NxtWin</h1>
            <p className="text-center text-blue-100">Prediction Market Platform</p>
          </div>

          {/* Market Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {currentMarket.question}
              </h2>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Status: {currentMarket.status.replace('_', ' ').toUpperCase()}
              </div>
            </div>

            {/* Market Stats */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <h3 className="text-lg font-semibold text-green-800 mb-2">YES</h3>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {formatPrice(currentMarket.yes_price)}
                </div>
                <div className="text-sm text-green-600">
                  Volume: {formatVolume(currentMarket.yes_volume)} coins
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <h3 className="text-lg font-semibold text-red-800 mb-2">NO</h3>
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {formatPrice(currentMarket.no_price)}
                </div>
                <div className="text-sm text-red-600">
                  Volume: {formatVolume(currentMarket.no_volume)} coins
                </div>
              </div>
            </div>
          </div>

          {/* User Info Section */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="text-center">
              <p className="text-lg text-gray-700">
                Current Balance: <span className="font-bold text-blue-600">{userBalance.toFixed(2)}</span> virtual coins
              </p>
            </div>
          </div>

          {/* Bid Section */}
          {currentMarket.status === 'open' && (
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Place Your Bid</h3>
              
              {/* Option Selection */}
              <div className="flex justify-center gap-4 mb-6">
                <button
                  onClick={() => handleOptionSelect('yes')}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                    chosenOption === 'yes'
                      ? 'bg-green-600 text-white shadow-lg scale-105'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  YES
                </button>
                <button
                  onClick={() => handleOptionSelect('no')}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                    chosenOption === 'no'
                      ? 'bg-red-600 text-white shadow-lg scale-105'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  NO
                </button>
              </div>

              {/* Bid Controls */}
              <div className="max-w-md mx-auto">
                <div className="mb-4">
                  <label htmlFor="bid-quantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity (shares)
                  </label>
                  <input
                    type="number"
                    id="bid-quantity"
                    value={bidQuantity}
                    onChange={(e) => setBidQuantity(e.target.value)}
                    min="0.01"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <button
                  onClick={handlePlaceBid}
                  disabled={!chosenOption || isLoading}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                    !chosenOption || isLoading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                  }`}
                >
                  {isLoading ? 'Placing Bid...' : 'Place Bid'}
                </button>
              </div>
            </div>
          )}

          {/* Message Display */}
          {message && (
            <div className="p-4 bg-blue-50 border-t border-blue-200">
              <p className="text-center text-blue-800">{message}</p>
            </div>
          )}

          {/* Admin Section (for demo purposes) */}
          {currentMarket.status === 'open' && (
            <div className="p-6 bg-yellow-50 border-t border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4 text-center">Admin Controls (Demo)</h3>
              <div className="flex justify-center gap-4">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('http://localhost:3001/api/resolve-market', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          marketId: currentMarket.id,
                          winningOption: 'yes'
                        }),
                      });
                      const result = await response.json();
                      if (result.success) {
                        setMessage('Market resolved as YES!');
                      }
                    } catch (error) {
                      setMessage('Error resolving market');
                    }
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Resolve as YES
                </button>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('http://localhost:3001/api/resolve-market', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          marketId: currentMarket.id,
                          winningOption: 'no'
                        }),
                      });
                      const result = await response.json();
                      if (result.success) {
                        setMessage('Market resolved as NO!');
                      }
                    } catch (error) {
                      setMessage('Error resolving market');
                    }
                  }}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Resolve as NO
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;