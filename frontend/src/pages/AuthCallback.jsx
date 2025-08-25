import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import LoadingSpinner from '../components/LoadingSpinner'; // Import your component

const AuthCallback = () => {
    const navigate = useNavigate();
    const { isLoaded, isSignedIn } = useAuth();

    useEffect(() => {
        // As soon as Clerk is loaded and confirms the user is signed in,
        // we navigate them to the main markets page.
        if (isLoaded && isSignedIn) {
            navigate('/markets');
        }
    }, [isLoaded, isSignedIn, navigate]);

    // Display your consistent loading spinner while waiting for the redirect.
    return <LoadingSpinner />;
};

export default AuthCallback;