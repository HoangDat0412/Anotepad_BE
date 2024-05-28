const {
  Notes,
  NoteContents,
  TaskLists,
  AccessNotes,
  Comments,
  sequelize,
} = require("../models");
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

      if(req.body.TaskList){
      const TaskList = req.body.TaskList;
      const newTaskList = JSON.stringify(TaskList);
      const tasklist = await TaskLists.create({
        note_id: newNote.id,
        content: newTaskList,
      });
      }


      res.status(201).send({
        note: newNote
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
    res.status(500).send(error);
  }
};

const getNote = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const note = await Notes.findOne({
      where: {
        id,
        deletenote:false
      },
    });
    if(!note){
      res.status(404).send("Not found note")
    }
    let content;

    if (note.note_type === "TaskList") {
      let taskList = await TaskLists.findOne({
        where: {
          note_id: note.id,
        },
      });
      content = JSON.parse(taskList.content);
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
          id: note.id,
          title: note.title,
          note_type: note.note_type,
          folder_id: note.folder_id,
          user_id: note.user_id,
          status: note.status,
          highlight:note.highlight
        },
        content: content,
      });
    } else if (note.status === "private") {
      if (note.user_id !== req.user.id) {
        res.status(401).send("You not have access");
      } else {
        res.status(200).send({
          note: {
            id: note.id,
            title: note.title,
            note_type: note.note_type,
            folder_id: note.folder_id,
            user_id: note.user_id,
            status: note.status,
            highlight:note.highlight
          },
          content: content,
        });
      }
    } else if (note.status === "protected") {
      const listAccess = await AccessNotes.findAll({
        where: {
          note_id: id,
        },
      });
      const index = listAccess.findIndex(
        (item) => item.user_id === req.user.id
      );
      if (index > -1) {
        res.status(200).send({
          note: {
            id: note.id,
            title: note.title,
            note_type: note.note_type,
            folder_id: note.folder_id,
            user_id: note.user_id,
            status: note.status,
            highlight:note.highlight
          },
          content: content,
        });
      } else {
        res.status(200).send({
          note: {
            user_id: note.user_id,
            status: note.status,
          },
        });
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

const getAllNote = async (req, res) => {
  try {
    const notes = await sequelize.query(
      `select id,title,note_type,folder_id,user_id,status,createdAt from Notes where user_id=${req.user.id} and deletenote=false`
    );

    if (notes[0].length > 0) {
      res.status(200).send({
        notes:notes[0],
        folder:{
          name:"All Note",
          id:0
        }
      });
    } else {
      res.status(200).send({
        notes:[],
        folder:{
          name:"All Note",
          id:0
        }
      });
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
      if (req.user.id === req.note_user_id) {
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
      } else {
        await Notes.update(
          {
            title,
          },
          {
            where: {
              id,
            },
          }
        );
      }

      const TaskList = req.body.content;
      const newTaskList = JSON.stringify(TaskList);
      await TaskLists.update(
        {
          content: newTaskList,
        },
        {
          where: {
            note_id: id,
          },
        }
      );

      res.status(200).send("update success");
    } else {
      if (req.user.id === req.note_user_id) {
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
        await NoteContents.update(
          {
            content: req.body.content,
          },
          {
            where: {
              note_id: id,
            },
          }
        );
        res.status(200).send("update success");
      } else {
        await Notes.update(
          {
            title,
          },
          {
            where: {
              id,
            },
          }
        );
        await NoteContents.update(
          {
            content: req.body.content,
          },
          {
            where: {
              note_id: id,
            },
          }
        );

        res.status(200).send("update success");
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
};
// return note 
const ReturnNote = async (req,res) =>{
  const note_id = parseInt(req.params.id);
  const user_id = req.user.id;
  try {
    const note = await Notes.findOne({
      where: {
        id: note_id,
      },
    });
    if (note) {
      if (note.user_id === user_id) {
        await Notes.update({
          deletenote:false,
        },{
          where: {
            id:note_id,
          },
        });
        res.status(200).send("Return note success");
      } else {
        res.status(401).send("You don't have access");
      }
    } else {
      res.status(404).send("not found note");
    }
  } catch (error) {
    res.status(500).send(error);
  }
}
// delete in trash
const deleteNote = async (req, res) => {
  const note_id = parseInt(req.params.id);
  const user_id = req.user.id;
  try {
    const note = await Notes.findOne({
      where: {
        id: note_id,
      },
    });
    if (note) {
      if (note.user_id === user_id) {
        await AccessNotes.destroy({
          where: {
            note_id,
          },
        });
        await Comments.destroy({
          where: {
            note_id,
          },
        });
        if (note.note_type === "TaskList") {
          await TaskLists.destroy({
            where: {
              note_id,
            },
          });
        } else {
          await NoteContents.destroy({
            where: {
              note_id,
            },
          });
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
    } else {
      res.status(404).send("not found note");
    }
  } catch (error) {
    res.status(500).send(error);
  }
};
// delete note
const SetNoteIsDelete = async (req,res) =>{
  const note_id = parseInt(req.params.id);
  const user_id = req.user.id;
  try {
    const note = await Notes.findOne({
      where: {
        id: note_id,
      },
    });
    if (note) {
      if (note.user_id === user_id) {
        await Notes.update({
          deletenote:true,
          highlight:false
        },{
          where: {
            id:note_id,
          },
        });
        res.status(200).send("Delete success");
      } else {
        res.status(401).send("You don't have access");
      }
    } else {
      res.status(404).send("not found note");
    }
  } catch (error) {
    res.status(500).send(error);
  }
}

// get list note is delete note
const getListNoteIsDelete = async (req, res) => {
  try {
    const notes = await sequelize.query(
      `select id,title,note_type,folder_id,user_id,status,createdAt from Notes where user_id=${req.user.id} and deletenote=true`
    );

    if (notes[0].length > 0) {
      res.status(200).send(
        notes[0]
      );
    } else {
      res.status(404).send("Not found")
    }
  } catch (error) {
    res.status(500).send(error)
  }
};

const searchNote = async (req, res) => {
  const user_id = req.user.id;
  const name = req.params.name;
  try {
    const notes = await Notes.findAll({
      where: {
        title: {
          [Op.like]: `%${name}%`, //
        },
        user_id,
        deletenote:false
      },
    });

    if (notes.length > 0) {
      res.status(200).send(notes);
    } else {
      res.status(404).send("not found");
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

const getNoteInDayandMonth = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59
    );

    const notesToday = await Notes.findAll({
      where: {
        createdAt: {
          [Op.between]: [startOfDay, endOfDay],
        },
        user_id: req.user.id,
        deletenote:false
      },
    });
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const notesMonth = await Notes.findAll({
      where: {
        createdAt: {
          [Op.between]: [oneMonthAgo, startOfDay],
        },
        user_id: req.user.id,
        deletenote:false
      },
    });

    res.status(200).send({
      notesToday: notesToday,
      notesMonth: notesMonth,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// Break

const getNotes = async (req, res) => {
  try {
    const notes = await Notes.findAll();
    if (notes) {
      res.status(200).send({
        notes: notes,
        notes_length: notes.length,
      });
    } else {
      res.status(404).send("Not found");
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

const editNote = async (req, res) => {
  const { password_edit, note_id } = req.body;
  const user_id = req.user.id;
  try {
    const note = await Notes.findOne({
      where: {
        id: note_id,
      },
    });
    if (note) {
      if (note.user_id === user_id) {
        res.status(200).send("You have all permission");
      }

      if (note.status === "public") {
        res.status(401).send("You do not have edit permission");
      } else if (note.status === "private") {
        res.status(401).send("You do not have edit permission");
      } else if (note.status === "protected") {
        if (note.password_edit === password_edit) {
          const accnote = await AccessNotes.findOne({
            where: {
              note_id,
              user_id,
            },
          });
          if (accnote) {
            accnote.permission = "EDIT";
            await accnote.save();
            res.status(200).send("EDIT permission success !");
          } else {
            const newAccessNote = await AccessNotes.create({
              note_id,
              user_id,
              permission: "EDIT",
            });

            res.status(201).send(newAccessNote);
          }
        } else {
          res.status(400).send("wrong password");
        }
      }
    } else {
      res.status(404).send("Not found the note");
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

const getPermission = async (req, res) => {
  const note_id = parseInt(req.params.id);
  const user_id = req.user.id;
  try {
    const permission = await AccessNotes.findOne({
      where: {
        note_id,
        user_id,
      },
    });
    if (permission) {
      res.status(200).send(permission);
    } else {
      res.status(401).send("You don't have access");
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

const accNote = async (req, res) => {
  const { password_access, note_id } = req.body;
  const user_id = req.user.id;
  try {
    const note = await Notes.findOne({
      where: {
        id: note_id,
      },
    });
    if (note) {
      if (note.user_id === user_id) {
        res.status(200).send("You have all access");
      }

      if (note.status === "public") {
        res.status(200).send("Access success");
      } else if (note.status === "private") {
        res.status(401).send("You do not have access !");
      } else if (note.status === "protected") {
        if (note.password_access === password_access) {
          const accnote = await AccessNotes.findOne({
            where: {
              note_id,
              user_id,
            },
          });
          if (accnote) {
            res.status(200).send("ACCESS permission success !");
          } else {
            const newAccessNote = await AccessNotes.create({
              note_id,
              user_id,
              permission: "ACCESS",
            });
            res.status(201).send(newAccessNote);
          }
        } else {
          res.status(400).send("wrong password");
        }
      }
    } else {
      res.status(404).send("Not found the note");
    }
  } catch (error) {
    res.status(500).send(error);
  }
};




const setNoteHighLight = async (req, res) => {
  const note_id = parseInt(req.params.id);
  const user_id = req.user.id;
  try {
    const note = await Notes.findOne({
      where: {
        id: note_id,
      },
    });
    if (note.user_id === user_id) {
      note.highlight = !note.highlight;
      await note.save();
      res.status(200).send("Success");
    } else {
      res.status(401).send("You do not have access");
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

const getListNoteHighLight = async (req, res) => {
  const user_id = req.user.id;

  try {
    const listNote = await Notes.findAll({
      where: {
        user_id: user_id,
        highlight: true,
      },
    });
    if (listNote.length > 0) {
      res.status(200).send(listNote);
    } else {
      res.status(404).send("Not found");
    }
  } catch (error) {
    res.status(500).send(error);
  }
};



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
  getNoteInDayandMonth,
  setNoteHighLight,
  getListNoteHighLight,
  searchNote,
  SetNoteIsDelete,
  ReturnNote,
  getListNoteIsDelete
};
