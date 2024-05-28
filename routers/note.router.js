const express = require("express");
const { createNote,getNote,getAllNote,updateNote,SetNoteIsDelete,deleteNote,accNote,editNote,getNotes,getPermission,getNoteInDayandMonth,setNoteHighLight,getListNoteHighLight,searchNote,getListNoteIsDelete,ReturnNote} = require("../controllers/note.controllers");
const {authenticate} = require("../middlewares/auth/authenticate");
const { auAdmin } = require("../middlewares/auth/auAdmin");
const { authNote } = require("../middlewares/auth/authNote");
const NoteRouter = express.Router()
NoteRouter.get('/allnote',authenticate,auAdmin(["ADMIN"]),getNotes)
NoteRouter.post("/",authenticate,createNote)
NoteRouter.get("/:id",authenticate,getNote)
NoteRouter.get("/",authenticate,getAllNote)
NoteRouter.put("/:id",authenticate,authNote,updateNote)
NoteRouter.delete("/:id",authenticate,SetNoteIsDelete)
NoteRouter.get("/highlight/:id",authenticate,setNoteHighLight)
NoteRouter.get("/highlights/list",authenticate,getListNoteHighLight)

NoteRouter.get('/search/:name',authenticate,searchNote)

// access note 
NoteRouter.post("/accesspermission",authenticate,accNote)
// edit note 
NoteRouter.post("/editpermission",authenticate,editNote)
NoteRouter.get('/getpermission/:id',authenticate,getPermission)
NoteRouter.get('/getNoteIn/DayandMonth',authenticate,getNoteInDayandMonth)

// note deleted
NoteRouter.get('/getlistnote/deleted',authenticate,getListNoteIsDelete)
NoteRouter.delete("/deletenote/:id",authenticate,deleteNote)
NoteRouter.get('/returnnote/:id',authenticate,ReturnNote)

module.exports = NoteRouter