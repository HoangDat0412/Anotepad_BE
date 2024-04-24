const jwt = require("jsonwebtoken");
const authenticate = (req,res,next)=>{
    const authHeader = req.headers.authorization;
    if(!authHeader){
        res.status(401).send("You need to login")
    }
    try {
        const token = authHeader.split(' ')[1];
        const decode = jwt.verify(token,"20112003");
        if (decode) {
            req.user = decode;
            return next()
        } else {
            res.status(401).send("You need to login")
        }
    } catch (error) {
        res.status(400).send(error)
    }
}

module.exports = {
    authenticate
}