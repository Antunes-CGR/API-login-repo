const TaskBook = require('../models/TaskBook')
const book = require('../models/TaskBook')

class TaskBookController {
  async index(req, res){
    return res.json({msg:true})
  }

  async store(req, res){
    const ControllerStore = {
      
    }
  }

  async show(req, res){

  }

  async update(req, res){

  }

  async destroy(req, res){

  }
}

module.exports = new TaskBookController()