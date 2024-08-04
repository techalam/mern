import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";


export const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGOURI}/${DB_NAME}`)
        console.log(`Mongo DB connected !! DB Host:${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("Mongo DB connection error", error);
        process.exit(1);  
    }
    
}
