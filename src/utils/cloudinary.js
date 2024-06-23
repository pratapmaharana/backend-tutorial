import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})


const uploadOnCloudinary = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto"
        })
        fs.unlinkSync(filePath) // delete local saved temp file
        return {
            url: result.secure_url
        }
    } catch (err) {
        fs.unlinkSync(filePath)
        return null
    }
}

export { uploadOnCloudinary }