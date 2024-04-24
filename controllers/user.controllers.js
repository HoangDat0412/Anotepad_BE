const {Users,Notes,LoginHistory} = require('../models');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require('fs');
const RegisterCookie = async (req,res)=>{
        const cookie = Date.now()
        try {
            const newUser = await Users.create({
                cookie:cookie,
                role:"GUEST"
            })
            const token = jwt.sign({cookie:cookie,role:newUser.role,id:newUser.id},"20112003")
            res.status(201).send({
                token:token
            })
        }catch(err){
            res.status(500).send(err)
        }
}
const createUser = async (req,res)=>{
    
    const cookie = Date.now()
    const data = req.body;
    // tạo ra 1 chuỗi ngẫu nhiên 
    const salt = bcrypt.genSaltSync(10);
    // mã hóa mật khẩu với salt 
    const password = bcrypt.hashSync(data.password,salt)
    data.passWord = password;
    data.role = "USER";
    data.cookie = cookie
    console.log("haha");
    if(!req.user){
        console.log("vcl");
        try {
            const user = await Users.findOne({
                where:{
                    email:data.email
                }
            })
            if(user){
                res.status(409).send("Email đã tồn tại")
            }else{
                    const newUser = await Users.create(data)
                    res.status(201).send(newUser)
            }
        } catch (error) {
            res.status(500).send(error)
        }
    }
    
    try {
        console.log("go");
        const user = await Users.findOne({
            where:{
                email:data.email
            }
        })
        if(user){
            res.status(409).send("Email đã tồn tại")
        }else{
            if(req.user){
                const user = await Users.findOne({
                    where:{
                        id:req.user.id
                    }
                })
                if(user){
                    const newUser = Users.update({email:data.email,password:password,role:"USER"},{
                        where:{
                            id:req.user.id
                        }
                    })
                    res.status(201).send("Create success")
                }else{
                    const newUser = Users.create(data)
                    res.status(201).send(newUser)
                }
                
            }else{
                const newUser = await Users.create(data)
                res.status(201).send(newUser)
            }
        }
    } catch (error) {
        res.status(400).send(error)
    }


}

const login = async (req,res)=>{
    const {email,password} = req.body;
    try {
        const user = await Users.findOne({
            where:{
                email:email
            }
        })
        if (user) {
            const match = bcrypt.compareSync(password,user.password)
            if(match){
                const token = jwt.sign({id:user.id,role:user.role,cookie:user.cookie},"20112003")
                const {browser,os,platform} = req.useragent
                const newloginhistory = await LoginHistory.create({
                    user_id:user.id,
                    browser,
                    os,
                    platform
                })
                res.status(200).send({
                    token:token
                })
            }else{
                res.status(500).send({
                    message:"email or password not correct"
                })
            }
        } else {
            res.status(404).send(`Not found user have email ${email}`)
        }
    } catch (error) {
        res.status(505).send(error)
    }
}

const getUserInformation = async (req,res)=>{
    const id = parseInt(req.user.id)
    try {
        if(id){
            let user = await Users.findOne({
                where:{
                    id
                }
            })
            let notes = await Notes.findAll({
                where:{
                    user_id:req.user.id
                }
            })
            res.status(200).send({
                user:user,
                notes:notes.length
            })

        }else{
            res.status(404).send("not found")
        }

    } catch (error) {
        res.status(500).send(error)
    }
}

const updateUserInfo = async (req,res)=>{
    const id = parseInt(req.user.id)
    let {email,password} = req.body
    const salt = bcrypt.genSaltSync(10);
    password = bcrypt.hashSync(password,salt)
    try {
        const result = await Users.update({
            email,
            password
        },{
            where :{
                id
            }
        })
        if (result) {
            res.status(200).send("Update success !")
        } else {
            res.status(404).send("Not found")
        }

    } catch (error) {
        res.status(505).send(error)
    }
}

const updateUser = async (req,res)=>{
    const id = req.params.id;
    const numberId = parseInt(id)
    let {email,password,role} = req.body
    const salt = bcrypt.genSaltSync(10);
    password = bcrypt.hashSync(password,salt)
    try {
        
        await Users.update({
            email,
            password,
            role
        },{
            where :{
                id:numberId
            }
        })
        const result = await Users.findOne({
            where:{
                id:numberId
            }
        })
        if (result) {
            res.status(200).send(result)
        } else {
            res.status(404).send("Not found")
        }

    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
}

const getUser = async (req,res)=>{
    try {
        const users = await Users.findAll();
        if (users) {
            res.status(200).send(users)
        } else {
            res.status(404).send("Not found")
        }
    } catch (error) {
        res.status(505).send(error)
    }

}

const deleteUser = async (req,res)=>{
    const id = req.params.id
    const ID = parseInt(id)
    try {

         await Users.destroy({
            where: {
              id:ID
            }
          });
         
          res.status(200).send("Delete successful !")
        
    } catch (error) {
        res.status(500).send(err)
    }
}

const getUserFromId = async (req,res)=>{
    const id = parseInt(req.params.id)
    try {
        let user = await Users.findOne({
            where:{
                id
            }
        })
        let notes = await Notes.findAll({
            where:{
                user_id:req.user.id
            }
        })
        res.status(200).send({
            user:user,
            notes:notes.length
        })
    } catch (error) {
        res.status(500).send(error)
    }
}

const getdashboardinfo = async (req,res)=>{
    console.log("start");
    try {
        const listGuest = await Users.findAll({
            where:{
                role:"GUEST"
            }
        })
        console.log("list guest ",listGuest);
        const listUser = await Users.findAll({
            where:{
                role:"USER"
            }
        })
        const notes = await Notes.count()


        res.status(200).send({
            guestlength:listGuest.length,
            userlength:listUser.length,
            notes:notes,
            lastestUser:listUser.slice(-10)
        })
    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
}

const getLoginHistory = async (req,res) => {
    const user_id = req.user.id
    try {
        const loginhistory = await LoginHistory.findAll({
            where:{
                user_id
            }
        })

        if(loginhistory){
            res.status(200).send(loginhistory)
        }else{
            res.status(404).send("Not found")
        }
    } catch (error) {
        res.status(500).send(error)
    }
}


module.exports = {
    RegisterCookie,
    createUser,
    getUser,
    login,
    updateUser,
    deleteUser,
    getUserInformation,
    getUserFromId,
    updateUserInfo,
    getdashboardinfo,
    getLoginHistory
}