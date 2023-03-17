const jwt = require("jsonwebtoken")

const checkToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ msg: "acesso negado!" })
  }

  try {
    const secret = process.env.SECRET
    jwt.verify(token, secret)

    const { id } = jwt.decode(token)
    res.locals.user_id = id
    next()
  } catch (error) {
    console.log(error)

    res.status(400).json({ msg: "Token inválido " })
  }
}

module.exports = {
  checkToken,
}
