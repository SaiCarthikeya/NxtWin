import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(join(__dirname, 'public')));

// Database connection
const dbPath = join(__dirname, 'nxtwin.db');
const db = new sqlite3.Database(dbPath);

// Pricing model function (simple bonding curve)
function calculatePrice(volume, totalVolume) {
  if (totalVolume === 0) return 0.5;
  return volume / totalVolume;
}

// Function: place_bid(user_id, market_id, option_chosen, quantity)
async function placeBid(userId, marketId, optionChosen, quantity) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Check user balance
      db.get('SELECT virtual_balance FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
          reject({ error: 'Database error', details: err.message });
          return;
        }
        if (!user) {
          reject({ error: 'User not found' });
          return;
        }

        // Get current market data
        db.get('SELECT * FROM markets WHERE id = ?', [marketId], (err, market) => {
          if (err) {
            reject({ error: 'Database error', details: err.message });
            return;
          }
          if (!market) {
            reject({ error: 'Market not found' });
            return;
          }
          if (market.status !== 'open') {
            reject({ error: 'Market is not open for trading' });
            return;
          }

          // Calculate current price for the chosen option
          const currentPrice = optionChosen === 'yes' ? market.yes_price : market.no_price;
          const totalCost = currentPrice * quantity;

          if (totalCost > user.virtual_balance) {
            reject({ error: 'Insufficient balance' });
            return;
          }

          // Update market volumes and prices
          const newYesVolume = optionChosen === 'yes' ? market.yes_volume + quantity : market.yes_volume;
          const newNoVolume = optionChosen === 'no' ? market.no_volume + quantity : market.no_volume;
          const totalVolume = newYesVolume + newNoVolume;

          const newYesPrice = calculatePrice(newYesVolume, totalVolume);
          const newNoPrice = calculatePrice(newNoVolume, totalVolume);

          // Update market
          db.run(`
            UPDATE markets 
            SET yes_price = ?, no_price = ?, yes_volume = ?, no_volume = ? 
            WHERE id = ?
          `, [newYesPrice, newNoPrice, newYesVolume, newNoVolume, marketId], function(err) {
            if (err) {
              reject({ error: 'Failed to update market', details: err.message });
              return;
            }

            // Update user balance
            db.run(`
              UPDATE users 
              SET virtual_balance = virtual_balance - ? 
              WHERE id = ?
            `, [totalCost, userId], function(err) {
              if (err) {
                reject({ error: 'Failed to update user balance', details: err.message });
                return;
              }

              // Save bid
              db.run(`
                INSERT INTO bids (user_id, market_id, option_chosen, quantity, bid_price)
                VALUES (?, ?, ?, ?, ?)
              `, [userId, marketId, optionChosen, quantity, currentPrice], function(err) {
                if (err) {
                  reject({ error: 'Failed to save bid', details: err.message });
                  return;
                }

                // Get updated user balance
                db.get('SELECT virtual_balance FROM users WHERE id = ?', [userId], (err, updatedUser) => {
                  if (err) {
                    reject({ error: 'Failed to get updated balance', details: err.message });
                    return;
                  }

                  const result = {
                    success: true,
                    newBalance: updatedUser.virtual_balance,
                    newYesPrice,
                    newNoPrice,
                    newYesVolume,
                    newNoVolume,
                    totalCost
                  };

                  resolve(result);
                });
              });
            });
          });
        });
      });
    });
  });
}

// Function: resolve_market(market_id, winning_option)
async function resolveMarket(marketId, winningOption) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Update market status
      const newStatus = winningOption === 'yes' ? 'resolved_yes' : 'resolved_no';
      
      db.run('UPDATE markets SET status = ? WHERE id = ?', [newStatus, marketId], function(err) {
        if (err) {
          reject({ error: 'Failed to update market status', details: err.message });
          return;
        }

        // Get all bids for this market
        db.all('SELECT * FROM bids WHERE market_id = ?', [marketId], (err, bids) => {
          if (err) {
            reject({ error: 'Failed to get bids', details: err.message });
            return;
          }

          const winningBids = bids.filter(bid => bid.option_chosen === winningOption);
          const losingBids = bids.filter(bid => bid.option_chosen !== winningOption);

          if (winningBids.length === 0) {
            resolve({ success: true, message: 'No winning bids to distribute' });
            return;
          }

          // Calculate total losing amount
          const totalLosingAmount = losingBids.reduce((sum, bid) => sum + (bid.quantity * bid.bid_price), 0);
          
          // Calculate total winning shares
          const totalWinningShares = winningBids.reduce((sum, bid) => sum + bid.quantity, 0);

          // Distribute winnings proportionally
          const winningsUpdates = winningBids.map(bid => {
            const share = bid.quantity / totalWinningShares;
            const winnings = totalLosingAmount * share;
            return { userId: bid.user_id, winnings };
          });

          // Update user balances
          let completedUpdates = 0;
          winningsUpdates.forEach(({ userId, winnings }) => {
            db.run(`
              UPDATE users 
              SET virtual_balance = virtual_balance + ? 
              WHERE id = ?
            `, [winnings, userId], function(err) {
              if (err) {
                console.error('Failed to update user balance:', err);
              }
              completedUpdates++;
              
              if (completedUpdates === winningsUpdates.length) {
                resolve({ 
                  success: true, 
                  message: 'Market resolved successfully',
                  totalWinnings: totalLosingAmount,
                  winningBids: winningBids.length
                });
              }
            });
          });
        });
      });
    });
  });
}

// API Routes
app.get('/api/markets', (req, res) => {
  db.all('SELECT * FROM markets ORDER BY created_at DESC', (err, markets) => {
    if (err) {
      res.status(500).json({ error: 'Database error', details: err.message });
      return;
    }
    res.json(markets);
  });
});

app.get('/api/markets/:id', (req, res) => {
  const marketId = req.params.id;
  db.get('SELECT * FROM markets WHERE id = ?', [marketId], (err, market) => {
    if (err) {
      res.status(500).json({ error: 'Database error', details: err.message });
      return;
    }
    if (!market) {
      res.status(404).json({ error: 'Market not found' });
      return;
    }
    res.json(market);
  });
});

app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  db.get('SELECT id, username, virtual_balance FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      res.status(500).json({ error: 'Database error', details: err.message });
      return;
    }
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  });
});

app.post('/api/place-bid', async (req, res) => {
  try {
    const { userId, marketId, optionChosen, quantity } = req.body;
    
    if (!userId || !marketId || !optionChosen || !quantity) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const result = await placeBid(userId, marketId, optionChosen, quantity);
    
    // Emit real-time update to all clients
    io.emit('market-update', {
      marketId,
      newYesPrice: result.newYesPrice,
      newNoPrice: result.newNoPrice,
      newYesVolume: result.newYesVolume,
      newNoVolume: result.newNoVolume
    });

    io.emit('user-update', {
      userId,
      newBalance: result.newBalance
    });

    res.json(result);
  } catch (error) {
    res.status(400).json(error);
  }
});

app.post('/api/resolve-market', async (req, res) => {
  try {
    const { marketId, winningOption } = req.body;
    
    if (!marketId || !winningOption) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const result = await resolveMarket(marketId, winningOption);
    
    // Emit real-time update to all clients
    io.emit('market-resolved', {
      marketId,
      winningOption,
      newStatus: winningOption === 'yes' ? 'resolved_yes' : 'resolved_no'
    });

    res.json(result);
  } catch (error) {
    res.status(400).json(error);
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend should connect to: http://localhost:${PORT}`);
});
