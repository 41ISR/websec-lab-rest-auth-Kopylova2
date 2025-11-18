const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");
const express = require("express");

const salt = "secret-key";
const SECRET = "this-is-for-JWT";

const app = express();

app.use(express.json());

app.post("/api/auth/register", async (req, res) => {
  const { email, username, password, role } = req.body;
  try {
    if (!email || !username || !password || !role) {
      return res.status(400).json({ error: "Отсутствуют обязательные поля." });
    }

    const existingUser = await db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (existingUser) {
      return res.status(409).json({ error: "Пользователь с данным email уже существует." });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const insertQuery = db.prepare("INSERT INTO users (email, username, password, role) VALUES (?, ?, ?, ?)");
    const result = insertQuery.run(email, username, hashPassword, role);

    const newUser = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
    delete newUser.password;
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Требуется ввести email и пароль." });
    }

    const user = await db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
      return res.status(401).json({ error: "Неверный email или пароль." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Неверный email или пароль." });
    }

    const {password: _password, ..._user} = user    
    const token = jwt.sign({ ..._user }, SECRET, { expiresIn: "1h" });
    res.status(200).json({ token: token, ..._user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера." });
  }
});

app.get("/api/auth/profile", verifyToken, (req, res) => {
  try {
    console.log(db.prepare("SELECT * FROM users").all());
    
    const userProfile = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
    console.log(userProfile);
    console.log(req.user.id);
    
    
    res.status(200).json(userProfile);

  }catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера." });
  }
});

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization
    if (!authHeader) res.status(401).json({error: "Нет токена авторизации"})

    if (!(authHeader.split(" ")[1])) res.status(401).json({error: "Неверный формат токена"})

    try {
        const token = authHeader.split(" ")[1]
        const decoded = jwt.verify(token, SECRET)
        req.user = decoded
        next()
    } catch (error) {
      res.status(401).json({error: "Неправильный токен"})
        console.error(error)
    }
}

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});