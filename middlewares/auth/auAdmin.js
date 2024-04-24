
const auAdmin = (arr) =>{
    return (req,res,next)=>{
        const {user} = req;
        if(arr.findIndex(ele=> ele === user.role) > -1){
            next()
        }else{
            res.status(401).send("you do not have access !")
        }
    }
}

module.exports = {
    auAdmin
}