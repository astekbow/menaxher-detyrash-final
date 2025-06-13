const path = require('path');
const Task = require('../models/Task');

/* ----------------------------------------------------------
   GET /api/tasks         – list tasks for current user
---------------------------------------------------------- */
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).send('Fetch error');
  }
};

/* ----------------------------------------------------------
   POST /api/tasks        – create task
---------------------------------------------------------- */
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority = 'Low',
      status   = 'To Do',
      deadline,
      tags = [],
    } = req.body;

    if (!title) return res.status(400).json({ msg: 'Title is required' });

    const fileUrl = req.file ? `/uploads/${path.basename(req.file.path)}` : undefined;

    const task = await Task.create({
      title,
      description,
      priority,
      status,
      deadline,
      tags,
      fileUrl,
      user: req.userId,           // ← use req.userId
    });

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).send('Task creation error');
  }
};

/* ----------------------------------------------------------
   PUT /api/tasks/:id     – update task
---------------------------------------------------------- */
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).send('Update error');
  }
};

/* ----------------------------------------------------------
   DELETE /api/tasks/:id  – delete task
---------------------------------------------------------- */
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    res.json({ msg: 'Task deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Delete error');
  }
};
