// src/pages/MarketView.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '@clerk/clerk-react';

import LoadingSpinner from '../components/LoadingSpinner';
import EventDetails from '../components/market/EventDetails';
import PlaceBid from '../components/market/PlaceBid';
import OrderBook from '../components/market/OrderBook';
import UserOrders from '../components/market/UserOrders';
// import MarketStats from '../components/market/MarketStats';

import { API_URL } from '../config'

const MarketView = () => {
    const { marketId } = useParams();
    const { getToken } = useAuth();

    const [socket, setSocket] = useState(null);
    const [user, setUser] = useState(null);
    const [market, setMarket] = useState(null);
    const [orderBook, setOrderBook] = useState({ YES: [], NO: [] });
    const [userOrders, setUserOrders] = useState([]);

    const fetchOrderBook = useCallback(async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/orders/${marketId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setOrderBook(await res.json());
        } catch (error) {
            console.error("Failed to fetch order book:", error);
        }
    }, [getToken, marketId]);

    const fetchUserOrders = useCallback(async (appUser) => {
        if (!appUser) return;
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/orders/my-orders/${marketId}/${appUser._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUserOrders(await res.json());
        } catch (error) {
            console.error("Failed to fetch user orders:", error);
        }
    }, [getToken, marketId]);

    const fetchInitialData = useCallback(async () => {
        try {
            const token = await getToken();

            // Fetch our application user from our DB
            const userRes = await fetch(`${API_URL}/api/users/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!userRes.ok) throw new Error('Failed to fetch app user');
            const appUser = await userRes.json();
            setUser(appUser);

            // Fetch the specific market
            const marketRes = await fetch(`${API_URL}/api/markets/${marketId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const marketData = await marketRes.json();
            setMarket(marketData);

            // Fetch order data
            if (marketData && appUser) {
                await Promise.all([
                    fetchOrderBook(),
                    fetchUserOrders(appUser)
                ]);
            }
        } catch (error) {
            console.error("Failed to load initial data", error);
        }
    }, [getToken, marketId, fetchOrderBook, fetchUserOrders]);

    useEffect(() => {
        fetchInitialData();
        const newSocket = io(API_URL);
        setSocket(newSocket);
        return () => newSocket.close();
    }, [fetchInitialData]);

    useEffect(() => {
        if (!socket || !market || !user) return;
        socket.on('orderbook:update', (data) => {
            if (data.marketId === market._id) {
                fetchOrderBook();
                fetchUserOrders(user);
            }
        });
        socket.on('user:update', (data) => {
            if (data.userId === user._id) {
                setUser(prevUser => ({ ...prevUser, virtual_balance: data.newBalance }));
            }
        });
        return () => {
            socket.off('orderbook:update');
            socket.off('user:update');
        };
    }, [socket, market, user, fetchOrderBook, fetchUserOrders]);


    if (!market || !user) {
        return <LoadingSpinner />;
    }

    return (
        <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <EventDetails market={market} userBalance={user.virtual_balance} />
                <OrderBook orderBook={orderBook} />
                <UserOrders orders={userOrders} />
            </div>
            <div className="space-y-6">
                <PlaceBid market={market} userId={user._id} />
                {/* <MarketStats market={market} orderBook={orderBook} /> */}
            </div>
        </div>
    );
};

export default MarketView;