const mongoose = require("mongoose")
const { Schema } = require("mongoose")

const TaskBook = mongoose.model("Book", {
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  titulo: String,
  autor: String,
  ISBN: String,
})

module.exports = TaskBook
