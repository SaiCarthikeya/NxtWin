import React from 'react'

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
    <div>

    </div>
  );
};

export default App;