const path = require('path')
const multer = require('multer')
const fs = require('fs')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const directory = 'public/uploads'
        if(!fs.existsSync(directory)){
            fs.mkdirSync(directory)
        }
        cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
    }
})
const filter = (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
        cb(null, true);
    } else {
        cb(null, false);
        return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
}

const upload = multer({ storage: storage, fileFilter: filter }).fields([{ name: "productImage1", maxCount: 2 }, { name: "productImage2", maxCount: 2 }, { name: "productImage3", maxCount: 2 }])
module.exports = upload;

