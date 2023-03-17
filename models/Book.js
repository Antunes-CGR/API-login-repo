const { model, Schema } = require("mongoose");

const TaskBook = new Schema({
  user_id: String,
  titulo: String,
  autor: String,
  ISBN: String,
});

module.exports = model("book", TaskBook);
