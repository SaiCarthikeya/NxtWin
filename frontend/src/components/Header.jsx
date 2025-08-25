import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, useAuth, useUser } from '@clerk/clerk-react';

const Header = () => {
    const { getToken } = useAuth();
    const { isSignedIn } = useUser();
    // const [balance, setBalance] = useState(0);

    useEffect(() => {
        if (isSignedIn) {
            const fetchBalance = async () => {
                try {
                    const token = await getToken();
                    const res = await fetch('/api/users/me', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const userData = await res.json();
                    setBalance(userData.virtual_balance);
                } catch (error) {
                    console.error("Failed to fetch balance for header:", error);
                }
            };
            fetchBalance();
        }
    }, [isSignedIn, getToken]);

    return (
        <header className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700 sticky top-0 z-50">
            <div className="flex items-center gap-8">
                <a href="/markets" className="text-2xl font-bold text-white">NxtWin</a>
                <SignedIn>
                    <nav className="hidden md:flex gap-6">
                        <NavLink to="/markets" className={({ isActive }) => `text-sm font-medium transition ${isActive ? 'text-teal-400' : 'text-gray-400 hover:text-white'}`}>
                            Markets
                        </NavLink>
                        <NavLink to="/my-orders" className={({ isActive }) => `text-sm font-medium transition ${isActive ? 'text-teal-400' : 'text-gray-400 hover:text-white'}`}>
                            Your Orders
                        </NavLink>
                    </nav>
                </SignedIn>
            </div>
            <div>
                <SignedIn>
                    <div className="flex items-center gap-4">
                        {/* THE USERBUTTON IS NOW BACK */}
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </SignedIn>
                <SignedOut>
                    <a href="/sign-in" className="bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-700">
                        Sign In
                    </a>
                </SignedOut>
            </div>
        </header>
    );
};

export default Header;