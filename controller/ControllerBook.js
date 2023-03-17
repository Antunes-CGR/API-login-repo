const TaskBook = require("../models/Book")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

class BookController {
  async index(req, res) {
    try {
      const listBook = await TaskBook.find()

      return res.status(200).json(listBook)
    } catch (error) {
      console.log(error)
    }
  }
  async store(req, res) {
    try {
      const [, token] = req.headers.authorization.split(" ")
      const { id: user_id } = jwt.decode(token)


      //VALIDAÇÕES
      const { titulo, autor, ISBN } = req.body

      if(!titulo || titulo.length < 3 || titulo === ""){
        return res.status(400).json({msg:"Necessário preenchimento do titulo"})
      }

      if(!autor || autor === ""){
        return res.status(400).json({msg:"Necessário preenchimento do autor"})
      }

      if(!ISBN || ISBN.length < 7 || ISBN === ""){
        return res.status(400).json({msg:"ISBN mínimo 7 caracteres"})
      }

      // CRIAÇÃO BOOK
      const taskBook = await TaskBook.create({
        user_id: user_id,
        titulo: req.body.titulo,
        autor: req.body.autor,
        ISBN: req.body.ISBN,
      })

      await taskBook.save()

      return res.json(taskBook)
    } catch (error) {
      console.log(error)
    }
  }
  async update(req, res) {
    try {
      const [, token] = req.headers.authorization.split(" ")
      const { id: user_id } = jwt.decode(token)
      const { _id } = req.params
      const { titulo, autor, ISBN } = req.body


      // VALIDAÇÕES DE PREENCHIMENTO

      if(!titulo || titulo.length < 3 || titulo === ""){
        return res.status(400).json({msg:"Necessário preenchimento do titulo"})
      }

      if(!autor || autor === ""){
        return res.status(400).json({msg:"Necessário preenchimento do autor"})
      }

      if(!ISBN || ISBN.length < 7 || ISBN === ""){
        return res.status(400).json({msg:"ISBN mínimo 7 caracteres"})
      }     

      //UPDATE DO BOOK
      const taskBook = {
        titulo: req.body.titulo,
        autor: req.body.autor,
        ISBN: req.body.ISBN,
      }

      //VALIDAÇÃO DE ID
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(404).json({ msg: "book id inválido" })
      }

      const UserUpdateBook = await TaskBook.findById(_id, user_id)
      if(!UserUpdateBook){
        return res.status(403).json({ erro: "Voce nao pode alterar esse ebook" })         
      }

      const updateBook = await TaskBook.findByIdAndUpdate(_id, taskBook)


      return res.status(200).json(updateBook)
    } catch (error) {
      console.log(error)
    }
  }
  async destroy(req, res) {
    try {
      const [, token] = req.headers.authorization.split(" ")
      const { id: user_id } = jwt.decode(token)
      const { _id } = req.params

      //VALIDAÇÃO DE USUÁRIO AUTORIZADO
      const UserDestroyBook = await TaskBook.findById(_id, user_id)
      if(!UserDestroyBook){
        return res.status(400).json({msg:"Usuário não autorizado"})
      }

      const destroyBook = await TaskBook.findByIdAndDelete(_id)

      return res.status(200).json(destroyBook)
    } catch (error) {
      console.log(error)
    }
  }
  async show(req, res) {
    try {

      const { _id } = req.params

      const showBook = await TaskBook.findById(_id)

      return res.status(200).json({ msg: "Livro!", showBook })
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = new BookController()
