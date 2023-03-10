/*imnports*/
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

// Config JSON response
app.use(express.json());

// requests
const User = require("./models/User");
const Task = require("./models/Task");

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

//Register User
app.post("/auth/register", async (req, res) => {
  const { name, email, password, confirmpassword } = req.body;

  //check if user exists
  const userExists = await User.findOne({ email: email });

  if (userExists) {
    return res.status(422).json({ msg: "Por favor, utilize outro email!" });
  }

  //create password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  //create user
  const user = new User({
    name,
    email,
    password: passwordHash,
  });

  try {
    await user.save();

    res.status(201).json({ msg: "Usuário criado com sucesso!" });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      msg: "Aconteceu algum erro no servidor, tente novamente mais tarde!",
    });
  }
});

// Login User
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(422).json({ msg: "Usuário não encontrado!" });
  }

  //check if password match
  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(422).json({ msg: "Senha inválida!" });
  }

  try {
    const secret = process.env.SECRET;

    const token = jwt.sign(
      {
        id: user._id,
      },
      secret
    );

    res.status(200).json({ msg: "Autenticação realizada com secuesso", token });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
});

app.get("/tasks", checkToken, async (req, res) => {
  const [, token] = req.headers.authorization.split(" ");
  const { id: user_id } = jwt.decode(token);

  const tasks = await Task.find({ user_id });
  return res.status(200).json(tasks);
});

app.post("/tasks", async (req, res) => {
  const [, token] = req.headers.authorization.split(" ");
  const { id: user_id } = jwt.decode(token);

  const TaskCreate = await Task.create({
    user_id: user_id,
    titulo: req.body.titulo,
    created_at: new Date(),
    completed_at: null,
  });
  return res.status(201).json(TaskCreate);
});

app.delete("/tasks/:id", async (req, res) => {
  try {
    const [, token] = req.headers.authorization.split(" ");
    const { id: user_id } = jwt.decode(token);
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ msg: "task id inválido" });
    }

    const task = await Task.findOneAndDelete({ user_id, _id: id });

    console.log(task);

    if (!task) {
      return res.status(404).json({ msg: "task inexistente" });
    }

    return res.status(200).json({ msg: `Task ${task.titulo} removida` });
  } catch (err) {
    return res.status(403).json({ msg: err.message });
  }
});

app.put("/tasks/:id", async (req, res) => {
  const [, token] = req.headers.authorization.split(" ");
  const { id: user_id } = jwt.decode(token);

  return res.status(200).json(finalTask);
});

//Credenciais

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
