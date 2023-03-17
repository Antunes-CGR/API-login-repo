const mongoose = require("mongoose")

const Task = mongoose.model("Task", {
  user_id: String,
  titulo: String,
  created_at: Date,
  completed_at: Date,
})

module.exports = Task