const jwt = require("jsonwebtoken");
const authenticateRegister = (req,res,next)=>{
    const authHeader = req.headers.authorization;
    if(!authHeader){
        next()
    }
    try {
        const token = authHeader.split(' ')[1];
        const decode = jwt.verify(token,"20112003");
        if (decode) {
            req.user = decode;
            res.status(200).send("Bạn đã có tài khoản")
        } else {
            next()
        }
    } catch (error) {
        next()
    }
}

module.exports = {
    authenticateRegister
}