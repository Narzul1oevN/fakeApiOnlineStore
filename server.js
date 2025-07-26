const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

const swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"));

const app = express();

// --- CORS ---
app.use(cors()); // 👈 этого достаточно, разрешает всё
// Если хочешь ограничить: app.use(cors({ origin: "https://твой-фронт.vercel.app" }))

// --- Middleware ---
app.use(bodyParser.json());

// --- ДАННЫЕ ---
let items = [/* ...твой массив items, как раньше... */];
let cart = [];

// --- ITEMS ---
app.get("/items", (req, res) => res.json(items));
app.get("/items/:id", (req, res) => {
  const item = items.find(i => i.id === req.params.id);
  if (!item) return res.status(404).send("Item not found");
  res.json(item);
});
app.post("/items", (req, res) => {
  const item = req.body;
  items.push(item);
  res.status(201).json(item);
});
app.put("/items/:id", (req, res) => {
  const index = items.findIndex(i => i.id === req.params.id);
  if (index === -1) return res.status(404).send("Item not found");
  items[index] = req.body;
  res.json(items[index]);
});
app.delete("/items/:id", (req, res) => {
  const index = items.findIndex(i => i.id === req.params.id);
  if (index === -1) return res.status(404).send("Item not found");
  items.splice(index, 1);
  res.sendStatus(204);
});

// --- CART ---
app.get("/cart", (req, res) => res.json(cart));
app.get("/cart/:id", (req, res) => {
  const item = cart.find(i => i.id === req.params.id);
  if (!item) return res.status(404).send("Cart item not found");
  res.json(item);
});
app.post("/cart", (req, res) => {
  const item = req.body;
  cart.push(item);
  res.status(201).json(item);
});
app.put("/cart/:id", (req, res) => {
  const index = cart.findIndex(i => i.id === req.params.id);
  if (index === -1) return res.status(404).send("Cart item not found");
  cart[index] = req.body;
  res.json(cart[index]);
});
app.delete("/cart/:id", (req, res) => {
  const index = cart.findIndex(i => i.id === req.params.id);
  if (index === -1) return res.status(404).send("Cart item not found");
  cart.splice(index, 1);
  res.sendStatus(204);
});

// --- Swagger ---
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  swaggerOptions: {
    validatorUrl: null,
  },
}));

// --- Error handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal server error");
});

// --- Start ---
const port = process.env.PORT || 0; // 0 = выбрать свободный порт
const server = app.listen(port, () => {
  const actualPort = server.address().port;
  console.log(`✅ Server running on http://localhost:${actualPort}`);
  console.log(`📘 Swagger UI on http://localhost:${actualPort}/api-docs`);
});
