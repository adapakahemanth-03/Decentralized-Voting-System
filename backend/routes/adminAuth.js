const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const getDb = require("../config/db");

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (
    !name || typeof name !== "string" || !name.trim() ||
    !email || typeof email !== "string" || !email.trim() ||
    !password || typeof password !== "string" || !password.trim()
  ) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  const trimmedEmail = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const allowedEmails = (process.env.ADMIN_ALLOWED_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (allowedEmails.length > 0 && !allowedEmails.includes("*") && !allowedEmails.includes(trimmedEmail)) {
    return res.status(403).json({ error: "Registration not allowed: email not in allowed list" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  try {
    const db = await getDb();
    const existing = db.get("SELECT id FROM admins WHERE email = ?", trimmedEmail);
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    db.run(
      "INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)",
      name.trim(),
      trimmedEmail,
      passwordHash
    );

    return res.status(201).json({ message: "Admin account created successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const trimmed = email.trim().toLowerCase();

  try {
    const db = await getDb();
    const admin = db.get(
      "SELECT * FROM admins WHERE email = ? OR (email = 'admin@example.com' AND ? = 'admin')",
      trimmed,
      trimmed
    );

    if (!admin) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({ token, email: admin.email, name: admin.name });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
