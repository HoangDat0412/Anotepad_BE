const express = require("express");
const {RegisterCookie ,createUser,updateUserInfo,login,getUserInformation,getUser,deleteUser,getUserFromId,updateUser,getdashboardinfo,getLoginHistory} = require("../controllers/user.controllers");
const {authenticate} = require("../middlewares/auth/authenticate");
const { auAdmin } = require("../middlewares/auth/auAdmin");
const { authenticateRegister } = require("../controllers/authenticateRegister");
const { authenticateCreate } = require("../middlewares/auth/authenticateCreate");
const UserRouter = express.Router()

UserRouter.get('/register/cookie',authenticateRegister,RegisterCookie)
UserRouter.post('/register',authenticateCreate,createUser)
UserRouter.put('/update',authenticate,updateUserInfo)
UserRouter.post('/login',login)
UserRouter.get('/information',authenticate,getUserInformation)
UserRouter.get('/logout', (req, res) => {
    // Xóa cookie bằng cách gửi một response với cookie có thời gian sống đã hết
    res.clearCookie('token').send('Bạn đã đăng xuất thành công.');
});

UserRouter.get('/loginhistory',authenticate,getLoginHistory)


// quản lý người dùng 
UserRouter.get('/',authenticate,auAdmin(["ADMIN"]),getUser)

UserRouter.delete('/:id',authenticate,auAdmin(["ADMIN"]),deleteUser)

UserRouter.get('/:id',authenticate,auAdmin(["ADMIN"]),getUserFromId)

UserRouter.put('/:id',authenticate,auAdmin(["ADMIN"]),updateUser)

UserRouter.get('/dashboard/info',authenticate,auAdmin(["ADMIN"]),getdashboardinfo)

module.exports = UserRouter