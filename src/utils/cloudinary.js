import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET // Click 'View Credentials' below to copy your API secret
});

const uploadOnCloudinary = async (localfilepath) =>{
    try {
        if(!localfilepath) return null
            const response = await cloudinary.uploader.upload(localfilepath, {
                resource_type: "auto",
            })
            console.log("file uploaded successfuly", response.url);
            return response
            
        
    } catch (error) {
        fs.unlinkSync(localfilepath); //remove file from server
        return null
    }
}


// await cloudinary.uploader
// .upload(
//     'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//         public_id: 'shoes',
//     }
// )
// .catch((error) => {
//     console.log(error);
// });

export {uploadOnCloudinary}