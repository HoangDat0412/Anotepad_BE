const jwt = require("jsonwebtoken");
const { decode_password } = require("../../util/config");
const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.status(403).send("You need to login");
  }

  jwt.verify(token, decode_password, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

module.exports = {
  authenticate,
};
