const Database = require('better-sqlite3');

const db = new Database("library.db");

db.pragma('foreign_keys = ON');


// Таблица Users
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,      
    role TEXT NOT NULL CHECK(role IN ('user', 'admin')),   
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP       
  );
`);


db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    year INTEGER NOT NULL,
    genre TEXT NOT NULL,
    description TEXT,
    createdBy INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(createdBy) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
  );
`);


db.exec(`
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bookId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(bookId) REFERENCES books(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
  );
`);

module.exports = db;