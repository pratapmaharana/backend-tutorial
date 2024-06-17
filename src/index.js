// require ('dotenv').config({path: './.env'})
import dotenv from 'dotenv'

import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import express from "express";
import connectDB from './db/index.js';

dotenv.config({
    path: './.env'
})



connectDB().then(() => {
    app.listen(process.env.PORT || 8000, () => console.log("Listening on port", process.env.PORT))
})


// const app = express();

// ; (async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on('error', (e) => {
//             console.log("ERROR:", e)
//             throw e
//         })
//         app.listen(process.env.PORT, () => console.log("Listening on port", process.env.PORT))
//     } catch (e) {
//         console.error("ERROR:", e)
//         throw e
//     }
// })()