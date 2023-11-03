const cloudinary = require("../../middlewares/cloudinary")
const fs = require("fs")

const uploadSingleImage = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            let image = ""
            console.log(1);
            if (req.files && req.files.image && req.files.image[0]) {
                console.log(2);
                image = req.files.image[0]
                console.log(3);
            }
            console.log(4, image, "img");
            let urls = {}
            console.log(5);
            if (image != null && image != undefined && image != "") {
                console.log(6);
                const { path } = image
                console.log(7);
                console.log(path, " this is path")
                const newPath = await cloudinary.uploadImage(path)
                console.log(8);
                fs.unlinkSync(path)
                console.log(9);
                urls = ({newPath})
                console.log(10);
            }
            console.log(11);
            req.urls = urls
            console.log(12);
            resolve(req)
            console.log(13);
        } catch (error) {
            console.log(error, "2")
            reject(error.message)
        }
    })
}

module.exports = { uploadSingleImage }