import express from 'express';
import dotenv from 'dotenv'

dotenv.config({
    path: './.env'
})

const app = express();




app.listen(process.env.PORT , ()=>{
    console.log(`App running on ${process.env.PORT}`)
})