const mongoose = require("mongoose");

function register() {
  app.post("/auth/register", async (req, res) => {
    const { name, email, password, confirmpassword } = req.body;

    //validations
    if (!name) {
      return res.status(422).json({ msg: "O nome é obrigatório!" });
    }

    if (!email) {
      return res.status(422).json({ msg: "O email é obrigatório!" });
    }

    if (!password) {
      return res.status(422).json({ msg: "O password é obrigatório!" });
    }

    if (password !== confirmpassword) {
      return res.status(422).json({ msg: "As senhas não conferem!" });
    }
  });
}

module.exports = register;
