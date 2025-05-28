const mongoose = require('mongoose');

const TaskListSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  title: { type: String, required: true }, // e.g., "Work", "Personal"
}, { timestamps: true });

module.exports = mongoose.model('TaskList', TaskListSchema);
