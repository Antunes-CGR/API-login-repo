

//imports
const Task = require("../models/Task")


class ControllerTask {
  async getTask (req, res) {
    const { user_id } = res.locals
  
    const {page, limit} = req.query
    const skip = (page - 1) * limit //Conta fixa para paginação
    const sort = ({ titulo: 1 })
  
    const tasks = await Task.find({ user_id }, null, {limit, skip, sort}) // Paginação
  
    const totalTask = await Task.count({user_id}) //critério de contagem
    const totalPages = Math.ceil(totalTask / limit) // Mostrar limite de paginas ao usuário
  
    return res.status(200).json({tasks, totalPages})
  }
  async postTask (req, res) {
    const { user_id } = res.locals

    const TaskCreate = await Task.create({
      user_id,
      titulo: req.body.titulo,
      created_at: new Date(),
      completed_at: null,
    })
  
    return res.status(201).json(TaskCreate)
  }
  async putTask (req, res) {
    try {

      const { user_id } = res.locals
      const { _id } = req.params
  
      const taskDoUsuario = await Task.findOne({ _id, user_id })
  
      taskDoUsuario.titulo = req.body.titulo
      await taskDoUsuario.save()
  
      return res.status(200).json(taskDoUsuario)
    } catch (erro) {
      console.log(erro)
    }
  }
  async putTaskCompleted (req, res) {
    try {
      // validar se a task pertence ao usuario
  
      const { _id } = req.params
      const { user_id } = res.locals
  
      const taskDoUsuario = await Task.findOne({ _id, user_id })
  
      if (!taskDoUsuario) {
        return res.status(404).json({ msg: "Usuário não autorizado" })
      }
  
      // const taskCompleted = await Task.findOneAndUpdate( {_id}, {completed_at: new Date()})
  
      taskDoUsuario.completed_at = new Date()
      await taskDoUsuario.save()
      return res.status(200).json(taskDoUsuario)
    } catch (error) {
      console.log(error)
    } 
  }
  async destroyTask (req, res) {
    try {
      const { user_id } = res.locals
      const id = req.params.id
  
      const task = await Task.findOneAndDelete({ user_id, _id: id })
  
      console.log(task)
      //validation
      if (!task) {
        return res.status(404).json({ msg: "task inexistente" })
      }
  
      return res.status(200).json({ msg: `Task ${task.titulo} removida` })
    } catch (err) {
      return res.status(403).json({ msg: err.message })
    }
  }
}

module.exports = new ControllerTask()