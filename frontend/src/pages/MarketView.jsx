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
    const [user, setUser] = useState({ _id: '65ba362145b41214e616259e', virtual_balance: 1000 }); // Hardcoded user ID for demo
    const [market, setMarket] = useState(null);
    const [orderBook, setOrderBook] = useState({ YES: [], NO: [] });
    const [userOrders, setUserOrders] = useState([]);

    const fetchMarketData = useCallback(async (marketId) => {
        try {
            const res = await fetch(`${API_URL}/api/markets/${marketId}`);
            setMarket(await res.json());
        } catch (error) {
            console.error("Failed to fetch market data:", error);
        }
    }, []);

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

    const fetchInitialData = async () => {
        const marketsRes = await fetch(`${API_URL}/api/markets`);
        const markets = await marketsRes.json();
        if (markets.length > 0) {
            const currentMarket = markets[0];
            setMarket(currentMarket);
            await Promise.all([
                fetchOrderBook(currentMarket._id),
                fetchUserOrders(currentMarket._id, user._id)
            ]);
        }
    };


    useEffect(() => {
        const newSocket = io(API_URL);
        setSocket(newSocket);
        fetchInitialData();
        return () => newSocket.close();
    }, []);

    useEffect(() => {
        if (!socket || !market) return;

        socket.on('connect', () => console.log('Socket connected!'));
        socket.on('orderbook:update', (data) => {
            if (data.marketId === market._id) {
                console.log('Order book updating...');
                fetchOrderBook(market._id);
                fetchUserOrders(market._id, user._id);
            }
        });

        return () => {
            socket.off('orderbook:update');
        };
    }, [socket, market, user, fetchOrderBook, fetchUserOrders]);


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