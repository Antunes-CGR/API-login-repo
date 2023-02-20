const mongoose = require("mongoose");

function RouteLogin() {
  // validations
  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }

  if (!password) {
    return res.status(422).json({ msg: "O password é obrigatório!" });
  }
}

module.exports = RouteLogin;
