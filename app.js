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
const Book = require('./controller/ControllerBook');
const ControllerBook = require("./controller/ControllerBook");

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

app.post("/tasks", checkToken, async (req, res) => {
  const [, token] = req.headers.authorization.split(" ");
  const { id: user_id } = jwt.decode(token);

  // validacao 00 - formulario esta ok?
  if (
    !req.body.titulo ||
    req.body.titulo === "" ||
    req.body.titulo.length < 3
  ) {
    return res.status(400).json({ titulo: "Deve conter pelo menos 3 caracteres" });
  }

  const TaskCreate = await Task.create({
    user_id: user_id,
    titulo: req.body.titulo,
    created_at: new Date(),
    completed_at: null,
  });

  return res.status(201).json(TaskCreate);
});

app.delete("/tasks/:id", checkToken, async (req, res) => {
  try {
    const [, token] = req.headers.authorization.split(" ");
    const { id: user_id } = jwt.decode(token);
    const id = req.params.id;

    // validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ msg: "task id inválido" });
    }

    const task = await Task.findOneAndDelete({ user_id, _id: id });

    console.log(task);
    //validation
    if (!task) {
      return res.status(404).json({ msg: "task inexistente" });
    }

    return res.status(200).json({ msg: `Task ${task.titulo} removida` });
  } catch (err) {
    return res.status(403).json({ msg: err.message });
  }
});

app.put("/tasks/:_id", checkToken, async (req, res) => {
  try {
    const [, token] = req.headers.authorization.split(" ");
    const { id: user_id } = jwt.decode(token);
    const { _id } = req.params;

    // validation -01 - _id eh valido?
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(404).json({ msg: "task id inválido" });
    }

    // validacao 00 - formulario esta ok?
    if (!req.body.titulo || req.body.titulo === "" || req.body.titulo.length < 3) {
      return res
        .status(400)
        .json({ titulo: "Deve conter pelo menos 3 caracteres" });
    }

    // validacao 01 - task existe? (opcional, a validacao 02 ja verifica se a task existe)
    const contarTasksComEsseID = await Task.count({ _id });
    if (contarTasksComEsseID === 0) {
      return res.status(404).json({ erro: "Task nao existe" }); // nao encontrado
    }

    // validacao 02 - task eh do usuario?
    const taskDoUsuario = await Task.findOne({ _id, user_id });
    if (!taskDoUsuario) {
      return res.status(403).json({ erro: "Voce nao pode alterar essa task" }); // nao autorizado
    }

    taskDoUsuario.titulo = req.body.titulo;
    await taskDoUsuario.save();

    return res.status(200).json(taskDoUsuario);
  } catch (erro) {
    console.log(erro);
  }
});

app.put("/tasks/:_id/completed", checkToken, async (req, res) => {
  try {
    // validar se a task pertence ao usuario
    const [, token] = req.headers.authorization.split(" ");
    const { id: user_id } = jwt.decode(token);
    const { _id } = req.params;

    const taskDoUsuario = await Task.findById({ _id, user_id });

    if (!taskDoUsuario) {
      return res.status(404).json({ msg: "Usuário não autorizado" });
    }

    const taskCompleted = await Task.findOneAndUpdate({ completed_at: new Date() });

    return res.json(taskCompleted);
  } catch (error) {
    console.log(error);
  }
});

//Rotas Controller Book
app.get('/taskBook', ControllerBook.index)
app.post('/taskBook', ControllerBook.store)
app.put('/taskBook/:_id', checkToken, ControllerBook.update)
app.delete('/taskBook/:_id',checkToken, ControllerBook.destroy)
app.get('/taskBook/:_id', checkToken, ControllerBook.show)



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
