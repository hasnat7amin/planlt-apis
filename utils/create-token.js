const JWT = require('jsonwebtoken');
require("dotenv").config()

const TOKEN_KEY = process.env.TOKEN_KEY;

module.exports = createToken = (id) => {
  return JWT.sign({ id }, TOKEN_KEY);
};
