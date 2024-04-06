import { v2 as cloudinary } from "cloudinary"
import fs from 'fs'
import dotenv from 'dotenv'
dotenv.config()


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        console.log(localFilePath);
        if (!localFilePath) return null
        // console.log('uploading cloudinary local path==>' , localFilePath );

        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        // file has been uploaded successfully 
        // console.log(`Image uploaded to Cloudinary response: ${response}`)
        // console.log(`Image uploaded to Cloudinary: ${response.url}`)

        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        // removing the locally saved file as the upload operation got failed
        fs.unlinkSync(localFilePath)
        console.log(error);
        return null
    }
}

export { uploadOnCloudinary }