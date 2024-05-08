const { Users, Notes, LoginHistory } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { decode_password, URL_FE, URL_BE, HOST_MAIL, PORT_MAIL, AUTH_USER_MAIL, PASSWORD_MAIL } = require("../util/config");
const transporter = nodemailer.createTransport({
  host: HOST_MAIL,
  port: PORT_MAIL,
  auth: {
    user: AUTH_USER_MAIL,
    pass: PASSWORD_MAIL,
  },
});

const RegisterCookie = async (req, res) => {
  try {
    const newUser = await Users.create({
      role: "GUEST",
    });
    const token = jwt.sign({ role: newUser.role, id: newUser.id },decode_password);
    res.status(201).send({
      token: token,
    });
  } catch (err) {
    res.status(500).send(err);
  }
};

const Verifyemail = async (req, res) => {
  try {
    const email = req.query.email;
    const token = req.query.token;
    const decode = jwt.verify(token,decode_password);
    if (email === decode.email) {
      const user = Users.update(
        {
          role:"USER",
          verify: true,
        },
        {
          where: {
            email,
          },
        }
      );
      res.send("Your email is verify");
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

const createUser = async (req, res) => {
  const data = req.body;
  // tạo ra 1 chuỗi ngẫu nhiên
  const salt = bcrypt.genSaltSync(10);
  // mã hóa mật khẩu với salt
  const password = bcrypt.hashSync(data.password, salt);
  data.passWord = password;
  data.role = "GUEST";

  try {
    if (!req.user) {
      const user = await Users.findOne({
        where: {
          email: data.email,
        },
      });
      if (user) {
        return res.status(409).send("Email đã tồn tại");
      } else {
        const newUser = await Users.create({
          email: data.email,
          user_name: data.user_name,
          password: password,
          role: "GUEST",
        });
        const token = jwt.sign(
          { id: newUser.id, email: newUser.email },
          decode_password
        );
        const info = await transporter.sendMail({
          from: AUTH_USER_MAIL, // sender address
          to: `${newUser.email}`, // list of receivers
          subject: "Verify email", // Subject line
          text: "Verify your email register Smart Note", // plain text body
          html: `<a href="${URL_BE}/api/anotepad/user/verify?email=${newUser.email}&token=${token}" >Verify</a>`, // html body
        });
        return res.status(201).send(newUser);
      }
    } else {
      const user = await Users.findOne({
        where: {
          email: data.email,
        },
      });
      if (user) {
        return res.status(409).send("Email đã tồn tại");
      } else {
        const newUser = await Users.update(
          {
            email: data.email,
            user_name: data.user_name,
            password: password,
          },
          {
            where: {
              id: req.user.id,
            },
          }
        );
        const token = jwt.sign({ email: data.email }, "20112003");
        const info = await transporter.sendMail({
          from: AUTH_USER_MAIL, // sender address
          to: data.email, // list of receivers
          subject: "Verify email", // Subject line
          text: "Verify your email register Smart Note", // plain text body
          html: `<a href="http://localhost:4000/api/anotepad/user/verify?email=${data.email}&token=${token}" >Verify Your Email Register Smart Note</a>`, // html body
        });
        res.status(201).send("Create success");
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Users.findOne({
      where: {
        email: email,
      },
    });
    if (user) {
      if(user.verify === false){
        res.status(401).send("Your email is not verify. Please verify your email to Login !")
      }else{
        const match = bcrypt.compareSync(password, user.password);
        if (match) {
          const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            decode_password,{
              expiresIn:"30d"
            }
          );
          const { browser, os, platform } = req.useragent;
          const newloginhistory = await LoginHistory.create({
            user_id: user.id,
            browser,
            os,
            platform,
          });
          res.status(200).send({
            token: token,
          });
        } else {
          res.status(500).send({
            message: "email or password not correct",
          });
        }
      }
    } else {
      res.status(404).send(`Not found user have email ${email}`);
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

const getUserInformation = async (req, res) => {
  const id = parseInt(req.user.id);
  try {
    if (id) {
      let user = await Users.findOne({
        where: {
          id,
        },
      });
      let notes = await Notes.findAll({
        where: {
          user_id: req.user.id,
        },
      });
      res.status(200).send({
        user: user,
        notes: notes.length,
      });
    } else {
      res.status(404).send("not found");
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

const updateUserInfo = async (req, res) => {
  const id = parseInt(req.user.id);
  let { user_name } = req.body;
  try {
    const result = await Users.update(
      {
        user_name,
      },
      {
        where: {
          id,
        },
      }
    );
    if (result) {
      res.status(200).send("Update success !");
    } else {
      res.status(404).send("Not found");
    }
  } catch (error) {
    res.status(505).send(error);
  }
};

const updateUser = async (req, res) => {
  const id = req.params.id;
  const numberId = parseInt(id);
  let { email, password, role, user_name } = req.body;
  const salt = bcrypt.genSaltSync(10);
  password = bcrypt.hashSync(password, salt);
  try {
    await Users.update(
      {
        email,
        password,
        role,
        user_name,
      },
      {
        where: {
          id: numberId,
        },
      }
    );
    const result = await Users.findOne({
      where: {
        id: numberId,
      },
    });
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(404).send("Not found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

const getUser = async (req, res) => {
  try {
    const users = await Users.findAll();
    if (users) {
      res.status(200).send(users);
    } else {
      res.status(404).send("Not found");
    }
  } catch (error) {
    res.status(505).send(error);
  }
};

const deleteUser = async (req, res) => {
  const id = req.params.id;
  const ID = parseInt(id);
  try {
    await Users.destroy({
      where: {
        id: ID,
      },
    });

    res.status(200).send("Delete successful !");
  } catch (error) {
    res.status(500).send(err);
  }
};

const getUserFromId = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    let user = await Users.findOne({
      where: {
        id,
      },
    });
    let notes = await Notes.findAll({
      where: {
        user_id: req.user.id,
      },
    });
    res.status(200).send({
      user: user,
      notes: notes.length,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

const getdashboardinfo = async (req, res) => {
  try {
    const listGuest = await Users.findAll({
      where: {
        role: "GUEST",
      },
    });
    console.log("list guest ", listGuest);
    const listUser = await Users.findAll({
      where: {
        role: "USER",
      },
    });
    const notes = await Notes.count();

    res.status(200).send({
      guestlength: listGuest.length,
      userlength: listUser.length,
      notes: notes,
      lastestUser: listUser.slice(-10),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

const getLoginHistory = async (req, res) => {
  const user_id = req.user.id;
  try {
    const loginhistory = await LoginHistory.findAll({
      where: {
        user_id,
      },
    });

    if (loginhistory) {
      res.status(200).send(loginhistory);
    } else {
      res.status(404).send("Not found");
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

const forgotPassword = async (req, res) => {
  const {email} = req.body
  try {
    const user = await Users.findOne({
      where: {
        email
      },
    });
    if (!user) {
      res.status(404).send("not found");
    } else {
      const token = jwt.sign({ email: user.email },decode_password, {
        expiresIn: "10m",
      });
      const info = await transporter.sendMail({
        from: AUTH_USER_MAIL, // sender address
        to: user.email, // list of receivers
        subject: "Forgot Password", // Subject line
        text: "Set Your New Password", // plain text body
        html: `
        <a href="${URL_FE}/resetpassword/${user.email}/${token}" >Click To Link to Set Your New Password</a>
        <h2>This link only available in 10 minutes</h2>
        `, // html body
      });

      res.status(200).send("success");
    }
  } catch (error) {
    res.status(500).send(error);
  }
};
const resetPassword = async (req,res) =>{
  const { email, token } = req.params;
  const data = req.body;
    // tạo ra 1 chuỗi ngẫu nhiên
    const salt = bcrypt.genSaltSync(10);
    // mã hóa mật khẩu với salt
    const password = bcrypt.hashSync(data.password, salt);
    data.password = password

  try {
    const user = await Users.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      return res.status(404).send("User Not Exists!!");
    } else {
      const decode = jwt.verify(token,decode_password);
      if (email === decode.email) {
        const salt = bcrypt.genSaltSync(10);
        // mã hóa mật khẩu với salt
        const password = bcrypt.hashSync(data.password, salt);
        user.password = data.password;
        await user.save()
        res.status(200).send("Update success")
      }else{
        res(401).send("Not Verified");
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error)
  }


    
}

const updatePassword = async (req,res) =>{
  const id = req.user.id
  const {password,new_password} = req.body;
  try {
    const user = await Users.findOne({
      where:{
        id
      }
    })
    if(!user){
      res.status(404).send("not found !")
    }else{
      const match = bcrypt.compareSync(password, user.password);
      if (match) {
        const salt = bcrypt.genSaltSync(10);
        // mã hóa mật khẩu với salt
        const newpassword = bcrypt.hashSync(new_password, salt);
        user.password = newpassword
        await user.save()

        res.status(200).send("update password success");
      } else {
        res.status(401).send("password is not correct");
      }
    }
  } catch (error) {
    res.status(500).send(error)
  }
}

const deleteAccount = async (req,res) => {
  const id = req.user.id;
  try {
    const user = await Users.findOne({
      where:{
        id
      }
    })
    if(!user){
      res.status(404).send("Not found user !")
    }else{
      await Users.destroy({
        where:{
          id
        }
      })

      res.status(200).send("Delete account success")
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
  getLoginHistory,
  Verifyemail,
  forgotPassword,
  resetPassword,
  updatePassword
};
