# NxtWin - Prediction Market Platform

A real-time prediction market platform built with React, Node.js, Express, Socket.io, and SQLite. Users can place bets on binary outcomes and see real-time updates as the market moves.

## Features

- **Real-time Trading**: Live updates using WebSocket connections
- **Binary Prediction Markets**: YES/NO outcomes with dynamic pricing
- **Virtual Currency**: Users trade with virtual coins
- **Dynamic Pricing**: Prices adjust based on trading volume using a bonding curve
- **Market Resolution**: Admin-controlled market resolution with automatic payout distribution
- **Responsive UI**: Modern, mobile-friendly interface built with Tailwind CSS

## System Architecture

### Backend (Node.js + Express + Socket.io)
- **Database**: SQLite with tables for users, markets, and bids
- **Real-time Communication**: Socket.io for instant updates
- **API Endpoints**: RESTful API for market operations
- **Pricing Model**: Simple bonding curve for dynamic pricing

### Frontend (React + Tailwind CSS)
- **Real-time Updates**: WebSocket integration for live data
- **Interactive Trading**: Intuitive bid placement interface
- **Responsive Design**: Works on all device sizes
- **State Management**: React hooks for local state

## Database Schema

### Users Table
- `id`: Unique user identifier
- `username`: User's display name
- `virtual_balance`: Available virtual coins

### Markets Table
- `id`: Unique market identifier
- `question`: Prediction question text
- `status`: Market state (open, closed, resolved_yes, resolved_no)
- `yes_price`/`no_price`: Current prices for outcomes
- `yes_volume`/`no_volume`: Total coins bet on each outcome

### Bids Table
- `id`: Unique bid identifier
- `user_id`: Reference to user
- `market_id`: Reference to market
- `option_chosen`: YES or NO
- `quantity`: Number of shares
- `bid_price`: Price per share at time of bid

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Initialize the database:
   ```bash
   npm run init-db
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:3001`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`

## Usage

### For Users
1. **View Markets**: See available prediction markets and current prices
2. **Place Bids**: Choose YES or NO, enter quantity, and place your bet
3. **Real-time Updates**: Watch prices and volumes change as others trade
4. **Track Balance**: Monitor your virtual coin balance

### For Admins
1. **Market Management**: Create and manage prediction markets
2. **Resolution**: Resolve markets when outcomes are known
3. **Automatic Payouts**: System automatically distributes winnings

## API Endpoints

### Markets
- `GET /api/markets` - List all markets
- `GET /api/markets/:id` - Get specific market details
- `POST /api/place-bid` - Place a new bid
- `POST /api/resolve-market` - Resolve a market

### Users
- `GET /api/users/:id` - Get user information

## WebSocket Events

### Client → Server
- `connect` - Establish connection
- `disconnect` - Handle disconnection

### Server → Client
- `market-update` - Real-time market data updates
- `user-update` - User balance updates
- `market-resolved` - Market resolution notifications

## Pricing Model

The system uses a simple bonding curve where:
- Price = Volume of Option / Total Volume
- Prices automatically adjust as trading volume changes
- Higher volume on one side increases its price

## Demo Data

The system comes with sample data:
- **Users**: demo_user, test_user (both start with 1000 coins)
- **Markets**: Sample prediction questions about weather and cryptocurrency

## Development

### Project Structure
```
NxtWin/
├── backend/
│   ├── server.js          # Main server file
│   ├── init-db.js         # Database initialization
│   ├── package.json       # Backend dependencies
│   └── nxtwin.db         # SQLite database (created on init)
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── App.css        # Component styles
│   │   └── main.jsx       # React entry point
│   ├── package.json       # Frontend dependencies
│   └── index.html         # HTML template
└── README.md              # This file
```

### Key Functions

#### `placeBid(userId, marketId, optionChosen, quantity)`
- Validates user balance
- Updates market prices and volumes
- Deducts cost from user balance
- Emits real-time updates

#### `resolveMarket(marketId, winningOption)`
- Updates market status
- Calculates winnings distribution
- Updates user balances
- Emits resolution notifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For questions or issues, please open an issue on the GitHub repository.
