// src/components/PostAuthHandler.jsx
import React, { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { API_URL } from '../config';

// This component's only job is to ensure a user exists in our DB after login.
const PostAuthHandler = ({ children }) => {
    const { getToken, isSignedIn } = useAuth();
    const { user } = useUser();

    useEffect(() => {
        // Only run this logic if the user is fully signed in and their data is available
        if (isSignedIn && user) {
            const registerOrVerifyUser = async () => {
                try {
                    const token = await getToken();

                    // Check if the user exists in our database
                    const checkUserRes = await fetch(API_URL + '/api/users/me', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    // If they don't exist (404), create them now
                    if (checkUserRes.status === 404) {
                        console.log("User not found in DB, creating now...");
                        await fetch(API_URL + '/api/users/register', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                email: user.primaryEmailAddress.emailAddress,
                                username: user.username
                            })
                        });
                    }
                } catch (error) {
                    console.error("Error ensuring user exists in DB:", error);
                }
            };
            registerOrVerifyUser();
        }
    }, [isSignedIn, user, getToken]);

    // Render the rest of the application
    return children;
};

export default PostAuthHandler;