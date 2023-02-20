const express = require('express')
const router = express.Router()
const User = require('../models/User.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//Register User
router.post("/register", async (req, res) => {
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
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(422).json({ msg: "Usuário não encontrado!" });
  }

  //check if password match
  const checkPassword = await bcrypt.compare(password, user.password);

  // validations
  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }

  if (!password) {
    return res.status(422).json({ msg: "O password é obrigatório!" });
  }

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

    res.status(200).json({ msg: "Autenticação realizada com sucesso", token });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
});

module.exports = router
