const { model, Schema } = require("mongoose");

const TaskBook = new Schema({
  titulo: String,
  autor: String,
  ISBN: String,
});

module.exports = model("book", TaskBook);
