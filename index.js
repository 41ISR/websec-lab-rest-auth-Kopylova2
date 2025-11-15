const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const db = require("./db")
const express = require("express")

const salt = "secret-key"
const SECRET = "this-is-for-JWT"

const app = express()

app.use(express.json())

// Добавка пользователя
app.post("/api/auth/register", (req, res) => {
  const { email, name, password, role } = req.body

    try {
        if (!email || !name || !password || !role) {
            return res.status(400).json({ error: "Не хватает данных" })
        }
        const syncSalt = bcrypt.genSaltSync(10)
        const hashed = bcrypt.hashSync(password, syncSalt)
        const query = db.prepare(
            `INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)`
        )
        const info = query.run(email, name, hashed)
        const newUser = db
            .prepare(`SELECT * FROM users WHERE ID = ?`)
            .get(info.lastInsertRowid)
        res.status(201).json(newUser)
    } catch (error) {
        console.error(error)
        res.status(401).json({error: "Неправильный токен"})
    }
});
//получение информации о пользователе
app.get("/api/auth/profile", (req, res) => {
  const lastInsertedId = result.lastInsertRowid;
});

// Добавка книгу
app.post("/api/books", (req, res) => {const insertBook = db.prepare(
    'INSERT INTO books (title, author, year, genre, description, createdBy) VALUES (?, ?, ?, ?, ?, ?)');
  insertBook.run('The Great Adventure', 'Alice Johnson', 2023, 'Fantasy', 'A great adventure story', lastInsertedId);

  console.log(`User added with ID ${lastInsertedId}`); //сообщение о добавленном пользователе
});

// Вce books
app.get("/api/books", (req, res) => {
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
});
//поиск пользователя по почте
const email = 'alice@example.com';
const user = db
  .prepare('SELECT * FROM users WHERE email = ?')
  .get(email);
if (user) {
  console.log(`Found user: ${JSON.stringify(user)}`);
} else {
  console.log('No user found for the given email.');
}

//мидлварка аутен
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token || token !== 'secret-token') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  //успешный вход пользователя
  req.user = { id: 1, username: 'test-user', role: 'admin' };

  next();
};

//мидлварку проверка роль
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

// для админа проверка роли
app.get('/api/users', auth, checkRole('admin'), (req, res) => {
  res.json({ message: 'админ' });
});

// 2 вариант проверки роли
app.post('/api/role', auth, (req, res) => {
  if (!['admin'].includes(req.user.role)) {
    return res
      .status(403)
      .json({ message: 'Доступ запрещен: недостаточно прав(юзер)' });
  }

  res.json({ message: 'POST-запрос успешно выполнен!' });
});

// сервер Express
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});