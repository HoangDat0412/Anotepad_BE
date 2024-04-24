const jwt = require("jsonwebtoken");
const authenticateCreate = (req,res,next)=>{
    const authHeader = req.headers.authorization;
    if(!authHeader){
        next()
    }
    try {
        const token = authHeader.split(' ')[1];
        const decode = jwt.verify(token,"20112003");
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