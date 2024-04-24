const multer = require("multer");
const { mkdirp } = require("mkdirp");

const uploadVideo = () => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      console.log("file",file);
      cb(null, process.env.NODE_ENV === 'production' ? '/usr/src/app/public/film' : 'public/film');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });
  const uploadStorage = multer({ storage: storage });
  
  return uploadStorage.fields(
    [
      { name: 'src'},
      { name: 'img'},
      { name: 'trailer'}
    ]
  );
};

module.exports = {
  uploadVideo,
};
