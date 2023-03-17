/*imnports*/
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

// routers
const authRouter = require('./routes/auth.js')

// Config JSON response
app.use(express.json());

// requests
const User = require('./models/User');
const Task = require('./models/Task');
const TaskBookController = require('./controllers/ControllerTaskBook')

//Open Route - Public Route
app.get("/", (req, res) => {
  res.status(200).json({ msg: "Bem vindo a nossa API!" });
});

// Private Route
app.get("/user/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  // check if user exists
  const user = await User.findById(id, "-password");

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado" });
  }

  res.status(200).json({ user });
});

function checkToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "acesso negado!" });
  }

  try {
    const secret = process.env.SECRET;
    jwt.verify(token, secret);
    next();
  } catch (error) {
    res.status(400).json({ msg: "Token inválido " });
  }
}

app.get("/tasks", async (req, res) => {
  const tasks = [];

  res.status(200).json(tasks);
});
app.post("/tasks/", async (req, res) => {
  const task = {};

  res.status(201).json(task);
});
app.delete("/tasks/:id", async (req, res) => {
  res.status(202);
});
app.patch("/tasks/:id", async (req, res) => {
  const task = {};

  res.status(202).json(task);
});

//Rotas Controller Book
app.get('/taskBook', TaskBookController.index)



//Credenciais
app.use('/auth', authRouter)

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;
mongoose.set("strictQuery", true);

mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPassword}@cluster0.rk5a4ed.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    //call nack que retorna sucesso ou falha
    app.listen(3000);
    console.log("Conectou ao Banco!");
  })
  .catch((err) => console.log(err));
