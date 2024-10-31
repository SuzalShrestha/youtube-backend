import { UploadApiResponse, v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (localFilePath: string | undefined) => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        if (!localFilePath) return null;
        //upload the file on cloudinary
        const response: UploadApiResponse = await cloudinary.uploader.upload(
            localFilePath,
            {
                resource_type: "auto",
            }
        );
        // file has been uploaded successfull
        console.log("File is uploaded on cloudinary ", response.url);
        return response;
    } finally {
        if (localFilePath) {
            if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        }
    }
};

export { uploadOnCloudinary };
