const User = require('../models/User');
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    // sample tasks
    const sampleTasks = [
      { title: 'Dërgo email ekipit', description: 'Njofto ekipin për planin javor.', user: user._id },
      { title: 'Përfundo prezantimin', description: 'Prezantimi për mbledhjen e ardhshme.', user: user._id },
      { title: 'Mblidh feedback nga klienti', description: 'Pyet klientët për sugjerime të reja.', user: user._id }
    ];
    await Task.insertMany(sampleTasks);
    res.json({ message: 'User registered' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const isMatch = await require('bcrypt').compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
