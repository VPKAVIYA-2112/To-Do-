const mongoose = require('mongoose');
const TaskList = require('./TaskList');
const TaskItem = require('./TaskItem');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  nickname: { type: String },
  lastLogin: { type: Date, default: Date.now }
});

// Cascade delete related taskLists and taskItems
UserSchema.post('deleteOne', { document: true, query: false }, async function (doc) {
  const userEmail = doc.email;

  // Get all task lists by user
  const taskLists = await TaskList.find({ userEmail });

  // Delete all task items inside those lists
  const taskListIds = taskLists.map(list => list._id);
  await TaskItem.deleteMany({ taskListId: { $in: taskListIds } });

  // Delete all the task lists
  await TaskList.deleteMany({ userEmail });

  console.log(`Deleted taskLists and taskItems for user: ${userEmail}`);
});

module.exports = mongoose.model('User', UserSchema);
