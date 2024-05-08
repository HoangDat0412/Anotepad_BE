const express = require("express");
const { createNoteHistory,getNoteHistory } = require("../controllers/notehistory.controllers");
const {authenticate} = require("../middlewares/auth/authenticate");

const NoteHistoryRouter = express.Router()

// create folder 
NoteHistoryRouter.post("/",authenticate,createNoteHistory)
NoteHistoryRouter.get("/",authenticate,getNoteHistory)

module.exports = NoteHistoryRouter