const { where } = require('sequelize');
const {Folders,Notes} = require('../models');

const createFolder = async (req,res)=>{
    const user_id = req.user.id;
    const {name} = req.body;
    try {
        const newFolder = await Folders.create({
            name,
            user_id
        })
        res.status(201).send(newFolder)
    } catch (error) {
        res.status(500).send(error)
    }
}
const getAllFolders = async (req,res)=>{
    const user_id = req.user.id;
    try {
        const listFolders = await Folders.findAll({
            where:{
                user_id
            }
        })
        if(listFolders){
            res.status(200).send(listFolders)
        }else{
            res.status(404).send("Not found !")
        }
    } catch (error) {
        res.status(500).send(error)
    }
}
const getDetailFolder = async (req,res)=>{
    const user_id = req.user.id;
    const folder_id = parseInt(req.params.id)
    try {
        const notes = await Notes.findAll({
            where:{
                folder_id,
                user_id
            }
        })
        const folder = await Folders.findOne({
            where:{
                id:folder_id
            }
        })
        if(notes.length > 0){
            res.status(200).send({
                folder:folder,
                notes:notes
            })
        }else{
            res.status(200).send({
                folder:folder,
                notes:[]
            })
        }
    } catch (error) {
        res.status(500).send(error)
    }
}
const updateFolder = async (req,res)=>{
    const user_id = req.user.id;
    const folder_id = parseInt(req.params.id)
    const {name} = req.body;
    try {
        const folder = await Folders.findOne({
            where:{
                user_id,
                id:folder_id
            }
        })
        if(folder){
            await Folders.update({
                name
            },{
                where:{
                    user_id,
                    id:folder_id
                }
            })

            res.status(200).send("update success")
        }else{
            res.status(200).send("Not found your folder")
        }



    } catch (error) {
        res.status(500).send(error)
    }
}
const deleteFolder = async (req,res)=>{
    const user_id = req.user.id;
    const folder_id = parseInt(req.params.id)
    try {
        const folder = await Folders.findOne({
            where : {
                id:folder_id,
                user_id
            }
        })
        if(folder){
            await Folders.destroy({
                where : {
                    id:folder_id,
                    user_id
                }
            })

            res.status(200).send("delete success")
        }else{
            res.status(401).send("Not found your folder")
        }
    } catch (error) {
        res.status(500).send(error)
    }
}
module.exports= {
    createFolder,
    getAllFolders,
    getDetailFolder,
    updateFolder,
    deleteFolder
}