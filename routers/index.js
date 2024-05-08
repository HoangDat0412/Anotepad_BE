const express = require("express");
const UserRouter = require("./user.router");
const NoteRouter = require("./note.router");
const FolderRouter = require("./folder.router");
const CommentRouter = require("./comment.router");
const NoteHistoryRouter = require("./notehistory.router");
const RootRouters = express.Router();
RootRouters.use('/user',UserRouter)
RootRouters.use('/note',NoteRouter)
RootRouters.use('/folder',FolderRouter)
RootRouters.use('/comment',CommentRouter)
RootRouters.use('/notehistory',NoteHistoryRouter)
module.exports = RootRouters