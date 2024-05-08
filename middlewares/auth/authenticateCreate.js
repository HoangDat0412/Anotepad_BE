const jwt = require("jsonwebtoken");
const { decode_password } = require("../../util/config");
const authenticateCreate = (req,res,next)=>{
    const authHeader = req.headers.authorization;
    if(!authHeader){
        next()
    }
    try {
        const token = authHeader.split(' ')[1];
        const decode = jwt.verify(token,decode_password);
        if (decode) {
            req.user = decode;
            return next()
        } else {
            next()
        }
    } catch (error) {
        next()
    }
}

module.exports = {
    authenticateCreate
}