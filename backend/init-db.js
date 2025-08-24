import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'nxtwin.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      virtual_balance REAL DEFAULT 1000.0
    )
  `);

  // Create markets table
  db.run(`
    CREATE TABLE IF NOT EXISTS markets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      status TEXT DEFAULT 'open' CHECK(status IN ('open', 'closed', 'resolved_yes', 'resolved_no')),
      yes_price REAL DEFAULT 0.5,
      no_price REAL DEFAULT 0.5,
      yes_volume REAL DEFAULT 0.0,
      no_volume REAL DEFAULT 0.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create bids table
  db.run(`
    CREATE TABLE IF NOT EXISTS bids (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      market_id INTEGER NOT NULL,
      option_chosen TEXT NOT NULL CHECK(option_chosen IN ('yes', 'no')),
      quantity REAL NOT NULL,
      bid_price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (market_id) REFERENCES markets (id)
    )
  `);

  // Insert sample data
  db.run(`
    INSERT OR IGNORE INTO users (username, virtual_balance) VALUES 
    ('demo_user', 1000.0),
    ('test_user', 1000.0)
  `);

  db.run(`
    INSERT OR IGNORE INTO markets (question, status, yes_price, no_price, yes_volume, no_volume) VALUES 
    ('Will the temperature in Delhi be above 36°C before 25 Aug 3:00PM?', 'open', 0.5, 0.5, 0.0, 0.0),
    ('Will Bitcoin reach $100,000 by the end of 2024?', 'open', 0.5, 0.5, 0.0, 0.0)
  `);

  console.log('Database initialized successfully!');
});

db.close();
