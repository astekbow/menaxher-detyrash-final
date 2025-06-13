const express  = require("express");
const router   = express.Router();
const bcrypt   = require("bcrypt");
const jwt      = require("jsonwebtoken");
const multer   = require("multer");
const upload   = multer({ dest: "uploads/" });

const User = require("../models/User");
const auth = require("../middleware/auth");

/* ---------- REGISTER (username + password) ---------- */
router.post("/register", async (req, res) => {
  try {
    const { username, password, firstName, lastName } = req.body;
    if (!username || !password)
      return res.status(400).json({ msg: "Missing credentials" });

    if (await User.findOne({ username }))
      return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashed, firstName, lastName });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send("Register error");
  }
});

/* ---------- LOGIN (username + password) ---------- */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ msg: "Missing credentials" });

    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send("Login error");
  }
});

/* ---------- GET ME ---------- */
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

/* ---------- UPDATE ME ---------- */
router.put("/me", auth, async (req, res) => {
  try {
    const { firstName, lastName, password } = req.body;
    const update = { firstName, lastName };
    if (password) update.password = await bcrypt.hash(password, 10);

    const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send("Update error");
  }
});

/* ---------- AVATAR UPLOAD ---------- */
router.post("/avatar", [auth, upload.single("avatar")], async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { avatarUrl: `/uploads/${req.file.filename}` },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send("Upload error");
  }
});

module.exports = router;
