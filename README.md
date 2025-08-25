# NxtWin - A Real-Time Prediction Market Platform

NxtWin is a modern, real-time prediction market platform built on the MERN stack (MongoDB, Express, React, Node.js). It features a robust order book matching engine and secure user authentication powered by Clerk. Users can trade on the outcomes of real-world events using virtual currency.

## Features

-   **Secure Authentication**: Full email/password and social login (Google) powered by Clerk.
-   **Order Book Trading**: An event-driven matching engine executes trades instantly when orders match.
-   **Real-time Updates**: Live market data and user balance updates using Socket.IO.
-   **Binary Prediction Markets**: Trade on YES/NO outcomes for any event.
-   **Virtual Currency**: All users start with a virtual balance to trade with.
-   **Complete Trade History**: Users can view a full history of their open and filled orders.
-   **Responsive UI**: A sleek, modern interface built with Vite, React, and Tailwind CSS.

---
## System Architecture

### **Backend (Node.js + Express)**
-   **Database**: MongoDB Atlas for a scalable, cloud-hosted database.
-   **Authentication**: Clerk handles user management, session control, and JWT-based API protection.
-   **Real-time Communication**: Socket.IO for instant broadcasting of order book and user balance updates.
-   **API**: A RESTful API for market data, order placement, and user information.

### **Frontend (React + Vite)**
-   **Framework**: Built with Vite for a fast and modern development experience.
-   **UI**: Styled with Tailwind CSS for a responsive and clean design.
-   **Routing**: `react-router-dom` for multi-page navigation.
-   **Authentication UI**: Utilizes pre-built, customizable components from Clerk for a seamless login/signup experience.

---
## Database Schema (MongoDB Collections)

### **`users`**
-   `clerkId`: String (Unique ID from Clerk)
-   `username`: String
-   `email`: String (Unique)
-   `virtual_balance`: Number

### **`markets`**
-   `question`: String
-   `description`: String
-   `status`: String ('OPEN' or 'RESOLVED')
-   `outcome`: String ('YES', 'NO', or 'UNDETERMINED')

### **`orders`**
-   `user`: ObjectId (ref: 'User')
-   `market`: ObjectId (ref: 'Market')
-   `outcome`: String ('YES' or 'NO')
-   `price`: Number
-   `quantity`: Number
-   `quantityFilled`: Number
-   `status`: String ('OPEN', 'FILLED', 'PARTIALLY_FILLED', 'CANCELLED')

---
## Setup Instructions

### **Prerequisites**
-   Node.js (v16 or higher)
-   npm or yarn
-   A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account
-   A free [Clerk](https://clerk.com/sign-up) account

### **Backend Setup**
1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend` root and add the following variables:
    ```env
    PORT=3001
    MONGO_URI=your_mongodb_atlas_connection_string
    CLERK_SECRET_KEY=your_clerk_secret_key
    CLIENT_URL=http://localhost:5173
    ```
4.  Start the backend server:
    ```bash
    npm start
    ```
    The backend will run on `http://localhost:3001`.

### **Frontend Setup**
1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env.local` file in the `frontend` root and add your Clerk Publishable Key:
    ```env
    VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
    The frontend will run on `http://localhost:5173`.

---
## API Endpoints

All routes (except `/api/users/register`) are protected and require authentication.

### **Markets**
-   `GET /api/markets`: List all available markets.
-   `GET /api/markets/:marketId`: Get details for a specific market.
-   `POST /api/markets/resolve`: (Admin) Resolve a market and trigger payouts.

### **Orders**
-   `POST /api/orders/place`: Place a new order.
-   `GET /api/orders/:marketId`: Get the public order book for a market.
-   `GET /api/orders/my-orders`: Get all orders for the logged-in user.

### **Users**
-   `POST /api/users/register`: Creates a user in the database after they sign up with Clerk.
-   `GET /api/users/me`: Get the logged-in user's profile from the database.

---
## WebSocket Events

### **Server → Client**
-   `orderbook:update`: Sent when any order is placed or filled, prompting clients to refresh the order book.
-   `user:update`: Sent to a specific user when their balance changes.
-   `market:resolved`: Sent when a market is resolved.