import dotenv from 'dotenv'
import connectDB from './db/connectDB.js';
import { app } from './app.js'

dotenv.config({
    path: './.env'
})




// Database connection
connectDB()

app.listen(process.env.PORT, () => {
    console.log(`App running on ${process.env.PORT}`)
}) 