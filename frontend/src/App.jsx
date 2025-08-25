import React, { useState } from 'react';
import MarketView from './pages/MarketView';

const App = () => {
  const [page, setPage] = useState('market');

  const renderPage = () => {
    switch (page) {
      case 'market':
        return <MarketView />;
      default:
        return <MarketView />;
    }
  };

  // Event Detail Page
  return (
    <div>
      {renderPage()}
    </div>
  );
};

export default App;