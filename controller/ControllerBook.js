const TaskBook = require("../models/Book");

class BookController {
  async index(req, res) {
    try {
      const listBook = await TaskBook.find();

      return res.status(200).json(listBook);
    } catch (error) {
      console.log(error);
    }
  }

  async store(req, res) {
    try {
      // const [, token] = req.headers.authorization.split(" ");
      // const { id: user_id } = jwt.decode(token);

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
        titulo: req.body.titulo,
        autor: req.body.autor,
        ISBN: req.body.ISBN,
      });

      await taskBook.save()

      return res.json(taskBook);
    } catch (error) {
      console.log(error);
    }
  }
  async update(req, res) {
    try {
      const { _id } = req.params;

      // VALIDAÇÕES
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
      };

      const updateBook = await TaskBook.findByIdAndUpdate(_id, taskBook);

      return res.status(200).json(updateBook);
    } catch (error) {
      console.log(error);
    }
  }
  async destroy(req, res) {
    try {
      const { _id } = req.params;

      const destroyBook = await TaskBook.findByIdAndDelete(_id);

      return res.status(200).json(destroyBook);
    } catch (error) {
      console.log(error);
    }
  }
  async show(req, res) {
    try {
      const { _id } = req.params;

      const showBook = await TaskBook.findById(_id);

      return res.status(200).json({ msg: "Livro!", showBook });
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = new BookController();
