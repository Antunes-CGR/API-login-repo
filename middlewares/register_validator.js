const User = require("../models/User")
const bcrypt = require("bcrypt")


const loginValidator = async (req, res, next) => {
  const { email, password } = req.body

  // Check if user exists
  const user = await User.findOne({ email: email })

  if (!user) {
    return res.status(422).json({ msg: "Usuário não encontrado!" })
  }

  //check if password match
  const checkPassword = await bcrypt.compare(password, user.password)

  if (!checkPassword) {
    return res.status(422).json({ msg: "Senha inválida!" })
  }

  next()
}


module.exports = {
  loginValidator
}