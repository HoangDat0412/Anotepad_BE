const jwt = require("jsonwebtoken");
const { decode_password } = require("../util/config");
const authenticateRegister = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    next();
  }

  jwt.verify(token, decode_password, (err, user) => {
    if (err) {
      next();
    } else {
      res.status(200).send("Bạn đã có tài khoản");
    }
  });
};

module.exports = {
  authenticateRegister,
};
