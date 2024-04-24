const multer  = require('multer');
const { mkdirp } = require("mkdirp");
const uploadFile = (type) =>{

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, process.env.NODE_ENV === 'production' ? '/usr/src/app/public/film' : 'public/film');
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now()
            cb(null,uniqueSuffix  + '-' + file.originalname)
        }
    })
    const upload = multer({ storage: storage,fileFilter : function (req,file,cb){
        let extensionImgList;
        if(type ==="img"){
            extensionImgList = [".jpg",".png"];
        }
        if(type === "src"){
            extensionImgList = [".mp4"]
        }
        if(type === "trailer"){
            extensionImgList = [".mp4"]
        }
        const extension = file.originalname.slice(-4);
        const check = extensionImgList.includes(extension);
        if(check){
            cb(null,true)
        }else{
            cb(new Error("Đuôi file không hợp lệ"))
        }
    } })
    return upload.single(type)
}

module.exports = {
    uploadFile
}