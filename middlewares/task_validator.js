const validarFormTask = (req, res, next) => {
  if (!req.body.titulo || req.body.titulo === "" || req.body.titulo.length < 3) {
    return res.status(400).json({ titulo: "Titulo deve conter pelo menos 3 caracteres" });
  }

  next()
}

module.exports = {
  validarFormTask,
}
