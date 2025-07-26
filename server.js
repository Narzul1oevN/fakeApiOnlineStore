const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"));
const app = express();

app.use(cors());
app.use(bodyParser.json());

// Секрет для JWT (в реальном проекте в .env)
const JWT_SECRET = "your_jwt_secret_key";

// Хранилище пользователей (для примера — в памяти)
const users = [];

// --- Регистрация ---
app.post("/auth/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Username and password required" });

  // Проверка, есть ли уже пользователь
  const existingUser = users.find(u => u.username === username);
  if (existingUser)
    return res.status(409).json({ message: "User already exists" });

  // Хешируем пароль
  const hashedPassword = await bcrypt.hash(password, 10);

  // Добавляем пользователя
  users.push({ username, password: hashedPassword });

  res.status(201).json({ message: "User registered" });
});

// --- Вход (логин) ---
app.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user)
    return res.status(401).json({ message: "Invalid credentials" });

  // Сравниваем пароли
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid)
    return res.status(401).json({ message: "Invalid credentials" });

  // Генерируем JWT токен
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });

  res.json({ token });
});

// --- Middleware для защиты роутов ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token required" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

// --- Пример защищённого роутера ---
app.get("/profile", authenticateToken, (req, res) => {
  res.json({ message: `Hello ${req.user.username}! This is your profile.` });
});

// --- Твои текущие маршруты items и cart ---
// ... как есть, или можно защитить некоторые из них через authenticateToken

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  swaggerOptions: { validatorUrl: null },
}));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal server error");
});

// Start server
const port = process.env.PORT || 0;
const server = app.listen(port, () => {
  const actualPort = server.address().port;
  console.log(`✅ Server running on http://localhost:${actualPort}`);
  console.log(`📘 Swagger UI on http://localhost:${actualPort}/api-docs`);
});
