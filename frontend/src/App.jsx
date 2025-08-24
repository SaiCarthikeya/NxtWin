import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const App = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [userBalance, setUserBalance] = useState(1000);
  const [chosenOption, setChosenOption] = useState(null);
  const [bidQuantity, setBidQuantity] = useState(1);
  const [bidPrice, setBidPrice] = useState(2.0);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // Load initial data
    loadEvents();
    loadUserData();

    return () => newSocket.close();
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('market-update', (data) => {
      if (selectedEvent && data.marketId === selectedEvent.id) {
        setSelectedEvent(prev => ({
          ...prev,
          yes_price: data.newYesPrice,
          no_price: data.newNoPrice,
          yes_volume: data.newYesVolume,
          no_volume: data.newNoVolume
        }));
      }
      // Update events list
      loadEvents();
    });

    socket.on('user-update', (data) => {
      if (data.userId === 1) { // Demo user ID
        setUserBalance(data.newBalance);
      }
    });

    socket.on('market-resolved', (data) => {
      if (selectedEvent && data.marketId === selectedEvent.id) {
        setSelectedEvent(prev => ({
          ...prev,
          status: data.newStatus
        }));
        setMessage(`Market resolved! Winner: ${data.winningOption.toUpperCase()}`);
      }
      loadEvents();
    });

    return () => {
      socket.off('market-update');
      socket.off('user-update');
      socket.off('market-resolved');
    };
  }, [socket, selectedEvent]);

  const loadEvents = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/markets');
      const markets = await response.json();
      setEvents(markets);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadUserData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users/1');
      const user = await response.json();
      setUserBalance(user.virtual_balance);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setChosenOption(null);
    setBidQuantity(1);
    setBidPrice(event.yes_price);
    setMessage('');
  };

  const handleOptionSelect = (option) => {
    setChosenOption(option);
    setBidPrice(option === 'yes' ? selectedEvent.yes_price : selectedEvent.no_price);
  };

  const handlePlaceBid = async () => {
    if (!chosenOption || !selectedEvent) {
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
          marketId: selectedEvent.id,
          optionChosen: chosenOption,
          quantity: parseFloat(bidQuantity)
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage(`Bid placed successfully! Cost: ₹${result.totalCost.toFixed(2)}`);
        setUserBalance(result.newBalance);
        setChosenOption(null);
        setBidQuantity(1);
        // Reload events to show updated data
        loadEvents();
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

  const handleResolveMarket = async (winningOption) => {
    try {
      const response = await fetch('http://localhost:3001/api/resolve-market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketId: selectedEvent.id,
          winningOption: winningOption
        }),
      });
      const result = await response.json();
      if (result.success) {
        setMessage(`Market resolved as ${winningOption.toUpperCase()}!`);
        loadEvents();
      }
    } catch (error) {
      setMessage('Error resolving market');
    }
  };

  const formatPrice = (price) => {
    return `₹${(price * 10).toFixed(2)}`;
  };

  const formatVolume = (volume) => {
    return `₹${volume.toFixed(2)}`;
  };

  const getEventStatus = (event) => {
    if (event.status === 'open') {
      const totalVolume = event.yes_volume + event.no_volume;
      if (totalVolume === 0) {
        return 'Waiting for participants...';
      } else if (totalVolume < 10) {
        return 'Need more participants';
      } else {
        return 'Live';
      }
    }
    return event.status.replace('_', ' ').toUpperCase();
  };

  // Events List Page
  if (!selectedEvent) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-blue-400">NxtWin</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-300">Balance: ₹{userBalance.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Prediction Markets</h2>
            <p className="text-gray-400">Place bets on real-world events and win big!</p>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div 
                key={event.id} 
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => handleEventSelect(event)}
              >
                <div className="mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    event.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {getEventStatus(event)}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-3 line-clamp-3">
                  {event.question}
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-400">YES</div>
                    <div className="text-lg font-bold text-green-400">
                      {formatPrice(event.yes_price)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400">NO</div>
                    <div className="text-lg font-bold text-red-400">
                      {formatPrice(event.no_price)}
                    </div>
                  </div>
                </div>
                
                <div className="text-center text-sm text-gray-400">
                  Volume: {formatVolume(event.yes_volume + event.no_volume)}
                </div>
              </div>
            ))}
          </div>

          {events.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">Loading events...</div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Event Detail Page
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Events
              </button>
              <h1 className="text-2xl font-bold text-blue-400">NxtWin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Balance: ₹{userBalance.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Question */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedEvent.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {getEventStatus(selectedEvent)}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                {selectedEvent.question}
              </h2>
              <p className="text-gray-400">Make correct prediction and win big!</p>
            </div>

            {/* Market Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-green-400 mb-2">YES</h3>
                <div className="text-3xl font-bold text-green-400 mb-1">
                  {formatPrice(selectedEvent.yes_price)}
                </div>
                <div className="text-sm text-green-300">
                  Volume: {formatVolume(selectedEvent.yes_volume)}
                </div>
              </div>
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-red-400 mb-2">NO</h3>
                <div className="text-3xl font-bold text-red-400 mb-1">
                  {formatPrice(selectedEvent.no_price)}
                </div>
                <div className="text-sm text-red-300">
                  Volume: {formatVolume(selectedEvent.no_volume)}
                </div>
              </div>
            </div>

            {/* Admin Controls */}
            {selectedEvent.status === 'open' && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center">
                  👑 Admin Controls
                </h3>
                <p className="text-yellow-300 text-sm mb-4">
                  Admin-only controls. Event resolution is permanent.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleResolveMarket('yes')}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Resolve YES
                  </button>
                  <button
                    onClick={() => handleResolveMarket('no')}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Resolve NO
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Trading Interface */}
          <div className="space-y-6">
            {/* Place Your Bid */}
            {selectedEvent.status === 'open' && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  🎯 Place Your Bid
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Choose your prediction and stake amount.
                </p>

                {/* Option Selection */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => handleOptionSelect('yes')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      chosenOption === 'yes'
                        ? 'border-green-500 bg-green-900/20 text-green-400'
                        : 'border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold">YES</div>
                      <div className="text-sm">{formatPrice(selectedEvent.yes_price)}</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleOptionSelect('no')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      chosenOption === 'no'
                        ? 'border-red-500 bg-red-900/20 text-red-400'
                        : 'border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold">NO</div>
                      <div className="text-sm">{formatPrice(selectedEvent.no_price)}</div>
                    </div>
                  </button>
                </div>

                {/* Quantity Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Quantity (shares)
                  </label>
                  <input
                    type="number"
                    value={bidQuantity}
                    onChange={(e) => setBidQuantity(parseFloat(e.target.value) || 0)}
                    min="0.01"
                    step="0.01"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Bid Summary */}
                {chosenOption && (
                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <div className="text-sm text-gray-400 mb-2">Will be pending: {bidQuantity} shares</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>You pay:</span>
                        <span className="text-white">₹{(bidQuantity * (chosenOption === 'yes' ? selectedEvent.yes_price : selectedEvent.no_price) * 10).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>You Get (after 10% fee):</span>
                        <span className="text-white">₹{(bidQuantity * 9.2).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Place Bid Button */}
                <button
                  onClick={handlePlaceBid}
                  disabled={!chosenOption || isLoading || bidQuantity <= 0}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                    !chosenOption || isLoading || bidQuantity <= 0
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                  }`}
                >
                  {isLoading ? 'Placing Bid...' : `Place Order @ ₹${(chosenOption === 'yes' ? selectedEvent.yes_price : selectedEvent.no_price) * 10}`}
                </button>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                📊 Quick Stats
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Market ID:</span>
                  <span className="text-white font-mono">{selectedEvent.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Yes Price:</span>
                  <span className="text-green-400">{formatPrice(selectedEvent.yes_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">No Price:</span>
                  <span className="text-red-400">{formatPrice(selectedEvent.no_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Volume:</span>
                  <span className="text-white">{formatVolume(selectedEvent.yes_volume + selectedEvent.no_volume)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Expires:</span>
                  <span className="text-white">Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
            {message}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;