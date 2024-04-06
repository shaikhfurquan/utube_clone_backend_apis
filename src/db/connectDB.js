import mongoose from "mongoose";

const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URL}${process.env.DB_NAME}`)
        console.log(`connected to DB successully ==> ${process.env.MONGO_URL}${process.env.DB_NAME}`);
        // console.log(connectionInstance);
    } catch (error) {
        console.log(`Error while connecting to Mongo DB: \n ${error.message}`);
        // terminate the app if there is an error in connection 
        process.exit(1); 
    }
}

export default connectDB    