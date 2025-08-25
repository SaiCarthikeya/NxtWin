import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'nxtwin.db');
const db = new sqlite3.Database(dbPath);

// Quick add some exciting markets
const markets = [
  "Will India win the T20 World Cup 2024?",
  "Will it rain in Mumbai on Independence Day?",
  "Will Ethereum reach $5000 this year?",
  "Will Apple launch a foldable iPhone in 2024?",
  "Will Virat Kohli score a century in the next match?",
  "Will the Sensex cross 80,000 points by December?",
  "Will there be a total solar eclipse visible from India?",
  "Will Taylor Swift release a new album in 2024?"
];

db.serialize(() => {
  console.log('Adding new markets...');
  
  markets.forEach((question, index) => {
    db.run(`
      INSERT INTO markets (question, status, yes_price, no_price, yes_volume, no_volume)
      VALUES (?, 'open', 0.5, 0.5, 0.0, 0.0)
    `, [question], function(err) {
      if (err) {
        console.log(`Market ${index + 1} already exists or error: ${err.message}`);
      } else {
        console.log(`✅ Added: ${question.substring(0, 40)}...`);
      }
    });
  });
  
  setTimeout(() => {
    console.log('\n🎉 Markets added! Check your frontend now.');
    db.close();
  }, 1000);
});
