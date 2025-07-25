const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.options("*", cors());
app.use(bodyParser.json());

// Пример данных товаров
let items = [
  {
    id: "rec43w3ipXvP28vog",
    fields: {
      company: "Тоқии",
      colors: ["#f15025", "#222"],
      featured: true,
      price: 15,
      name: "Тоқии мардона",
      image: [
        {
          id: "attcvDDMikF6G2iNi",
          width: 1000,
          height: 639,
          url: "https://avatars.dzeninfra.ru/get-zen_doc/49613/pub_5cb34449456a7000b3a1b496_5cb34476770b5c00af94214c/scale_1200",
          filename: "product-1.jpeg",
          size: 62864,
          type: "image/jpeg",
          thumbnails: {
            small: { url: "https://course-api.com/images/store/product-1.jpeg", width: 56, height: 36 },
            large: { url: "https://course-api.com/images/store/product-1.jpeg", width: 801, height: 512 },
            full: { url: "https://course-api.com/images/store/product-1.jpeg", width: 3000, height: 3000 }
          }
        }
      ]
    }
  }
];

// Корзина
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

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  swaggerOptions: {
    validatorUrl: null,
  },
}));

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
  console.log(`📘 Swagger UI on http://localhost:${port}/api-docs`);
});
