import dotenv from 'dotenv'
import connectDB from './db/connectDB.js';
import { app } from './app.js'

dotenv.config({
    path: './.env'
})




// Database connection
connectDB()

// server running on port
app.listen(process.env.PORT || 8000, () => {
    console.log(`App running on ${process.env.PORT}`)
}) 