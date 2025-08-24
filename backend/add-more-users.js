import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'nxtwin.db');
const db = new sqlite3.Database(dbPath);

const newUsers = [
  { username: 'crypto_trader', virtual_balance: 2500.0 },
  { username: 'sports_fan', virtual_balance: 1800.0 },
  { username: 'weather_expert', virtual_balance: 1200.0 },
  { username: 'tech_enthusiast', virtual_balance: 3000.0 },
  { username: 'movie_buff', virtual_balance: 1500.0 },
  { username: 'stock_investor', virtual_balance: 5000.0 },
  { username: 'cricket_lover', virtual_balance: 2200.0 },
  { username: 'news_follower', virtual_balance: 900.0 },
  { username: 'science_geek', virtual_balance: 1100.0 },
  { username: 'entertainment_fan', virtual_balance: 1600.0 }
];

db.serialize(() => {
  console.log('Adding new users to the platform...');
  
  let addedCount = 0;
  
  newUsers.forEach((user, index) => {
    db.run(`
      INSERT INTO users (username, virtual_balance)
      VALUES (?, ?)
    `, [user.username, user.virtual_balance], function(err) {
      if (err) {
        console.error(`Error adding user ${index + 1}:`, err.message);
      } else {
        addedCount++;
        console.log(`✅ Added user: ${user.username} with ₹${user.virtual_balance} balance`);
      }
      
      if (addedCount === newUsers.length) {
        console.log(`\n🎉 Successfully added ${addedCount} new users!`);
        console.log('Your NxtWin platform now has multiple participants for trading!');
        db.close();
      }
    });
  });
});
