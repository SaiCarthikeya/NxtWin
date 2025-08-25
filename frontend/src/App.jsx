import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, UserButton, SignIn, SignUp, useUser } from '@clerk/clerk-react';

import MarketView from './pages/MarketView';
import MarketsListPage from './pages/MarketsListPage';
import LoadingSpinner from './components/LoadingSpinner';
import AuthCallback from './pages/AuthCallback';
import NotFoundPage from './pages/NotFoundPage';
import PostAuthHandler from './components/PostAuthHandler';

// This component protects routes that require a user to be logged in
const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded) return <LoadingSpinner />;
  return isSignedIn ? children : <Navigate to="/sign-in" replace />;
};

// The main header for the application
const Header = () => (
  <header className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700 sticky top-0 z-50">
    <a href="/" className="text-2xl font-bold text-white">NxtWin</a>
    <div>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </div>
  </header>
);

// Visually enhanced Sign-In Page
const SignInPage = () => (
  <div className="w-full min-h-[calc(100vh-65px)] flex items-center justify-center p-4 bg-dots">
    <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
        <p className="text-gray-400 mt-2">Sign in to continue to NxtWin.</p>
      </div>
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" redirectUrl="/markets" />
    </div>
  </div>
);

// Visually enhanced Sign-Up Page
const SignUpPage = () => (
  <div className="w-full min-h-[calc(100vh-65px)] flex items-center justify-center p-4 bg-dots">
    <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Create Your Account</h2>
        <p className="text-gray-400 mt-2">Join NxtWin today.</p>
      </div>
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        redirectUrl="/markets"
      />
    </div>
  </div>
);

// This component handles the root redirect logic
const RootRedirector = () => {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded) return <LoadingSpinner />;
  return isSignedIn ? <Navigate to="/markets" replace /> : <Navigate to="/sign-in" replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <div className="bg-gray-900 text-gray-300 font-sans min-h-screen">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<RootRedirector />} />
            <Route path="/sign-in/*" element={<SignInPage />} />
            <Route path="/sign-up/*" element={<SignUpPage />} />
            <Route path="/markets" element={
              <ProtectedRoute>
                <PostAuthHandler>
                  <MarketsListPage />
                </PostAuthHandler>
              </ProtectedRoute>
            } />
            <Route path="/market/:marketId" element={
              <ProtectedRoute>
                <PostAuthHandler>
                  <MarketView />
                </PostAuthHandler>
              </ProtectedRoute>
            } />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;