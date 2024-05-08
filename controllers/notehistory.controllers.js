const {NoteHistory,Notes,sequelize} = require('../models');

const createNoteHistory = async (req,res)=>{
    const user_id = req.user.id;
    const {note_id} = req.body;
    try {
        const note = await Notes.findOne({
            where:{
                id:note_id
            }
        })
        if(note.user_id === user_id){
            const newNoteHistory = await NoteHistory.create({
                note_id,
                user_id
            })
            res.status(201).send(newNoteHistory)
        }else{
            res.status(401).send("not authorize")
        }

    } catch (error) {
        res.status(500).send(error)
    }
}

const getNoteHistory = async (req,res)=>{
    const user_id = req.user.id;
    try {
        let NoteInDay = await sequelize.query(`SELECT distinct Notes.*
        FROM Notes
        INNER JOIN NoteHistories ON Notes.id = NoteHistories.note_id
        WHERE NoteHistories.createdAt >= DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND Notes.user_id = ${user_id} AND NoteHistories.user_id = ${user_id};`)
        let NoteInMonth = await sequelize.query(`SELECT distinct Notes.*
        FROM Notes
        INNER JOIN NoteHistories ON Notes.id = NoteHistories.note_id
        WHERE NoteHistories.createdAt >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND Notes.user_id = ${user_id} AND NoteHistories.user_id = ${user_id};`)

        NoteInDay = NoteInDay[0],
        NoteInMonth = NoteInMonth[0]

        NoteInMonth = NoteInMonth.filter(obj2 => !NoteInDay.some(obj1 => obj1.id === obj2.id));
        res.status(200).send({
            noteInDay:NoteInDay,
            NoteInMonth:NoteInMonth
        })
    } catch (error) {
        res.status(500).send(error)
    }
}



module.exports= {
    createNoteHistory,
    getNoteHistory
}