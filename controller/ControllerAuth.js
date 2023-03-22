const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

//imports
const User = require("../models/User")

class ControllerAuth {
  async getUser (req, res) { 
    const id = req.params.id

    // check if user exists
    const user = await User.findById(id, "-password")
  
    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado" })
    }
  
    res.status(200).json({ user })
  }
  async postUser (req, res) {
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
  }
  async loginUser (req, res) {
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
  }
}

module.exports = new ControllerAuth()
