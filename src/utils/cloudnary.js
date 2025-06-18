import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

   // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLODINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });


    const uploadOnCloudinary = async (filePath) => {
        try{
            if(!filePath) return null;
            //upload the file of on cloudnary
        const response = await  cloudinary.uploader.upload(filePath, {
                resource_type: "auto",
            })
            //file is upload on cludnary,
            console.log("File uploded to Cloudinary:", filePath);
            return response
        }
        catch(error){
            console.log(error)
          fs.unlinkSync(filePath);//remove localy saved temp file as the upload temporary file got failked
          return null;
    }}
     export {uploadOnCloudinary}