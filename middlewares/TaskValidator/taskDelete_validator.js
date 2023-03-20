const mongoose = require("mongoose")

const taskDeleteValidator = async (req, res, next) => {
  const id = req.params.id

  // validation
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ msg: "task id inválido" })
  }
  next()
}

module.exports = {
  taskDeleteValidator
}