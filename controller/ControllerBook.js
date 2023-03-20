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
      const { user_id } = res.locals

      console.log(user_id)

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
      const { user_id } = res.locals
      const { _id } = req.params

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
      const { user_id } = res.locals
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
