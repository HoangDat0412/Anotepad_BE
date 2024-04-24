const express = require("express");
const {createComment,deleteComment,getListComment } = require("../controllers/comment.controllers");
const {authenticate} = require("../middlewares/auth/authenticate");
const { auAdmin } = require("../middlewares/auth/auAdmin");
const { authAccessNote } = require("../middlewares/auth/authAccessNote");
const CommentRouter = express.Router()

CommentRouter.post("/:id",authenticate,authAccessNote,createComment)
CommentRouter.delete("/:id",authenticate,deleteComment)
CommentRouter.get("/:id",authenticate,authAccessNote,getListComment)

module.exports = CommentRouter