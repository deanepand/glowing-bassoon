// Express Server - REST API Boilerplate
// A minimal Express.js server with middleware and routes

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory data store
const store = {
  items: [
    { id: 1, name: "First Item", status: "active", createdAt: new Date() },
    { id: 2, name: "Second Item", status: "pending", createdAt: new Date() },
  ],
  nextId: 3,
};

// Routes
app.get("/api/items", (req, res) => {
  const { status, search } = req.query;
  let results = [...store.items];

  if (status) {
    results = results.filter((item) => item.status === status);
  }
  if (search) {
    results = results.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  res.json({ data: results, total: results.length });
});

app.get("/api/items/:id", (req, res) => {
  const item = store.items.find((i) => i.id === parseInt(req.params.id));
  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }
  res.json({ data: item });
});

app.post("/api/items", (req, res) => {
  const { name, status = "active" } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  const newItem = {
    id: store.nextId++,
    name,
    status,
    createdAt: new Date(),
  };

  store.items.push(newItem);
  res.status(201).json({ data: newItem });
});

app.delete("/api/items/:id", (req, res) => {
  const index = store.items.findIndex((i) => i.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: "Item not found" });
  }

  store.items.splice(index, 1);
  res.status(204).send();
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
