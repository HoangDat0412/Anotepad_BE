const { where } = require('sequelize');
const {Comments,Notes} = require('../models');


const createComment = async (req,res)=>{
    const note_id = parseInt(req.params.id)
    const {user_name,comment} = req.body;
    try {
        const newComment = await Comments.create({
            note_id,
            user_name,
            comment
        })
        res.status(201).send(newComment)
    } catch (error) {
        res.status(500).send(error)
    }
}


const deleteComment = async (req,res)=>{
    const user_id = req.user.id;
    const comment_id = parseInt(req.params.id)
    try {
        const comment = await Comments.findOne({
            where:{
                id:comment_id
            }
        })
        if(comment){
            const note = await Notes.findOne({
                where:{
                    id:comment.note_id
                }
            })

            if(note.user_id === user_id){
                await Comments.destroy({
                    where:{
                        id:comment_id
                    }
                })
                res.status(200).send("delete success")
            }else{
                res.status(401).send("You do not have access!")
            }
        }else{
            res.status(404).send("Not found comment")
        }
    } catch (error) {
        res.status(500).send(error)
    }
}

const getListComment = async (req,res)=>{
    const note_id = parseInt(req.params.id)
    try {
        const listComment = await Comments.findAll({
            where:{
                note_id
            }
        })
        if(listComment){
            res.status(200).send(listComment)
        }else{
            res.status(404).send("Not found")
        }
    } catch (error) {
        res.status(500).send(error)
    }
}

module.exports = {
    createComment,
    deleteComment,
    getListComment
}