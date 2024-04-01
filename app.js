import express from 'express';
import dotenv from 'dotenv'
import connectDB from './db/connectDB.js';

dotenv.config({
    path: './.env'
})

const app = express();



// Database connection
connectDB()

app.listen(process.env.PORT , ()=>{
    console.log(`App running on ${process.env.PORT}`)
})