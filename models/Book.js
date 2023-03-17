const { model, Schema } = require("mongoose");

const TaskBook = new Schema({
  titulo: String,
  autor: String,
  ISBN: Number,
});

module.exports = model("book", TaskBook);
