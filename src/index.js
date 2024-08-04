// require('dotenv').config();
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./db/index.js";
import { app } from "./app.js";


// const app = express();

dotenv.config();

connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("Error");
        throw error
    })
    app.listen(`${process.env.PORT || 8000}`,()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    })
})
.catch(error=>{
    console.log("Mongo app connection fail !!!",error);
})