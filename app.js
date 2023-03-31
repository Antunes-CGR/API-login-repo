// libs
require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cors = require("cors")
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
const ControllerAuth = require("./controller/ControllerAuth")
const ControllerTask = require("./controller/ControllerTask")

const app = express()
app.use(express.json())
app.use(cors())

//Open Route - Public Route
app.get("/", (req, res) => {
  res.status(200).json({ msg: "Bem vindo a nossa API!" })
})

// Private Route
app.get("/user/:id", checkToken, ControllerAuth.getUser)

//Register User
app.post("/auth/register", registerValidator, ControllerAuth.postUser)

// Login User
app.post("/auth/login", loginValidator, ControllerAuth.loginUser)

// Rotas Controller Task
app.post("/tasks", checkToken, validarFormTask, ControllerTask.postTask)
app.delete("/tasks/:id", checkToken, taskDeleteValidator, ControllerTask.destroyTask)
app.put("/tasks/:_id", checkToken, taskUpdateValidator, ControllerTask.putTask)
app.put("/tasks/:_id/completed", checkToken, ControllerTask.putTaskCompleted)

// paginação task
app.get("/tasks", checkToken, ControllerTask.getTask )

//Rotas Controller Book
app.get("/taskBook", ControllerBook.index)
app.post("/taskBook", checkToken, bookStoreValidator, ControllerBook.store)
app.put("/taskBook/:_id", checkToken, bookUpdateValidator, ControllerBook.update)
app.delete("/taskBook/:_id", checkToken, ControllerBook.destroy)
app.get("/taskBook/:_id", ControllerBook.show)

//Paginação TaskBook
app.get("/Book/pag", ControllerBook.list)

//Credenciais
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS
mongoose.set("strictQuery", true)

mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPassword}@cluster0.rk5a4ed.mongodb.net/?retryWrites=true&w=majority`
  )
  //callback que retorna sucesso ou falha
  .then(() => {
    console.log("Conectou ao Banco!")

    const port = process.env.PORT || 3000
    app.listen(port)
    console.log(`Server iniciou na porta ${port}`)
  })
  .catch((err) => console.log(err))
