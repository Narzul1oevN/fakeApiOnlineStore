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

// Секрет для JWT (в реальном проекте — в .env)
const JWT_SECRET = "your_jwt_secret_key";

// Пользователи в памяти
const users = [];

// Данные в памяти
let items = [];
let cart = [];

// --- Регистрация ---
app.post("/auth/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Username and password required" });

  if (users.find(u => u.username === username))
    return res.status(409).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });

  res.status(201).json({ message: "User registered" });
});

// --- Логин ---
app.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user)
    return res.status(401).json({ message: "Invalid credentials" });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid)
    return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// --- Middleware для JWT ---
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

// --- Пример защищённого роута ---
app.get("/profile", authenticateToken, (req, res) => {
  res.json({ message: `Hello ${req.user.username}! This is your profile.` });
});

// --- Routes: Items ---
app.get("/items", (req, res) => {
  res.json(items);
});
app.get("/items/:id", (req, res) => {
  const item = items.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.json(item);
});
app.post("/items", (req, res) => {
  const item = req.body;
  items.push(item);
  res.status(201).json(item);
});
app.put("/items/:id", (req, res) => {
  const index = items.findIndex(i => i.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Item not found" });
  items[index] = req.body;
  res.json(items[index]);
});
app.delete("/items/:id", (req, res) => {
  const index = items.findIndex(i => i.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Item not found" });
  items.splice(index, 1);
  res.sendStatus(204);
});

// --- Routes: Cart ---
app.get("/cart", (req, res) => {
  res.json(cart);
});
app.get("/cart/:id", (req, res) => {
  const item = cart.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ message: "Cart item not found" });
  res.json(item);
});
app.post("/cart", (req, res) => {
  const item = req.body;
  cart.push(item);
  res.status(201).json(item);
});
app.put("/cart/:id", (req, res) => {
  const index = cart.findIndex(i => i.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Cart item not found" });
  cart[index] = req.body;
  res.json(cart[index]);
});
app.delete("/cart/:id", (req, res) => {
  const index = cart.findIndex(i => i.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Cart item not found" });
  cart.splice(index, 1);
  res.sendStatus(204);
});

// --- Swagger UI ---
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  swaggerOptions: { validatorUrl: null },
}));

// --- Error handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal server error");
});

// --- Запуск сервера ---
const port = process.env.PORT || 0;
const server = app.listen(port, () => {
  const actualPort = server.address().port;
  console.log(`✅ Server running on http://localhost:${actualPort}`);
  console.log(`📘 Swagger UI on http://localhost:${actualPort}/api-docs`);
});
