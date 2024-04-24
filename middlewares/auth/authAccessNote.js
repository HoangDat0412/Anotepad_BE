
const {Notes,AccessNotes} = require('../../models');
const authAccessNote = async (req,res,next)=>{
    const note_id = parseInt(req.params.id)
    const user_id = req.user.id;
    try {

        const note = await Notes.findOne({
            where:{
                id:note_id
            }
        })

        if( note.status === "protected"){
            const listAccess = await AccessNotes.findAll({
                where:{
                    note_id
                }
            })
            const index = listAccess.findIndex(item => item.user_id === req.user.id)
            if(index > -1){
                    next()
            }else{
                res.status(401).send("you do not have access !")
            }
        }else if(note.status === "private"){
            if(note.user_id === user_id){
                req.note_user_id = note.user_id
                next()
            }else{
                res.status(401).send("you do not have access !")
            }
        }else{
            next()
        }
    } catch (error) {
        res.status(500).send(error)
    }
}

module.exports = {
    authAccessNote
}