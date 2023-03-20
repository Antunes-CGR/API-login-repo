const mongoose = require("mongoose")
const Task = require("../../models/Task")

const taskUpdateValidator = async (req, res, next) => {
  const { user_id } = res.locals
  const { _id } = req.params

  // validation -01 - _id eh valido?
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).json({ msg: "task id inválido" })
  }

  // validacao 01 - task existe? (opcional, a validacao 02 ja verifica se a task existe)
  const contarTasksComEsseID = await Task.count({ _id })
  if (contarTasksComEsseID === 0) {
    return res.status(404).json({ erro: "Task nao existe" }) // nao encontrado
  }

  // validacao 02 - task eh do usuario?
  const taskDoUsuario = await Task.findOne({ _id, user_id })
  if (!taskDoUsuario) {
    return res.status(403).json({ erro: "Voce nao pode alterar essa task" }) // nao autorizado
  }

  next()
}

module.exports = {
  taskUpdateValidator
}