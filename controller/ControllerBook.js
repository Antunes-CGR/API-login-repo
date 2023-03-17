
const TaskBook = require("../models/Book");

class BookController {
  async index(req, res) {
    const listBook = await TaskBook.find();

    

    return res.status(200).json(listBook);
  }
  async store(req, res) {
    // const [, token] = req.headers.authorization.split(" ");
    // const { id: user_id } = jwt.decode(token);

    const taskBook = await TaskBook.create({
      titulo: req.body.titulo,
      autor: req.body.autor,
      ISBN: req.body.ISBN,
    });

    return res.json(taskBook);
  }
  async update(req, res) {
    try {
      const { _id } = req.params;

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
    const { _id } = req.params

    const destroyBook = await TaskBook.findByIdAndDelete(_id)

    return res.status(200).json(destroyBook)
  }
  async show(req, res) {
    const { _id } = req.params

    const showBook = await TaskBook.findById(_id)

    return res.status(200).json({msg:"Livro!", showBook})
  }
}

module.exports = new BookController();
