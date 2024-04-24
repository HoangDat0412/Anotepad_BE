const { where } = require("sequelize");
const { Notes, NoteContents, TaskLists, AccessNotes,Comments,sequelize } = require("../models");
const { Op } = require("sequelize");

const createNote = async (req, res) => {
  const { note_type } = req.body;

  try {
    if (note_type === "TaskList") {
      const newNote = await Notes.create({
        ...req.body,
        user_id: req.user.id,
      });

      const accessnote = await AccessNotes.create({
        note_id: newNote.id,
        user_id: req.user.id,
        permission: "ALL",
      });

      const TaskList = req.body.TaskList;

      let listTask = [];
      for (let index = 0; index < TaskList.length; index++) {
        const newTask = await TaskLists.create({
          content:TaskList[index]?.content,
          status:TaskList[index]?.status,
          note_id: newNote.id,
        });
        console.log(newTask);
        listTask.push(newTask);
      }

      res.status(201).send({
        note: newNote,
        content: listTask,
      });
    } else {
      const newNote = await Notes.create({
        ...req.body,
        user_id: req.user.id,
      });
      const accessnote = await AccessNotes.create({
        note_id: newNote.id,
        user_id: req.user.id,
        permission: "ALL",
      });
      const newNoteContent = await NoteContents.create({
        note_id: newNote.id,
        content: req.body.content,
      });

      res.status(201).send({
        note: newNote,
        content: newNoteContent,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

const getNote = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const note = await Notes.findOne({
      where: {
        id,
      },
    });
    let content;

    if (note.note_type === "TaskList") {
      content = await TaskLists.findAll({
        where: {
          note_id: note.id,
        },
      });
    } else {
      content = await NoteContents.findOne({
        where: {
          note_id: note.id,
        },
      });
    }

    if (note.status === "public") {
      res.status(200).send({
        note: {
          id:note.id,
          title:note.title,
          note_type:note.note_type,
          folder_id:note.folder_id,
          user_id:note.user_id,
          status:note.status
        },
        content: content,
      });
    } else if (note.status === "private") {
      if (note.user_id !== req.user.id) {
        res.status(401).send("You not have access");
      } else {
        res.status(200).send({
          note: {
            id:note.id,
            title:note.title,
            note_type:note.note_type,
            folder_id:note.folder_id,
            user_id:note.user_id,
            status:note.status
          },
          content: content,
        });
      }
    } else if (note.status === "protected") {
        const listAccess = await AccessNotes.findAll({
            where:{
                note_id:id
            }
        })
        const index = listAccess.findIndex(item => item.user_id === req.user.id)
        if(index > -1){
          res.status(200).send({
            note: {
              id:note.id,
              title:note.title,
              note_type:note.note_type,
              folder_id:note.folder_id,
              user_id:note.user_id,
              status:note.status
            },
            content: content,
          });
        }else{
            res.status(200).send({
              note: {
                user_id:note.user_id,
                status:note.status
              },
            })
        }
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

const getAllNote = async (req, res) => {
  try {
    const notes = await sequelize.query(`select id,title,note_type,folder_id,user_id,status,createdAt from Notes where user_id=${req.user.id}`) 
    // Notes.findAll({
    //   where: {
    //     user_id: req.user.id,
    //   },
    // });

    if (notes) {
      res.status(200).send(notes[0]);
    } else {
      res.status(404).send("Not found !");
    }
  } catch (error) {}
};

const updateNote = async (req, res) => {
  const {
    note_type,
    title,
    folder_id,
    status,
    password_access,
    password_edit,
  } = req.body;
  const id = parseInt(req.params.id);
  try {
    if (note_type === "TaskList") {
      console.log("start");
      if(req.user.id === req.note_user_id){
        await Notes.update(
          {
            title,
            folder_id,
            status,
            password_access,
            password_edit,
          },
          {
            where: {
               id,
            },
          }
        );
        console.log("update note");
      }else{
        await Notes.update(
          {
            title
          },
          {
            where: {
               id,
            },
          }
        );
      }
      await TaskLists.destroy({
        where:{
          note_id:id
        }
      })
      console.log("xóa thành công");
      
      const TaskList = req.body.content;
      for (let index = 0; index < TaskList.length; index++) {
        const newTask = await TaskLists.create({
          content:TaskList[index]?.content,
          status:TaskList[index]?.status,
          note_id: id
        });
      }
      console.log("update task");
      res.status(200).send("update success");
    } else {
      if(req.user.id === req.note_user_id){
        await Notes.update(
          {
            title,
            folder_id,
            status,
            password_access,
            password_edit,
          },
          {
            where: {
               id,
            },
          }
        );
      }else{
        await Notes.update(
          {
            title
          },
          {
            where: {
               id,
            },
          }
        );
      }
      await NoteContents.update(
        {
          content: req.body.content.content,
        },
        {
          where: {
            id: req.body.content.id,
          },
        }
      );

      res.status(200).send("update success");
    }
  } catch (error) {
    res.status(500).send(error)
  }
};

const deleteNote = async (req, res) => {
  const note_id = parseInt(req.params.id);
  const user_id = req.user.id;
  try {
    const note = await Notes.findOne({
      where: {
        id: note_id,
      },
    });
    if(note){
      if (note.user_id === user_id) {
        await AccessNotes.destroy({
            where:{
                note_id
            }
        })
        await Comments.destroy({
            where:{
                note_id
            }
        })
        if(note.note_type === "TaskList"){
            await TaskLists.destroy({
                where:{
                    note_id
                }
            })
        }else{
            await NoteContents.destroy({
                where:{
                    note_id
                }
            })
        }
      await Notes.destroy({
        where: {
          id: note_id,
        },
      });

      res.status(200).send("Delete success");
    } else {
      res.status(401).send("You don't have access");
    }
    }else{
      res.status(404).send("not found note");
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

const accNote = async (req,res) => {
  const {password_access,note_id} = req.body;
  const user_id = req.user.id;
  try {
    const note = await Notes.findOne({
      where:{
        id:note_id
      }
    })
    if(note){

      if(note.user_id === user_id){
        res.status(200).send("You have all access")
      }

      if(note.status === "public"){
        res.status(200).send("Access success")
      }else if(note.status === "private"){
        res.status(401).send("You do not have access !")
      }else if(note.status === "protected"){
        if(note.password_access === password_access){
          const accnote = await AccessNotes.findOne({
            where:{
              note_id,
              user_id
            }
          })
          if(accnote){
             res.status(200).send("ACCESS permission success !")
          }else{
            const newAccessNote = await AccessNotes.create({
              note_id,
              user_id,
              permission:"ACCESS"
            })
            res.status(201).send(newAccessNote)
          }


        }else{
          res.status(400).send("wrong password")
        }
      }
    }else{
      res.status(404).send("Not found the note")
    }
  } catch (error) {
    res.status(500).send(error)
  }
}
const editNote = async (req,res) => {
  const {password_edit,note_id} = req.body;
  const user_id = req.user.id;
  try {
    const note = await Notes.findOne({
      where:{
        id:note_id
      }
    })
    if(note){

      if(note.user_id === user_id){
        res.status(200).send("You have all permission")
      }

      if(note.status === "public"){
        res.status(401).send("You do not have edit permission")
      }else if(note.status === "private"){
        res.status(401).send("You do not have edit permission")
      }else if(note.status === "protected"){
        if(note.password_edit === password_edit){
          const accnote = await AccessNotes.findOne({
            where:{
              note_id,
              user_id
            }
          })
          if(accnote){
             accnote.permission = "EDIT"
             await accnote.save()
             res.status(200).send("EDIT permission success !")
          }else{
            const newAccessNote = await AccessNotes.create({
              note_id,
              user_id,
              permission:"EDIT"
            })

            res.status(201).send(newAccessNote)
          }

         
        }else{
          res.status(400).send("wrong password")
        }
      }
    }else{
      res.status(404).send("Not found the note")
    }
  } catch (error) {
    res.status(500).send(error)
  }
}

const getNotes = async (req,res)=>{

  try {
    const notes = await Notes.findAll()
    if(notes){
      res.status(200).send({
        notes:notes,
        notes_length:notes.length
      })
    }else{
      res.status(404).send("Not found")
    }
  } catch (error) {
    res.status(500).send(error)
  }
}

const getPermission = async (req,res) =>{
  const note_id = parseInt(req.params.id)
  // console.log("noteid",note_id);
  
  const user_id = req.user.id
  // console.log("user id",user_id);
  try {
    const permission = await AccessNotes.findOne({
      where : {
        note_id,
        user_id
      }
    })
    console.log("permission",permission);
    if(permission){
      res.status(200).send(permission)
    }else{
      res.status(401).send("You don't have access")
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error)
  }
}

const getNoteInDayandMonth = async (req, res) => {
  try {

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const notesToday = await Notes.findAll({
      where: {
        createdAt: {
          [Op.between]: [startOfDay, endOfDay]
        },
        user_id:req.user.id
      }
    });
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
    const notesMonth = await Notes.findAll({
      where: {
        createdAt: {
          [Op.between]: [startOfMonth, endOfMonth]
        },
        user_id:req.user.id
      }
    });

    res.status(200).send({
      notesToday:notesToday,
      notesMonth:notesMonth
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = {
  createNote,
  getNote,
  getAllNote,
  updateNote,
  deleteNote,
  accNote,
  editNote,
  getNotes,
  getPermission,
  getNoteInDayandMonth
};
