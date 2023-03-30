const User = require("../models/User")

const registerValidator = async (req, res, next) => {
  const { email, password, confirmpassword } = req.body

  //check if user exists
  const userExists = await User.findOne({ email: email })

  if (userExists) {
    return res.status(402).json({ msg: "Por favor, utilize outro email!" })
  }

  //check password match
  if(confirmpassword === ""){
    return res.status(400).json({msg:"necessário preenchimento da área de confirmação"})
  }

  if(confirmpassword !== password){
    return res.status(400).json({msg:"senhas não conferem"})
  }


  next()
}

module.exports = {
  registerValidator
}