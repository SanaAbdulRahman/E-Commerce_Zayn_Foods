const cloudinary = require("../../middlewares/cloudinary")
const fs = require("fs")

const uploadImage = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            let filesMap = new Map();
            if (req.files && req.files.productImage1 && req.files.productImage1[0]) {
                filesMap.set("productImage1", req.files.productImage1[0])
            }
            if (req.files && req.files.productImage2 && req.files.productImage2[0]) {
                filesMap.set("productImage2", req.files.productImage2[0])
            }
            if (req.files && req.files.productImage3 && req.files.productImage3[0]) {
                filesMap.set("productImage3", req.files.productImage3[0])
            }
            console.log(filesMap.size, "this is files size");
            let urls = new Map();
            if (filesMap && filesMap.size > 0) {
                console.log(filesMap, "files")
                if (filesMap.has("productImage1")) {
                    const { path } = filesMap.get("productImage1")
                    const newPath = await cloudinary.uploadImage(path)
                    console.log(newPath, "newpath 1")
                    fs.unlinkSync(path)
                    urls.set("productImage1", newPath)
                }
                if (filesMap.has("productImage2")) {
                    const { path } = filesMap.get("productImage2")
                    const newPath = await cloudinary.uploadImage(path)
                    console.log(newPath, "newpath 2")
                    fs.unlinkSync(path)
                    urls.set("productImage2", newPath)
                }
                if (filesMap.has("productImage3")) {
                    const { path } = filesMap.get("productImage3")
                    const newPath = await cloudinary.uploadImage(path)
                    console.log(newPath, "newpath 3")
                    fs.unlinkSync(path)
                    urls.set("productImage3", newPath)
                }
            }
            req.urls = urls
            resolve(req)
        } catch (error) {
            console.log(error, "2")
            reject(error.message)
        }
    })
}

module.exports = { uploadImage }