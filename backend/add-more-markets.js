import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'nxtwin.db');
const db = new sqlite3.Database(dbPath);

const newMarkets = [
  // Sports & Entertainment
  {
    question: "Will India win the T20 World Cup 2024?",
    status: 'open',
    yes_price: 0.5,
    no_price: 0.5,
    yes_volume: 0.0,
    no_volume: 0.0
  },
  {
    question: "Will the next Bollywood movie 'Animal 2' cross ₹1000 crore worldwide?",
    status: 'open',
    yes_price: 0.5,
    no_price: 0.5,
    yes_volume: 0.0,
    no_volume: 0.0
  },
  {
    question: "Will Virat Kohli score a century in the next ODI match?",
    status: 'open',
    yes_price: 0.5,
    no_price: 0.5,
    yes_volume: 0.0,
    no_volume: 0.0
  },

  // Weather & Environment
  {
    question: "Will it rain in Mumbai on Independence Day (15th August)?",
    status: 'open',
    yes_price: 0.5,
    no_price: 0.5,
    yes_volume: 0.0,
    no_volume: 0.0
  },
  {
    question: "Will Delhi's AQI be below 100 on Diwali this year?",
    status: 'open',
    yes_price: 0.5,
    no_price: 0.5,
    yes_volume: 0.0,
    no_volume: 0.0
  },
  {
    question: "Will there be a cyclone in the Bay of Bengal this monsoon season?",
    status: 'open',
    yes_price: 0.5,
    no_price: 0.5,
    yes_volume: 0.0,
    no_volume: 0.0
  },

  // Cryptocurrency & Finance
  {
    question: "Will Ethereum reach $5000 before the end of 2024?",
    status: 'open',
    yes_price: 0.5,
    no_price: 0.5,
    yes_volume: 0.0,
    no_volume: 0.0
  },
  {
    question: "Will the Sensex cross 80,000 points by December 2024?",
    status: 'open',
    yes_price: 0.5,
    no_price: 0.5,
    yes_volume: 0.0,
    no_volume: 0.0
  },
  {
    question: "Will the Indian Rupee strengthen against USD (below ₹80) this year?",
    status: 'open',
    yes_price: 0.5,
    no_price: 0.5,
    yes_volume: 0.0,
    no_volume: 0.0
  },

  // Technology & Innovation
  {
    question: "Will Apple launch a foldable iPhone in 2024?",
    status: 'open',
    yes_price: 0.5,
    no_price: 0.5,
    yes_volume: 0.0,
    no_volume: 0.0
  },
  {
    question: "Will SpaceX successfully land on Mars in 2024?",
    status: 'open',
    yes_price: 0.5,
    no_price: 0.5,
    yes_volume: 0.0,
    no_volume: 0.0
  },
  {
    question: "Will ChatGPT-5 be released to the public in 2024?",
    status: 'open',
    yes_price: 0.5,
    no_price: 0.5,
    yes_volume: 0.0,
    no_volume: 0.0
  },

  // Politics & Current Events
  {
    question: "Will the current government win the next general election?",
    status: 'open',
    yes_price: 0.5,
    no_price: 0.5,
    yes_volume: 0.0,
    no_volume: 0.0
  },
  {
    question: "Will India become the world's 3rd largest economy in 2024?",
    status: 'open',
    yes_price: 0.5,
    no_price: 0.5,
    yes_volume: 0.0,
    no_volume: 0.0
  },

  // Entertainment & Media
  {
    question: "Will 'Game of Thrones' spin-off 'House of the Dragon' win Best Drama at Emmy Awards?",
    status: 'open',
    yes_price: 0.5,
    no_price: 0.5,
    yes_volume: 0.0,
    no_volume: 0.0
  },
  {
    question: "Will Taylor Swift release a new album in 2024?",
    status: 'open',
    yes_price: 0.5,
    no_price: 0.5,
    yes_volume: 0.0,
    no_volume: 0.0
  },

  // Science & Discovery
  {
    question: "Will scientists discover a new species of dinosaur in 2024?",
    status: 'open',
    yes_price: 0.5,
    no_price: 0.5,
    yes_volume: 0.0,
    no_volume: 0.0
  },
  {
    question: "Will there be a total solar eclipse visible from India in 2024?",
    status: 'open',
    yes_price: 0.5,
    no_price: 0.5,
    yes_volume: 0.0,
    no_volume: 0.0
  }
];

db.serialize(() => {
  console.log('Adding new prediction markets...');
  
  let addedCount = 0;
  
  newMarkets.forEach((market, index) => {
    db.run(`
      INSERT INTO markets (question, status, yes_price, no_price, yes_volume, no_volume)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [market.question, market.status, market.yes_price, market.no_price, market.yes_volume, market.no_volume], function(err) {
      if (err) {
        console.error(`Error adding market ${index + 1}:`, err.message);
      } else {
        addedCount++;
        console.log(`✅ Added: ${market.question.substring(0, 50)}...`);
      }
      
      if (addedCount === newMarkets.length) {
        console.log(`\n🎉 Successfully added ${addedCount} new prediction markets!`);
        console.log('Your NxtWin platform now has many exciting events to trade on!');
        db.close();
      }
    });
  });
});
