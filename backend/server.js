require("dotenv").config();

const express = require("express");
const cors = require("cors");
const getDb = require("./config/db");

const adminAuthRoutes = require("./routes/adminAuth");
const adminRoutes = require("./routes/admin");
const voterRoutes = require("./routes/voter");

const districts = require("./config/districts.json");
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/districts", (req, res) => {
  res.json(districts);
});

app.use("/api/voter", voterRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

async function startServer() {
  try {
    await getDb();
    console.log("Database ready");

    app.listen(PORT, () => {
      console.log(`EVoting backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
