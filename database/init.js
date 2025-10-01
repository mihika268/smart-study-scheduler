const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.dirname(__filename);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(__dirname, 'study_scheduler.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('📊 Connected to SQLite database');
});

// Create tables
const initDatabase = () => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT,
      theme TEXT DEFAULT 'light',
      color_scheme TEXT DEFAULT 'blue',
      preferred_study_hours INTEGER DEFAULT 2,
      timezone TEXT DEFAULT 'UTC',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Study tasks table
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      subject TEXT NOT NULL,
      priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
      status TEXT CHECK(status IN ('pending', 'in_progress', 'completed', 'missed')) DEFAULT 'pending',
      estimated_duration INTEGER NOT NULL, -- in minutes
      actual_duration INTEGER DEFAULT 0,
      due_date DATETIME,
      scheduled_start DATETIME,
      scheduled_end DATETIME,
      difficulty_level INTEGER CHECK(difficulty_level BETWEEN 1 AND 5) DEFAULT 3,
      tags TEXT, -- JSON array of tags
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Study sessions table
  db.run(`
    CREATE TABLE IF NOT EXISTS study_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      task_id INTEGER,
      start_time DATETIME NOT NULL,
      end_time DATETIME,
      duration INTEGER, -- in minutes
      mood_before INTEGER CHECK(mood_before BETWEEN 1 AND 5),
      mood_after INTEGER CHECK(mood_after BETWEEN 1 AND 5),
      energy_level INTEGER CHECK(energy_level BETWEEN 1 AND 5),
      focus_rating INTEGER CHECK(focus_rating BETWEEN 1 AND 5),
      notes TEXT,
      break_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE SET NULL
    )
  `);

  // User achievements/badges table
  db.run(`
    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      badge_type TEXT NOT NULL,
      badge_name TEXT NOT NULL,
      description TEXT,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // User streaks table
  db.run(`
    CREATE TABLE IF NOT EXISTS streaks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_study_date DATE,
      total_study_days INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Motivational quotes table
  db.run(`
    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      author TEXT,
      category TEXT DEFAULT 'motivation',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User preferences table
  db.run(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      pomodoro_duration INTEGER DEFAULT 25, -- in minutes
      short_break_duration INTEGER DEFAULT 5,
      long_break_duration INTEGER DEFAULT 15,
      notifications_enabled BOOLEAN DEFAULT 1,
      sound_enabled BOOLEAN DEFAULT 1,
      daily_goal_hours INTEGER DEFAULT 2,
      preferred_difficulty INTEGER DEFAULT 3,
      auto_reschedule BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  console.log('✅ Database tables created successfully');
  
  // Insert sample motivational quotes
  insertSampleQuotes();
};

const insertSampleQuotes = () => {
  const quotes = [
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "motivation" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "perseverance" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "passion" },
    { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela", category: "education" },
    { text: "The expert in anything was once a beginner.", author: "Helen Hayes", category: "learning" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "persistence" },
    { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King", category: "learning" },
    { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier", category: "consistency" },
    { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins", category: "motivation" },
    { text: "Your limitation—it's only your imagination.", author: "Unknown", category: "mindset" }
  ];

  // Wait a bit for tables to be created, then insert quotes
  setTimeout(() => {
    const stmt = db.prepare("INSERT OR IGNORE INTO quotes (text, author, category) VALUES (?, ?, ?)");
    quotes.forEach(quote => {
      stmt.run(quote.text, quote.author, quote.category);
    });
    stmt.finalize();
    
    console.log('📝 Sample quotes inserted');
  }, 100);
};

// Initialize database
initDatabase();

// Close database connection after a delay to ensure all operations complete
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
      return;
    }
    console.log('🔒 Database connection closed');
    process.exit(0);
  });
}, 500);

module.exports = { dbPath };
