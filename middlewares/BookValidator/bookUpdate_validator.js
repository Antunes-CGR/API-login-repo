
const bookUpdateValidator = async (req, res, next) => {
  const { titulo, autor, ISBN } = req.body

  // VALIDAÇÕES DE PREENCHIMENTO

  if(!titulo || titulo.length < 3 || titulo === ""){
    return res.status(400).json({msg:"Necessário preenchimento do titulo"})
  }

  if(!autor || autor === ""){
    return res.status(400).json({msg:"Necessário preenchimento do autor"})
  }

  if(!ISBN || ISBN.length < 7 || ISBN === ""){
    return res.status(400).json({msg:"ISBN mínimo 7 caracteres"})
  }     


  next()
}


module.exports = {
  bookUpdateValidator
}