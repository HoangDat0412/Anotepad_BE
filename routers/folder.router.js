const express = require("express");
const {createFolder,getAllFolders,getDetailFolder,updateFolder,deleteFolder } = require("../controllers/folder.controllers");
const {authenticate} = require("../middlewares/auth/authenticate");
const { auAdmin } = require("../middlewares/auth/auAdmin");
const FolderRouter = express.Router()

// create folder 
FolderRouter.post("/",authenticate,createFolder)
FolderRouter.get("/folders",authenticate,getAllFolders)

FolderRouter.get("/:id",authenticate,getDetailFolder)
FolderRouter.put("/:id",authenticate,updateFolder)
FolderRouter.delete("/:id",authenticate,deleteFolder)

module.exports = FolderRouter