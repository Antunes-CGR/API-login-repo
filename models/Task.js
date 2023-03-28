const mongoose = require("mongoose")
const { Schema } = require("mongoose")



const Task = mongoose.model("Task", {
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  titulo: String,
  created_at: Date,
  completed_at: Date,
})

module.exports = Task