const db = require("./db");
const express = require("express");

const app = express();

app.use(express.json());

// Добавляем пользователя
const insertUser = db.prepare(
  'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)'
);
const result = insertUser.run('Alice', 'alice@example.com', 'password!', 'user');

const lastInsertedId = result.lastInsertRowid;

// Добавляем книгу
const insertBook = db.prepare(
  'INSERT INTO books (title, author, year, genre, description, createdBy) VALUES (?, ?, ?, ?, ?, ?)'
);
insertBook.run('The Great Adventure', 'Alice Johnson', 2023, 'Fantasy', 'A great adventure story', lastInsertedId);

console.log(`User added with ID ${lastInsertedId}`);

// Выборка книг с информацией о пользователе, который их создал
const booksWithUsers = db
  .prepare(
    `
      SELECT books.id, books.title, books.author, users.username AS added_by 
      FROM books 
      JOIN users ON books.createdBy = users.id
    `
  )
  .all();

console.log(booksWithUsers);

const email = 'alice@example.com';
const user = db
  .prepare('SELECT * FROM users WHERE email = ?')
  .get(email);

if (user) {
  console.log(`Found user: ${JSON.stringify(user)}`);
} else {
  console.log('No user found for the given email.');
}

// Простая аутентификационная мидлварка
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token || token !== 'secret-token') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Имитация успешного входа пользователя
  req.user = { id: 1, username: 'test-user', role: 'admin' };

  next();
};

// Создаем мидлварку, которая будет проверять роль
function checkRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Доступ запрещен: недостаточно прав' });
    }

    next();
  };
};

// Использование мидлварки checkRole
app.get('/users', auth, checkRole('admin'), (req, res) => {
  // Обработчик маршрута для пользователей с ролью администратора
  res.json({ message: 'Привет администратор!' });
});

// Альтернативный вариант проверки роли прямо в запросе
app.post('/users', auth, (req, res) => {
  if (!['admin'].includes(req.user.role)) {
    return res
      .status(403)
      .json({ message: 'Доступ запрещен: недостаточно прав' });
  }

// Логика обработки POST-запроса для пользователей с ролью администратора
  res.json({ message: 'POST-запрос успешно выполнен!' });
});

// Запуск сервера Express
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});