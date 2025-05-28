const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const TaskList = require('./models/TaskList');
const TaskItem = require('./models/TaskItem');

const app = express();
app.use(cors());
app.use(express.json());

// 🔗 Connect MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/todoDB')
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));


// ✅ Save or update user
app.post('/api/save-user', async (req, res) => {
  const { email, nickname } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    let user = await User.findOne({ email });

    if (!user) {
      // New user must include nickname
      if (!nickname) {
        return res.status(202).json({ message: 'New user. Nickname required.' });
      }
      user = new User({ email, nickname });
      await user.save();
    } else {
      user.lastLogin = new Date();
      await user.save();
    }

    res.status(200).json({ message: 'User saved', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});



// ✅ Create Task List
app.post('/api/tasklists', async (req, res) => {
  const { userEmail, title } = req.body;
  if (!userEmail || !title) return res.status(400).json({ error: 'Missing fields' });

  try {
    const taskList = new TaskList({ userEmail, title });
    await taskList.save();
    res.status(201).json(taskList);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task list' });
  }
});

// ✅ Get Task Lists by user
app.get('/api/tasklists', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const taskLists = await TaskList.find({ userEmail: email });
    res.json(taskLists);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch task lists' });
  }
});

// ✅ Rename Task List
app.put('/api/tasklists/:id', async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });

  try {
    const updated = await TaskList.findByIdAndUpdate(id, { title }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task list' });
  }
});

// ✅ Delete Task List + its Tasks
app.delete('/api/tasklists/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await TaskItem.deleteMany({ taskListId: id });
    await TaskList.findByIdAndDelete(id);
    res.json({ message: 'Task list and its items deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task list' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await TaskItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});


// ✅ Create Task
app.post('/api/tasks', async (req, res) => {
  const { taskListId, title, description, dueDate } = req.body;
  if (!taskListId || !title) return res.status(400).json({ error: 'Missing fields' });

  try {
    const task = new TaskItem({ taskListId, title, description, dueDate });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// ✅ Get Tasks by Task List ID
app.get('/api/tasks', async (req, res) => {
  const { taskListId } = req.query;
  if (!taskListId) return res.status(400).json({ error: 'Task List ID required' });

  try {
    const tasks = await TaskItem.find({ taskListId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// ✅ Update Task (rename, status, description, due date)
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const updated = await TaskItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// ✅ Delete User (cascades tasklists & items via model hook)
app.delete('/api/user', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.deleteOne(); // triggers cascade delete via User model
    res.json({ message: 'User and related data deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
