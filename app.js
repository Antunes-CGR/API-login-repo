// libs
require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
// middlewares
const { checkToken } = require("./middlewares/authentication")
const { validarFormTask } = require("./middlewares/TaskValidator/task_validator")
const { loginValidator } = require("./middlewares/login_validator")
const { registerValidator } = require("./middlewares/register_validator")
const { taskDeleteValidator } = require("./middlewares/TaskValidator/taskDelete_validator")
const { taskUpdateValidator } = require("./middlewares/TaskValidator/taskUpdate_validator")
const { bookUpdateValidator } = require("./middlewares/BookValidator/bookUpdate_validator")
const { bookStoreValidator } = require("./middlewares/BookValidator/bookStore_validator")
// models
const User = require("./models/User")
const Task = require("./models/Task")
// controllers
const ControllerBook = require("./controller/ControllerBook")

const app = express()
app.use(express.json())

//Open Route - Public Route
app.get("/", (req, res) => {
  res.status(200).json({ msg: "Bem vindo a nossa API!" })
})

// Private Route
app.get("/user/:id", checkToken,  async (req, res) => {
  const id = req.params.id

  // check if user exists
  const user = await User.findById(id, "-password")

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado" })
  }

  res.status(200).json({ user })
})

//Register User
app.post("/auth/register", registerValidator,  async (req, res) => {
  const { name, email, password } = req.body

  //create password
  const salt = await bcrypt.genSalt(12)
  const passwordHash = await bcrypt.hash(password, salt)

  //create user
  const user = new User({
    name,
    email,
    password: passwordHash,
  })

  try {
    await user.save()

    res.status(201).json({ msg: "Usuário criado com sucesso!" })
  } catch (error) {
    console.log(error)

    res.status(500).json({
      msg: "Aconteceu algum erro no servidor, tente novamente mais tarde!",
    })
  }
})

// Login User
app.post("/auth/login", loginValidator, async (req, res) => {

  try {
    const secret = process.env.SECRET
    const { email } = req.body

    const user = await User.findOne({ email: email })

    const token = jwt.sign(
      {
        id: user._id,
      },
      secret
    )

    res.status(200).json({ msg: "Autenticação realizada com secuesso", token })
  } catch (error) {
    console.log(error)

    res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    })
  }
})

// paginação task
app.get("/tasks", checkToken, async (req, res) => {
  const { user_id } = res.locals

  const {page, limit} = req.query
  const skip = (page - 1) * limit //Conta fixa para paginação

  const tasks = await Task.find({ user_id }, null, {limit, skip}) // Paginação

  const totalTask = await Task.count({user_id}) //critério de contagem
  const totalPages = Math.ceil(totalTask / limit) // Mostrar limite de paginas ao usuário

  return res.status(200).json({tasks, totalPages})
})

app.post("/tasks", checkToken, validarFormTask, async (req, res) => {
  const { user_id } = res.locals

  const TaskCreate = await Task.create({
    user_id,
    titulo: req.body.titulo,
    created_at: new Date(),
    completed_at: null,
  })

  return res.status(201).json(TaskCreate)
})

app.delete("/tasks/:id", checkToken, taskDeleteValidator, async (req, res) => {
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
})

app.put("/tasks/:_id", checkToken, taskUpdateValidator, async (req, res) => {
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
})

app.put("/tasks/:_id/completed", checkToken, async (req, res) => {
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
})

//Rotas Controller Book
app.get("/taskBook", ControllerBook.index)
app.post("/taskBook", checkToken, bookStoreValidator, ControllerBook.store)
app.put("/taskBook/:_id", checkToken, bookUpdateValidator, ControllerBook.update)
app.delete("/taskBook/:_id", checkToken, ControllerBook.destroy)
app.get("/taskBook/:_id", ControllerBook.show)

//Paginação TaskBook
app.get("/taskBook", checkToken, ControllerBook.pag)

//Credenciais

const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS
mongoose.set("strictQuery", true)

mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPassword}@cluster0.rk5a4ed.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    //call nack que retorna sucesso ou falha
    app.listen(3000)
    console.log("Conectou ao Banco!")
  })
  .catch((err) => console.log(err))
