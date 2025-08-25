import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'nxtwin.db');
const db = new sqlite3.Database(dbPath);

// Quick add some users
const users = [
  { username: 'crypto_trader', balance: 2500 },
  { username: 'sports_fan', balance: 1800 },
  { username: 'weather_expert', balance: 1200 },
  { username: 'tech_enthusiast', balance: 3000 },
  { username: 'movie_buff', balance: 1500 }
];

db.serialize(() => {
  console.log('Adding new users...');
  
  users.forEach((user, index) => {
    db.run(`
      INSERT INTO users (username, virtual_balance)
      VALUES (?, ?)
    `, [user.username, user.balance], function(err) {
      if (err) {
        console.log(`User ${user.username} already exists or error: ${err.message}`);
      } else {
        console.log(`✅ Added user: ${user.username} with ₹${user.balance} balance`);
      }
    });
  });
  
  setTimeout(() => {
    console.log('\n🎉 Users added! Your platform now has multiple participants!');
    db.close();
  }, 1000);
});
