const mongoose = require('mongoose');

const TaskItemSchema = new mongoose.Schema({
  taskListId: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskList', required: true },
  title: { type: String, required: true },
  description: String,
  dueDate: Date,
  status: { type: String, enum: ['Open', 'Complete'], default: 'Open' },
}, { timestamps: true });

module.exports = mongoose.model('TaskItem', TaskItemSchema);
