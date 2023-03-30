const mongoose = require("mongoose")

// imports 
const TaskBook = require("../models/Book")


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
  async list (req, res, next) {
    try {
      const { user_id } = res.locals

      const { page, limit } = req.query
      const { skip } = (page - 1) * limit
      const { sort } = ({ titulo: 1})
      
      const ListTaksBook = await TaskBook.find(
        { user_id: mongoose.Types.ObjectId(user_id) },
        null, 
        {limit, skip, sort} 
      ).populate("user_id")
      
      const mappedTaskBook = ListTaksBook.map(book => ({
        _id: book._id,
        titulo: book.titulo,
        email: book.user_id.email,
        autor: book.autor,
        ISBN: book.ISBN
      }))

      const totalBook = await TaskBook.estimatedDocumentCount({user_id})
      const totalPages = Math.ceil(totalBook / limit)


      return res.status(200).json({mappedTaskBook, totalPages})

    } catch (error) {
      next(error)
    }
  }
}

module.exports = new BookController()
