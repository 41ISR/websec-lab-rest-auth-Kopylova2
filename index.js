const db = require("./db")
const express = require("express")

const app = express()

app.use(express.json())

// Добавляем пользователя
const insertUser = db.prepare('INSERT INTO users (username, email) VALUES (?, ?)');
const result = insertUser.run('Alice', 'alice@example.com');

// Добавляем книгу, указывая id пользователя
const insertBook = db.prepare('INSERT INTO books (title, author, user_id) VALUES (?, ?, ?)');
insertBook.run('The Great Adventure', 'Alice Johnson', result.lastInsertRowid);

// либо если юзер уже существует
const userQuery = db.prepare('SELECT * FROM users WHERE id = ?')
const user = userQuery.get(id)

const book = db.prepare('INSERT INTO books (title, author, user_id) VALUES (?, ?, ?)');
insertBook.run('The Great Adventure', 'Alice Johnson', user.id);