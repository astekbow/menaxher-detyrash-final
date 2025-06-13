const express = require("express");
const router  = express.Router();
const Task    = require("../models/Task");
const auth    = require("../middleware/auth");

/* ---------- LIST ---------- */
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).send("Fetch error");
  }
});

/* ---------- CREATE ---------- */
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, priority = "Low", status = "To Do", deadline, tags = [], fileUrl } = req.body;
    if (!title) return res.status(400).json({ msg: "Title is required" });

    const task = await Task.create({ title, description, priority, status, deadline, tags, fileUrl, user: req.userId });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).send("Task creation error");
  }
});

/* ---------- UPDATE ---------- */
router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ msg: "Task not found" });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).send("Update error");
  }
});

/* ---------- DELETE ---------- */
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ msg: "Task not found" });
    res.json({ msg: "Task removed" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Delete error");
  }
});

module.exports = router;
