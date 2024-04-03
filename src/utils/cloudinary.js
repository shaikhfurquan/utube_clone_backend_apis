import cloudinary from "cloudinary"
import fs from 'fs'

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        // upload the file on cloudinary
        const response = await cloudinary.v2.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        // file has been uploaded successfully 
        console.log(`Image uploaded to Cloudinary: ${response.url}`)
        return response
    } catch (error) {
        // removing the locally saved file as the upload operation got failed
        fs.unlinkSync(localFilePath)
    }
}

export { uploadOnCloudinary }