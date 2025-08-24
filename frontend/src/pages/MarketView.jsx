import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import EventDetails from '../components/market/EventDetails';
import PlaceBid from '../components/market/PlaceBid';
import OrderBook from '../components/market/OrderBook';
import UserOrders from '../components/market/UserOrders';
import MarketStats from '../components/market/MarketStats';

const API_URL = 'http://localhost:3001';

const MarketView = () => {
    const [socket, setSocket] = useState(null);
    // Hardcoded user ID for demo - MAKE SURE THIS MATCHES YOUR DB
    const [user, setUser] = useState({ _id: '664f617a80cc827a2567342a', virtual_balance: 5000 });
    const [market, setMarket] = useState(null);
    const [orderBook, setOrderBook] = useState({ YES: [], NO: [] });
    const [userOrders, setUserOrders] = useState([]);

    const fetchOrderBook = useCallback(async (marketId) => {
        try {
            const res = await fetch(`${API_URL}/api/orders/${marketId}`);
            setOrderBook(await res.json());
        } catch (error) {
            console.error("Failed to fetch order book:", error);
        }
    }, []);

    const fetchUserOrders = useCallback(async (marketId, userId) => {
        try {
            const res = await fetch(`${API_URL}/api/orders/my-orders/${marketId}/${userId}`);
            setUserOrders(await res.json());
        } catch (error) {
            console.error("Failed to fetch user orders:", error);
        }
    }, []);

    const fetchInitialData = useCallback(async (userId) => {
        try {
            const marketsRes = await fetch(`${API_URL}/api/markets`);
            const markets = await marketsRes.json();

            const userRes = await fetch(`${API_URL}/api/users/${userId}`);
            const userData = await userRes.json();
            setUser(userData);

            if (markets.length > 0) {
                const currentMarket = markets[0];
                setMarket(currentMarket);
                await Promise.all([
                    fetchOrderBook(currentMarket._id),
                    fetchUserOrders(currentMarket._id, userId)
                ]);
            }
        } catch (error) {
            console.error("Failed to load initial data", error);
        }
    }, [fetchOrderBook, fetchUserOrders]);


    useEffect(() => {
        const newSocket = io(API_URL);
        setSocket(newSocket);
        fetchInitialData(user._id);
        return () => newSocket.close();
    }, [user._id, fetchInitialData]);

    useEffect(() => {
        if (!socket || !market) return;

        socket.on('connect', () => console.log('Socket connected!'));
        socket.on('orderbook:update', (data) => {
            if (data.marketId === market._id) {
                fetchOrderBook(market._id);
                fetchUserOrders(market._id, user._id);
            }
        });

        // ADD THIS LISTENER TO UPDATE THE BALANCE
        socket.on('user:update', (data) => {
            if (data.userId === user._id) {
                setUser(prevUser => ({ ...prevUser, virtual_balance: data.newBalance }));
            }
        });

        return () => {
            socket.off('orderbook:update');
            socket.off('user:update'); // Clean up the listener
        };
    }, [socket, market, user._id, fetchOrderBook, fetchUserOrders]);


    if (!market) {
        return <LoadingSpinner />;
    }

    return (
        <div className="bg-gray-900 min-h-screen text-gray-300 font-sans">
            <Header userBalance={user.virtual_balance} />
            <main className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <EventDetails market={market} userBalance={user.virtual_balance} />
                    <OrderBook orderBook={orderBook} />
                    <UserOrders orders={userOrders} />
                </div>
                <div className="space-y-6">
                    <PlaceBid market={market} userId={user._id} />
                    <MarketStats market={market} orderBook={orderBook} />
                </div>
            </main>
        </div>
    );
};

export default MarketView;